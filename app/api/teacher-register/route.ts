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
  const { name, email, password, subject } = body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof subject !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password ||
    !subject.trim()
  ) {
    return NextResponse.json(
      { error: "Semua data pendaftaran guru wajib diisi." },
      { status: 400 },
    );
  }

  if (password.length < 5) {
    return NextResponse.json(
      { error: "Password minimal terdiri dari 5 karakter." },
      { status: 400 },
    );
  }

  try {
    const registered = await registerAccount({
      email: email.trim().toLowerCase(),
      password,
      role: "Guru",
      name: name.trim(),
      subject: subject.trim(),
    });

    if (!registered) {
      return NextResponse.json(
        { error: "Email guru sudah digunakan akun sekolah." },
        { status: 409 },
      );
    }
  } catch (error) {
    return databaseErrorResponse(
      error,
      "register teacher",
      "Email guru sudah digunakan akun sekolah.",
    );
  }

  return NextResponse.json({
    message: `Pendaftaran guru atas nama ${name} berhasil. Silakan login dengan akun baru.`,
  });
}
