import { NextResponse } from "next/server";
import { createStudent, getStudents } from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

function isStudentInput(value: unknown): value is {
  name: string;
  nis: string;
  nisn: string;
  className: string;
  gender: "L" | "P";
  status?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  agama?: string;
  waliMurid?: string;
  teleponWali?: string;
  hubunganWali?: string;
  pekerjaanWali?: string;
  fotoUrl?: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  return (
    typeof input.name === "string" &&
    Boolean(input.name.trim()) &&
    typeof input.nis === "string" &&
    Boolean(input.nis.trim()) &&
    typeof input.nisn === "string" &&
    Boolean(input.nisn.trim()) &&
    typeof input.className === "string" &&
    Boolean(input.className.trim()) &&
    (input.gender === "L" || input.gender === "P") &&
    (input.status === undefined ||
      ["Aktif", "Baru", "Pindah"].includes(String(input.status)))
  );
}

export async function GET() {
  try {
    return NextResponse.json(await getStudents());
  } catch (error) {
    return databaseErrorResponse(error, "list students");
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data siswa tidak valid." },
      { status: 400 },
    );
  }
  if (!isStudentInput(body)) {
    return NextResponse.json(
      { error: "Lengkapi data siswa dengan format yang benar." },
      { status: 400 },
    );
  }
  try {
    const student = await createStudent(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, "create student");
  }
}
