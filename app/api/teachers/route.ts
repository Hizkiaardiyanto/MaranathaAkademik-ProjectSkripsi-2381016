import { NextResponse } from "next/server";
import { createTeacher, getTeachers } from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

function isTeacherInput(value: unknown): value is {
  name: string;
  nip: string;
  subject: string;
  phone: string;
  status?: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  return (
    typeof input.name === "string" &&
    Boolean(input.name.trim()) &&
    typeof input.nip === "string" &&
    Boolean(input.nip.trim()) &&
    typeof input.subject === "string" &&
    Boolean(input.subject.trim()) &&
    typeof input.phone === "string" &&
    Boolean(input.phone.trim()) &&
    (input.status === undefined ||
      ["Aktif", "Cuti", "Pensiun"].includes(String(input.status)))
  );
}

export async function GET() {
  try {
    return NextResponse.json(await getTeachers());
  } catch (error) {
    return databaseErrorResponse(error, "list teachers");
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data guru tidak valid." },
      { status: 400 },
    );
  }
  if (!isTeacherInput(body)) {
    return NextResponse.json(
      { error: "Lengkapi data guru dengan format yang benar." },
      { status: 400 },
    );
  }
  try {
    const teacher = await createTeacher(body);
    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, "create teacher");
  }
}
