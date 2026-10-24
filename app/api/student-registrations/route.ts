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
  const rawStudentId =
    typeof payload.studentId === "string" ? payload.studentId.trim() : "";
  const isCreateStudent =
    payload.createStudent === true ||
    rawStudentId === "__create__" ||
    !rawStudentId;
  const studentId = isCreateStudent ? "" : rawStudentId;

  if (!email) {
    return NextResponse.json(
      { error: "Email pendaftar wajib diisi." },
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
    let finalGrade = account.grade ? account.grade.trim() : "Kelas 1";
    let finalNis = account.nis ? account.nis.trim() : "";
    let finalNisn = account.nisn ? account.nisn.trim() : "";
    let finalGender: "L" | "P" = account.gender === "P" ? "P" : "L";

    if (isCreateStudent) {
      if (/^\d+$/.test(finalGrade)) {
        finalGrade = `Kelas ${finalGrade}`;
      }

      if (!finalNis) {
        let candidateNis = "";
        let isUnique = false;
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 20; i++) {
          const rand = String(Math.floor(1000 + Math.random() * 9000));
          candidateNis = `${currentYear}${rand}`;
          const [dup] = await connection.execute<RowDataPacket[]>(
            "SELECT id FROM students WHERE nis = ? LIMIT 1",
            [candidateNis],
          );
          if (!dup.length) {
            isUnique = true;
            break;
          }
        }
        finalNis = isUnique ? candidateNis : `NIS-${randomUUID().slice(0, 8).toUpperCase()}`;
      } else {
        const [dup] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM students WHERE nis = ? LIMIT 1",
          [finalNis],
        );
        if (dup.length) {
          finalNis = `${finalNis}-${Math.floor(10 + Math.random() * 90)}`;
        }
      }

      if (!finalNisn) {
        let candidateNisn = "";
        let isUnique = false;
        for (let i = 0; i < 20; i++) {
          const rand = String(Math.floor(10000000 + Math.random() * 90000000));
          candidateNisn = `00${rand}`;
          const [dup] = await connection.execute<RowDataPacket[]>(
            "SELECT id FROM students WHERE nisn = ? LIMIT 1",
            [candidateNisn],
          );
          if (!dup.length) {
            isUnique = true;
            break;
          }
        }
        finalNisn = isUnique ? candidateNisn : `00${Math.floor(10000000 + Math.random() * 90000000)}`;
      } else {
        const [dup] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM students WHERE nisn = ? LIMIT 1",
          [finalNisn],
        );
        if (dup.length) {
          finalNisn = `${finalNisn.slice(0, 8)}${Math.floor(10 + Math.random() * 90)}`;
        }
      }

      approvedStudentId = randomUUID();
      await connection.execute(
        "INSERT INTO students (id, name, nis, nisn, class_name, gender, status) VALUES (?, ?, ?, ?, ?, ?, 'Aktif')",
        [
          approvedStudentId,
          account.name.trim(),
          finalNis,
          finalNisn,
          finalGrade,
          finalGender,
        ],
      );
    } else {
      const [students] = await connection.execute<RowDataPacket[]>(
        "SELECT id, class_name, nis, nisn, gender FROM students WHERE id = ? LIMIT 1",
        [studentId],
      );
      if (!students.length) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Data induk siswa tidak ditemukan." },
          { status: 404 },
        );
      }
      const existing = students[0];
      finalGrade = existing.class_name;
      finalNis = existing.nis;
      finalNisn = existing.nisn;
      finalGender = existing.gender;
    }

    const [result] = await connection.execute<ResultSetHeader>(
      "UPDATE portal_accounts SET student_id = ?, approval_status = 'approved', grade = ?, nis = COALESCE(nis, ?), nisn = COALESCE(nisn, ?), gender = COALESCE(gender, ?) WHERE email = ? AND role = 'Siswa' AND approval_status = 'pending'",
      [approvedStudentId, finalGrade, finalNis, finalNisn, finalGender, email],
    );
    if (!result.affectedRows) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan atau sudah diproses." },
        { status: 409 },
      );
    }
    await connection.commit();
    return NextResponse.json({ message: "Akun siswa berhasil diverifikasi dan terdaftar ke data siswa." });
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
