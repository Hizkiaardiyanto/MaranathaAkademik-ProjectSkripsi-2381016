import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

type BatchStudentInput = {
  name: string;
  nis: string;
  nisn: string;
  className: string;
  gender?: "L" | "P" | string;
  status?: string;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data batch siswa tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("students" in body) || !Array.isArray((body as Record<string, unknown>).students)) {
    return NextResponse.json({ error: "Harus menyertakan array 'students'." }, { status: 400 });
  }

  const studentInputs = (body as { students: BatchStudentInput[] }).students;
  if (studentInputs.length === 0) {
    return NextResponse.json({ error: "Tidak ada data siswa yang diimpor." }, { status: 400 });
  }

  try {
    // 1. Ambil NIS dan NISN yang sudah ada di database
    const [existingRows] = await pool.execute<RowDataPacket[]>("SELECT nis, nisn FROM students");
    const existingNis = new Set(existingRows.map((r) => String(r.nis || "").trim()));
    const existingNisn = new Set(existingRows.map((r) => String(r.nisn || "").trim()));

    let importedCount = 0;
    const skippedList: Array<{ name: string; nis: string; reason: string }> = [];

    for (const item of studentInputs) {
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const nis = typeof item.nis === "string" ? item.nis.trim() : "";
      const nisn = typeof item.nisn === "string" ? item.nisn.trim() : "";
      const className = typeof item.className === "string" ? item.className.trim() : "";

      if (!name || !nis || !className) {
        skippedList.push({ name: name || "(tanpa nama)", nis: nis || "(tanpa nis)", reason: "Nama, NIS, dan Kelas wajib diisi." });
        continue;
      }

      if (existingNis.has(nis)) {
        skippedList.push({ name, nis, reason: `NIS ${nis} sudah ada di database.` });
        continue;
      }

      if (nisn && existingNisn.has(nisn)) {
        skippedList.push({ name, nis, reason: `NISN ${nisn} sudah ada di database.` });
        continue;
      }

      const gender = (item.gender || "L").toUpperCase() === "P" ? "P" : "L";
      const status = item.status && ["Aktif", "Lulus", "Pindah"].includes(item.status.trim())
        ? item.status.trim()
        : "Aktif";

      const id = randomUUID();

      await pool.execute(
        "INSERT INTO students (id, name, nis, nisn, class_name, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, name, nis, nisn || nis, className, gender, status]
      );

      existingNis.add(nis);
      if (nisn) existingNisn.add(nisn);
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${importedCount} data siswa. ${skippedList.length > 0 ? `${skippedList.length} siswa dilewati (duplikat/tidak lengkap).` : ""}`,
      importedCount,
      skippedCount: skippedList.length,
      skippedDetails: skippedList,
    });
  } catch (error) {
    return databaseErrorResponse(error, "batch import students");
  }
}

