import { NextResponse } from "next/server";

export function databaseErrorResponse(
  error: unknown,
  operation: string,
  duplicateMessage = "NIS, NISN, atau NIP tersebut sudah digunakan.",
) {
  console.error(`Database operation failed (${operation}):`, error);

  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  if (code === "ER_DUP_ENTRY") {
    return NextResponse.json(
      { error: duplicateMessage },
      { status: 409 },
    );
  }

  return NextResponse.json(
    {
      error:
        "Database tidak dapat memproses permintaan. Pastikan koneksi dan skema database sudah disiapkan.",
    },
    { status: 503 },
  );
}
