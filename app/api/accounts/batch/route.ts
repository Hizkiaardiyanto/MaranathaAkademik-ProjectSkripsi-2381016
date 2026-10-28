import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";
import { hashPassword } from "@/lib/password";
import { getAuthAccounts } from "@/lib/auth-accounts";

type BatchAccountInput = {
  name: string;
  email: string;
  role?: string;
  password?: string;
  nis?: string;
  nip?: string;
  grade?: string;
  subject?: string;
  status?: string;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data batch akun tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("accounts" in body) || !Array.isArray((body as Record<string, unknown>).accounts)) {
    return NextResponse.json({ error: "Harus menyertakan array 'accounts'." }, { status: 400 });
  }

  const accounts = (body as { accounts: BatchAccountInput[] }).accounts;
  if (accounts.length === 0) {
    return NextResponse.json({ error: "Tidak ada data akun yang diimpor." }, { status: 400 });
  }

  try {
    // 1. Ambil semua email yang sudah ada
    const [existingRows] = await pool.execute<RowDataPacket[]>("SELECT email FROM portal_accounts");
    const existingEmails = new Set(existingRows.map((r) => String(r.email).toLowerCase()));
    
    // Built-in accounts
    const builtIn = await getAuthAccounts();
    for (const b of builtIn) {
      existingEmails.add(b.email.toLowerCase());
      (b.aliases || []).forEach((a) => existingEmails.add(a.toLowerCase()));
    }

    // 2. Ambil master siswa untuk auto-linking NIS -> student_id
    const [studentRows] = await pool.execute<RowDataPacket[]>("SELECT id, nis FROM students");
    const studentNisMap = new Map<string, string>();
    studentRows.forEach((s) => {
      if (s.nis) studentNisMap.set(String(s.nis).trim(), String(s.id));
    });

    let successCount = 0;
    const skippedList: Array<{ email: string; reason: string }> = [];

    for (const item of accounts) {
      const email = typeof item.email === "string" ? item.email.trim().toLowerCase() : "";
      const name = typeof item.name === "string" ? item.name.trim() : "";
      
      if (!email || !name) {
        skippedList.push({ email: email || "(tanpa email)", reason: "Nama dan email wajib diisi." });
        continue;
      }

      if (existingEmails.has(email)) {
        skippedList.push({ email, reason: "Email sudah terdaftar." });
        continue;
      }

      const role = item.role && ["Siswa", "Guru", "Administrator", "Kepala Sekolah"].includes(item.role.trim())
        ? item.role.trim()
        : "Siswa";

      const rawPassword = item.password?.trim() || item.nis?.trim() || item.nip?.trim() || "123456";
      const passwordHash = await hashPassword(rawPassword);

      const nis = item.nis?.trim() || null;
      let studentId: string | null = null;
      if (role === "Siswa" && nis && studentNisMap.has(nis)) {
        studentId = studentNisMap.get(nis) || null;
      }

      const status = item.status && ["approved", "inactive", "pending"].includes(item.status)
        ? item.status
        : "approved";

      await pool.execute(
        `INSERT INTO portal_accounts 
         (email, password_hash, role, name, grade, subject, nis, student_id, approval_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email,
          passwordHash,
          role,
          name,
          item.grade?.trim() || null,
          item.subject?.trim() || null,
          nis,
          studentId,
          status,
        ]
      );

      existingEmails.add(email);
      successCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${successCount} akun. ${skippedList.length > 0 ? `${skippedList.length} akun dilewati (duplikat/tidak lengkap).` : ""}`,
      importedCount: successCount,
      skippedCount: skippedList.length,
      skippedDetails: skippedList,
    });
  } catch (error) {
    return databaseErrorResponse(error, "batch import accounts");
  }
}

