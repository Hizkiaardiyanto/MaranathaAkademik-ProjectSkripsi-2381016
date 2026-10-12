import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/auth-accounts";
import { databaseErrorResponse } from "@/lib/database-response";
import { isRecordInput } from "@/lib/record-validation";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data pendaftaran tidak valid." },
      { status: 400 },
    );
  }

  if (!isRecordInput(body)) {
    return NextResponse.json(
      { error: "Data pendaftaran tidak valid." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const parent = typeof body.parent === "string" ? body.parent.trim() : "";
  const grade = typeof body.grade === "string" ? body.grade.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const nis = typeof body.nis === "string" ? body.nis.trim() : "";
  const nisn = typeof body.nisn === "string" ? body.nisn.trim() : "";
  const gender = body.gender === "L" || body.gender === "P" ? body.gender : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !parent || !grade || !phone || !nis || !nisn || !gender || !email || !password) {
    return NextResponse.json(
      { error: "Semua data pendaftaran wajib diisi." },
      { status: 400 },
    );
  }

  if (password.length < 5) {
    return NextResponse.json(
      { error: "Password minimal terdiri dari 5 karakter." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Email siswa tidak valid." },
      { status: 400 },
    );
  }

  const registrationId = `REG-${randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    const registered = await registerAccount({
      email,
      password,
      role: "Siswa",
      name,
      grade,
      parentName: parent,
      phone,
      nis,
      nisn,
      gender,
      registrationId,
    });

    if (!registered) {
      return NextResponse.json(
        { error: "Email siswa sudah digunakan akun sekolah." },
        { status: 409 },
      );
    }
  } catch (error) {
    return databaseErrorResponse(
      error,
      "register student",
      "Email siswa sudah digunakan akun sekolah.",
    );
  }

  return NextResponse.json({
    message:
      "Pendaftaran siswa berhasil dan menunggu verifikasi administrator sebelum dapat digunakan untuk login.",
    registrationId,
    status: "Menunggu verifikasi",
  });
}
