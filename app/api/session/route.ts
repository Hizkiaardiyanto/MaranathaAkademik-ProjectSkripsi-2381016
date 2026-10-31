import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../lib/session";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("edunusa_session")?.value);

  if (!session) {
    return NextResponse.json(
      { error: "Sesi login tidak ditemukan." },
      { status: 401 },
    );
  }

  let enrichedData: Record<string, unknown> = {
    email: session.email,
    role: session.role,
    name: session.name || (session.role === "Guru" ? "Guru" : "Siswa"),
    grade: session.grade || "",
    subject: session.subject || "",
  };

  try {
    const [accRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM portal_accounts WHERE email = ? LIMIT 1",
      [session.email],
    );
    const acc = accRows[0];
    if (acc) {
      enrichedData = {
        ...enrichedData,
        name: acc.name || enrichedData.name,
        grade: acc.grade || enrichedData.grade,
        subject: acc.subject || enrichedData.subject,
        phone: acc.phone || null,
        parentName: acc.parent_name || null,
        nis: acc.nis || null,
        nisn: acc.nisn || null,
        gender: acc.gender || null,
        registrationId: acc.registration_id || null,
        approvalStatus: acc.approval_status || "approved",
        studentId: acc.student_id || null,
        teacherId: acc.teacher_id || null,
        createdAt: acc.created_at || null,
      };

      if (acc.student_id) {
        const [stdRows] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM students WHERE id = ? LIMIT 1",
          [acc.student_id],
        );
        const std = stdRows[0];
        if (std) {
          enrichedData.nis = std.nis || enrichedData.nis;
          enrichedData.nisn = std.nisn || enrichedData.nisn;
          enrichedData.className = std.class_name || enrichedData.grade;
          enrichedData.grade = std.class_name || enrichedData.grade;
          enrichedData.gender = std.gender || enrichedData.gender;
          enrichedData.status = std.status || "Aktif";
          enrichedData.tempatLahir = std.tempat_lahir || null;
          enrichedData.tanggalLahir = std.tanggal_lahir || null;
          enrichedData.alamat = std.alamat || null;
          enrichedData.agama = std.agama || null;
          enrichedData.waliMurid = std.wali_murid || acc.parent_name || null;
          enrichedData.teleponWali = std.telepon_wali || acc.phone || null;
          enrichedData.hubunganWali = std.hubungan_wali || null;
          enrichedData.pekerjaanWali = std.pekerjaan_wali || null;
        }
      } else if (acc.role === "Siswa") {
        const [stdRows] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM students WHERE name = ? LIMIT 1",
          [acc.name],
        );
        const std = stdRows[0];
        if (std) {
          enrichedData.nis = std.nis || enrichedData.nis;
          enrichedData.nisn = std.nisn || enrichedData.nisn;
          enrichedData.className = std.class_name || enrichedData.grade;
          enrichedData.grade = std.class_name || enrichedData.grade;
          enrichedData.gender = std.gender || enrichedData.gender;
          enrichedData.status = std.status || "Aktif";
          enrichedData.tempatLahir = std.tempat_lahir || null;
          enrichedData.tanggalLahir = std.tanggal_lahir || null;
          enrichedData.alamat = std.alamat || null;
          enrichedData.agama = std.agama || null;
          enrichedData.waliMurid = std.wali_murid || acc.parent_name || null;
          enrichedData.teleponWali = std.telepon_wali || acc.phone || null;
          enrichedData.hubunganWali = std.hubungan_wali || null;
          enrichedData.pekerjaanWali = std.pekerjaan_wali || null;
        }
      } else if (acc.role === "Guru") {
        const [tchRows] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM teachers WHERE id = ? OR name = ? LIMIT 1",
          [acc.teacher_id, acc.name],
        );
        const tch = tchRows[0];
        if (tch) {
          enrichedData.nip = tch.nip || null;
          enrichedData.subject = tch.subject || enrichedData.subject;
          enrichedData.phone = tch.phone || acc.phone || null;
          enrichedData.status = tch.status || "Aktif";
          enrichedData.alamat = tch.alamat || null;
          enrichedData.pendidikanTerakhir = tch.pendidikan_terakhir || null;
          enrichedData.jurusan = tch.jurusan || null;
          enrichedData.gelar = tch.gelar || null;
          enrichedData.gender = tch.gender || null;
          enrichedData.tempatLahir = tch.tempat_lahir || null;
          enrichedData.tanggalLahir = tch.tanggal_lahir || null;
          enrichedData.agama = tch.agama || null;
          enrichedData.statusKepegawaian = tch.status_kepegawaian || "GTY";
        }
      }
    }
  } catch (err) {
    console.error("Gagal memperkaya session:", err);
  }

  return NextResponse.json(enrichedData);
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("edunusa_session")?.value);

  if (!session) {
    return NextResponse.json(
      { error: "Sesi login tidak ditemukan." },
      { status: 401 },
    );
  }

  let body: Record<string, string | null | undefined>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  try {
    const [accRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM portal_accounts WHERE email = ? LIMIT 1",
      [session.email],
    );
    const acc = accRows[0];
    if (!acc) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    // Update phone on portal_accounts
    if (typeof body.phone === "string") {
      await pool.execute(
        "UPDATE portal_accounts SET phone = ? WHERE email = ?",
        [body.phone.trim(), session.email],
      );
    }

    if (acc.role === "Siswa") {
      const studentId = acc.student_id;
      if (studentId) {
        await pool.execute(
          `UPDATE students SET 
            alamat = COALESCE(?, alamat),
            agama = COALESCE(?, agama),
            wali_murid = COALESCE(?, wali_murid),
            telepon_wali = COALESCE(?, telepon_wali),
            hubungan_wali = COALESCE(?, hubungan_wali),
            pekerjaan_wali = COALESCE(?, pekerjaan_wali),
            tempat_lahir = COALESCE(?, tempat_lahir),
            tanggal_lahir = COALESCE(?, tanggal_lahir)
          WHERE id = ?`,
          [
            body.alamat ?? null,
            body.agama ?? null,
            body.waliMurid ?? null,
            body.teleponWali ?? null,
            body.hubunganWali ?? null,
            body.pekerjaanWali ?? null,
            body.tempatLahir ?? null,
            body.tanggalLahir ?? null,
            studentId,
          ],
        );
      }
    } else if (acc.role === "Guru") {
      const teacherId = acc.teacher_id;
      await pool.execute(
        `UPDATE teachers SET 
          phone = COALESCE(?, phone),
          alamat = COALESCE(?, alamat),
          pendidikan_terakhir = COALESCE(?, pendidikan_terakhir),
          jurusan = COALESCE(?, jurusan),
          gelar = COALESCE(?, gelar),
          tempat_lahir = COALESCE(?, tempat_lahir),
          tanggal_lahir = COALESCE(?, tanggal_lahir),
          agama = COALESCE(?, agama)
        WHERE id = ? OR name = ?`,
        [
          body.phone ?? null,
          body.alamat ?? null,
          body.pendidikanTerakhir ?? null,
          body.jurusan ?? null,
          body.gelar ?? null,
          body.tempatLahir ?? null,
          body.tanggalLahir ?? null,
          body.agama ?? null,
          teacherId ?? null,
          acc.name,
        ],
      );
    }

    return NextResponse.json({ ok: true, message: "Profil berhasil diperbarui." });
  } catch (err) {
    console.error("Gagal update profil:", err);
    return NextResponse.json({ error: "Gagal menyimpan perubahan profil." }, { status: 500 });
  }
}
