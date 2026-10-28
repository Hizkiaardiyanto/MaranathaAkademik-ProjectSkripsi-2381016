import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import pool from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";
import { hashPassword } from "@/lib/password";
import { getAuthAccounts } from "@/lib/auth-accounts";

type AccountRow = RowDataPacket & {
  id: number | string;
  email: string;
  role: string;
  name: string;
  grade: string | null;
  subject: string | null;
  phone: string | null;
  nis: string | null;
  nisn: string | null;
  approval_status: "pending" | "approved" | "rejected" | "inactive";
  student_id: string | null;
  created_at: Date | string | null;
  student_name?: string | null;
  student_nis?: string | null;
  student_class?: string | null;
};

export async function GET() {
  try {
    // 1. Ambil akun dari portal_accounts yang digabung dengan data master siswa
    const [rows] = await pool.execute<AccountRow[]>(
      `SELECT 
        pa.id, pa.email, pa.role, pa.name, pa.grade, pa.subject, pa.phone, pa.nis, pa.nisn, 
        pa.approval_status, pa.student_id, pa.created_at,
        s.name AS student_name, s.nis AS student_nis, s.class_name AS student_class
       FROM portal_accounts pa
       LEFT JOIN students s ON pa.student_id = s.id
       ORDER BY pa.created_at DESC, pa.id DESC`
    );

    // 2. Ambil akun bawaan (Admin / Kepala Sekolah)
    const builtIn = await getAuthAccounts();

    const portalAccounts = rows.map((row) => ({
      id: String(row.id),
      email: row.email,
      name: row.name,
      role: row.role,
      status: row.approval_status,
      grade: row.grade || row.student_class || "",
      subject: row.subject || "",
      phone: row.phone || "",
      nis: row.nis || row.student_nis || "",
      nisn: row.nisn || "",
      studentId: row.student_id || "",
      studentName: row.student_name || "",
      isBuiltIn: false,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    }));

    // Tambahkan built-in accounts jika belum ada di portal_accounts
    for (const b of builtIn) {
      const exists = portalAccounts.some((p) => p.email.toLowerCase() === b.email.toLowerCase());
      if (!exists) {
        portalAccounts.unshift({
          id: `builtin-${b.email}`,
          email: b.email,
          name: b.name || (b.role === "Administrator" ? "Admin Sekolah" : b.role),
          role: b.role,
          status: "approved" as const,
          grade: b.grade || "",
          subject: b.subject || "",
          phone: "",
          nis: "",
          nisn: "",
          studentId: "",
          studentName: "",
          isBuiltIn: true,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ accounts: portalAccounts });
  } catch (error) {
    return databaseErrorResponse(error, "list user accounts");
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data akun tidak valid." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Data akun tidak valid." },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const role = typeof payload.role === "string" ? payload.role.trim() : "Siswa";
  const status = typeof payload.status === "string" && ["approved", "inactive", "pending"].includes(payload.status)
    ? payload.status
    : "approved";
  const studentId = typeof payload.studentId === "string" && payload.studentId.trim() ? payload.studentId.trim() : null;
  const grade = typeof payload.grade === "string" ? payload.grade.trim() : null;
  const subject = typeof payload.subject === "string" ? payload.subject.trim() : null;
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : null;
  const nis = typeof payload.nis === "string" ? payload.nis.trim() : null;
  const nisn = typeof payload.nisn === "string" ? payload.nisn.trim() : null;

  if (!email || !name) {
    return NextResponse.json(
      { error: "Nama dan Email wajib diisi." },
      { status: 400 },
    );
  }

  if (!password || password.length < 5) {
    return NextResponse.json(
      { error: "Kata sandi minimal 5 karakter." },
      { status: 400 },
    );
  }

  // Cek duplikat di built-in
  const builtIn = await getAuthAccounts();
  const isBuiltIn = builtIn.some(
    (b) => b.email.toLowerCase() === email || (b.aliases || []).some((a) => a.toLowerCase() === email)
  );
  if (isBuiltIn) {
    return NextResponse.json(
      { error: `Email ${email} merupakan akun sistem bawaan dan tidak dapat didaftarkan ulang.` },
      { status: 409 },
    );
  }

  try {
    // Cek duplikat di database
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM portal_accounts WHERE email = ? LIMIT 1",
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Akun dengan email ${email} sudah terdaftar.` },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO portal_accounts 
       (email, password_hash, role, name, grade, subject, phone, nis, nisn, student_id, approval_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, role, name, grade, subject, phone, nis, nisn, studentId, status]
    );

    return NextResponse.json({
      success: true,
      message: `Akun ${name} (${email}) berhasil dibuat.`,
      account: {
        id: String(result.insertId),
        email,
        name,
        role,
        status,
        grade: grade || "",
        subject: subject || "",
        phone: phone || "",
        nis: nis || "",
        nisn: nisn || "",
        studentId: studentId || "",
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return databaseErrorResponse(error, "create user account");
  }
}

