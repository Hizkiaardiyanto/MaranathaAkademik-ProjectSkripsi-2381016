import { NextResponse } from "next/server";
import { deleteTeacher, updateTeacher } from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

function isTeacherUpdate(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  const allowed = ["name", "nip", "subject", "phone", "status"];
  return Object.entries(input).every(
    ([key, field]) =>
      allowed.includes(key) &&
      typeof field === "string" &&
      (key !== "status" ||
        ["Aktif", "Cuti", "Pensiun"].includes(field)),
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
