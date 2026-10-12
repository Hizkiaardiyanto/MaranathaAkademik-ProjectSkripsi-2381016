import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

type PendingRegistrationRow = RowDataPacket & {
  email: string;
  name: string;
  grade: string | null;
  parent_name: string | null;
  phone: string | null;
  registration_id: string | null;
  nis: string | null;
  nisn: string | null;
  gender: "L" | "P" | null;
  created_at: Date;
};

export async function GET() {
  try {
    const [rows] = await pool.execute<PendingRegistrationRow[]>(
      "SELECT email, name, grade, parent_name, phone, registration_id, nis, nisn, gender, created_at FROM portal_accounts WHERE role = 'Siswa' AND approval_status = 'pending' ORDER BY created_at ASC",
    );
    const [linkedRows] = await pool.execute<RowDataPacket[]>(
      "SELECT student_id FROM portal_accounts WHERE role = 'Siswa' AND student_id IS NOT NULL",
    );
    return NextResponse.json({
      registrations: rows.map((row) => ({
        email: row.email,
        name: row.name,
        grade: row.grade,
        parentName: row.parent_name,
        phone: row.phone,
        registrationId: row.registration_id,
        nis: row.nis,
        nisn: row.nisn,
        gender: row.gender,
        createdAt: row.created_at,
      })),
      linkedStudentIds: linkedRows.map((row) => String(row.student_id)),
    });
  } catch (error) {
    return databaseErrorResponse(error, "list student registrations");
  }
}

export async function PATCH(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data verifikasi tidak valid." },
      { status: 400 },
    );
  }
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input).some((key) =>
      !["email", "studentId", "createStudent"].includes(key),
    )
  ) {
    return NextResponse.json(
      { error: "Data verifikasi tidak valid." },
      { status: 400 },
    );
  }
  const payload = input as Record<string, unknown>;
  const email =
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
  const studentId =
    typeof payload.studentId === "string" ? payload.studentId.trim() : "";
  const createStudent = payload.createStudent === true;
  if (!email || (!createStudent && !studentId)) {
    return NextResponse.json(
      { error: "Email pendaftar dan data induk siswa wajib dipilih." },
      { status: 400 },
    );
  }

  let connection: Awaited<ReturnType<typeof pool.getConnection>> | undefined;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [accounts] = await connection.execute<PendingRegistrationRow[]>(
      "SELECT email, name, grade, parent_name, phone, registration_id, nis, nisn, gender, created_at FROM portal_accounts WHERE email = ? AND role = 'Siswa' AND approval_status = 'pending' FOR UPDATE",
      [email],
    );
    const account = accounts[0];
    if (!account) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan atau sudah diproses." },
        { status: 409 },
      );
    }
    let approvedStudentId = studentId;
    if (createStudent) {
      if (!account.grade || !account.nis || !account.nisn || !account.gender) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Data pendaftaran lama belum memiliki NIS, NISN, dan jenis kelamin. Pilih data induk siswa yang sudah ada." },
          { status: 400 },
        );
      }
      const [duplicates] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM students WHERE nis = ? OR nisn = ? LIMIT 1",
        [account.nis, account.nisn],
      );
      if (duplicates.length) {
        await connection.rollback();
        return NextResponse.json(
          { error: "NIS atau NISN pendaftar sudah digunakan. Pilih data induk yang tersedia untuk menautkan akun ini." },
          { status: 409 },
        );
      }
      approvedStudentId = randomUUID();
      await connection.execute(
        "INSERT INTO students (id, name, nis, nisn, class_name, gender, status) VALUES (?, ?, ?, ?, ?, ?, 'Baru')",
        [approvedStudentId, account.name, account.nis, account.nisn, account.grade, account.gender],
      );
    } else {
      const [students] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM students WHERE id = ? LIMIT 1",
        [studentId],
      );
      if (!students.length) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Data induk siswa tidak ditemukan." },
          { status: 404 },
        );
      }
    }
    const [result] = await connection.execute<ResultSetHeader>(
      "UPDATE portal_accounts SET student_id = ?, approval_status = 'approved', grade = (SELECT class_name FROM students WHERE id = ?) WHERE email = ? AND role = 'Siswa' AND approval_status = 'pending'",
      [approvedStudentId, approvedStudentId, email],
    );
    if (!result.affectedRows) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan atau sudah diproses." },
        { status: 409 },
      );
    }
    await connection.commit();
    return NextResponse.json({ message: "Akun siswa berhasil diverifikasi." });
  } catch (error) {
    if (connection) await connection.rollback();
    return databaseErrorResponse(
      error,
      "approve student registration",
      "Siswa tersebut sudah ditautkan dengan akun lain.",
    );
  } finally {
    connection?.release();
  }
}
