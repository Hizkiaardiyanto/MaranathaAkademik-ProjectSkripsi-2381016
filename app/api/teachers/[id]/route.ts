import { NextResponse } from "next/server";
import { deleteTeacher, updateTeacher } from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

const ALLOWED_TEACHER_FIELDS = [
  "name",
  "nip",
  "subject",
  "phone",
  "status",
  "alamat",
  "pendidikanTerakhir",
  "jurusan",
  "gelar",
  "gender",
  "tempatLahir",
  "tanggalLahir",
  "agama",
  "email",
  "statusKepegawaian",
];

function isTeacherUpdate(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  return Object.entries(input).every(([key, field]) => {
    if (!ALLOWED_TEACHER_FIELDS.includes(key)) return false;
    if (key === "status") {
      return field === undefined || ["Aktif", "Cuti", "Pensiun"].includes(String(field));
    }
    if (key === "gender") {
      return field === null || field === undefined || field === "" || field === "L" || field === "P";
    }
    return typeof field === "string" || field === null || field === undefined;
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data guru tidak valid." },
      { status: 400 },
    );
  }
  if (!isTeacherUpdate(body)) {
    return NextResponse.json(
      { error: "Data guru yang dikirim tidak valid." },
      { status: 400 },
    );
  }
  try {
    const updated = await updateTeacher(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Data guru tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    return databaseErrorResponse(error, "update teacher");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    if (!(await deleteTeacher(id))) {
      return NextResponse.json(
        { error: "Data guru tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error, "delete teacher");
  }
}
