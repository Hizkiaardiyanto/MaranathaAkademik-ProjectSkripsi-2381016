import { NextResponse } from "next/server";
import {
  getAuthAccounts,
  getRegisteredAuthAccount,
  type AuthAccount,
} from "@/lib/auth-accounts";
import { databaseErrorResponse } from "@/lib/database-response";
import { verifyPassword } from "@/lib/password";
import { createSessionToken } from "../../../lib/session";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data login tidak valid." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Data login tidak valid." },
      { status: 400 },
    );
  }
  const input = body as Record<string, unknown>;
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const requestedRole =
    typeof input.role === "string" ? input.role : "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi." },
      { status: 400 },
    );
  }

  let account: AuthAccount | undefined;
  try {
    const builtInAccount = (await getAuthAccounts()).find(
      (item) =>
        [item.email, ...(item.aliases || [])].some(
          (accountEmail) => accountEmail.toLowerCase() === email,
        ) &&
        (!requestedRole || item.role === requestedRole),
    );
    if (builtInAccount) {
      account = builtInAccount;
    } else {
      const registered = await getRegisteredAuthAccount(email);
      account =
        registered && (!requestedRole || registered.role === requestedRole)
          ? registered
          : undefined;
    }
    const validPassword = account?.passwordHash
      ? await verifyPassword(password, account.passwordHash)
      : account?.password === password;
    if (!validPassword) account = undefined;
  } catch (error) {
    return databaseErrorResponse(error, "authenticate account");
  }

  if (!account) {
    return NextResponse.json(
      { error: "Email atau password salah." },
      { status: 401 },
    );
  }

  if (account.approvalStatus === "pending") {
    return NextResponse.json(
      { error: "Pendaftaran akun menunggu verifikasi administrator." },
      { status: 403 },
    );
  }
  if (account.approvalStatus === "rejected") {
    return NextResponse.json(
      { error: "Pendaftaran akun tidak disetujui oleh administrator." },
      { status: 403 },
    );
  }
  if (account.approvalStatus === "inactive") {
    return NextResponse.json(
      { error: "Akun ini telah dinonaktifkan oleh administrator. Silakan hubungi admin sekolah." },
      { status: 403 },
    );
  }

  const sessionToken = createSessionToken(account.email, account.role, {
    name: account.name,
    grade: account.grade,
    subject: account.subject,
    studentId: account.studentId,
  });
  if (!sessionToken) {
    return NextResponse.json(
      { error: "SESSION_SECRET belum dikonfigurasi di server." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({
    message: "Login berhasil.",
    user: { email: account.email, role: account.role },
  });

  response.cookies.set("edunusa_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
