import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";
import { hashPassword } from "@/lib/password";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID akun tidak valid." }, { status: 400 });
  }

  if (id.startsWith("builtin-")) {
    return NextResponse.json(
      { error: "Akun sistem bawaan tidak dapat diubah statusnya melalui manajemen portal." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data pembaruan tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Data pembaruan tidak valid." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;

  try {
    // 1. Cek keberadaan akun
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, email, name, role, approval_status FROM portal_accounts WHERE id = ? LIMIT 1",
      [id]
    );
    const existing = rows[0];
    if (!existing) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    // Ubah status (Aktifkan / Nonaktifkan)
    if (typeof payload.status === "string" && ["approved", "inactive", "pending", "rejected"].includes(payload.status)) {
      updates.push("approval_status = ?");
      values.push(payload.status);
    }

    // Ubah password (Reset Password)
    if (typeof payload.password === "string" && payload.password.trim()) {
      if (payload.password.length < 5) {
        return NextResponse.json({ error: "Kata sandi baru minimal 5 karakter." }, { status: 400 });
      }
      const newHash = await hashPassword(payload.password);
      updates.push("password_hash = ?");
      values.push(newHash);
    }

    // Ubah data lain jika disediakan
    if (typeof payload.name === "string" && payload.name.trim()) {
      updates.push("name = ?");
      values.push(payload.name.trim());
    }

    if (typeof payload.role === "string" && payload.role.trim()) {
      updates.push("role = ?");
      values.push(payload.role.trim());
    }

    if (typeof payload.grade === "string") {
      updates.push("grade = ?");
      values.push(payload.grade.trim() || null);
    }

    if (typeof payload.subject === "string") {
      updates.push("subject = ?");
      values.push(payload.subject.trim() || null);
    }

    if (typeof payload.phone === "string") {
      updates.push("phone = ?");
      values.push(payload.phone.trim() || null);
    }

    if (typeof payload.nis === "string") {
      updates.push("nis = ?");
      values.push(payload.nis.trim() || null);
    }

    if (typeof payload.studentId === "string") {
      updates.push("student_id = ?");
      values.push(payload.studentId.trim() || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: "Tidak ada data yang diperbarui." });
    }

    values.push(id);
    await pool.execute<ResultSetHeader>(
      `UPDATE portal_accounts SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: "Data akun berhasil diperbarui.",
    });
  } catch (error) {
    return databaseErrorResponse(error, "update user account");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID akun tidak valid." }, { status: 400 });
  }

  if (id.startsWith("builtin-")) {
    return NextResponse.json(
      { error: "Akun sistem bawaan tidak dapat dihapus." },
      { status: 403 }
    );
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM portal_accounts WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Akun tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus dari sistem.",
    });
  } catch (error) {
    return databaseErrorResponse(error, "delete user account");
  }
}

