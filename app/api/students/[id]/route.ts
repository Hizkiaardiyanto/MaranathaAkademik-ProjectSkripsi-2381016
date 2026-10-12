import { NextResponse } from "next/server";
import { deleteStudent, updateStudent } from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

function isStudentUpdate(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  const allowed = ["name", "nis", "nisn", "className", "gender", "status"];
  return Object.entries(input).every(
    ([key, field]) => {
      if (!allowed.includes(key)) return false;
      if (key === "gender") return field === "L" || field === "P";
      if (key === "status") {
        return ["Aktif", "Baru", "Pindah"].includes(String(field));
      }
      return typeof field === "string";
    },
  );
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
      { error: "Format data siswa tidak valid." },
      { status: 400 },
    );
  }
  if (!isStudentUpdate(body)) {
    return NextResponse.json(
      { error: "Data siswa yang dikirim tidak valid." },
      { status: 400 },
    );
  }
  try {
    const updated = await updateStudent(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    return databaseErrorResponse(error, "update student");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    if (!(await deleteStudent(id))) {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error, "delete student");
  }
}
