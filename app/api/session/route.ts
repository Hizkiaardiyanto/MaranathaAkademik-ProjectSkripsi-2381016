import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("edunusa_session")?.value);

  if (!session) {
    return NextResponse.json(
      { error: "Sesi login tidak ditemukan." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    email: session.email,
    role: session.role,
    name: session.name || (session.role === "Guru" ? "Guru" : "Siswa"),
    grade: session.grade || "",
    subject: session.subject || "",
  });
}
