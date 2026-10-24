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
    return NextResponse.json({ error: duplicateMessage }, { status: 409 });
  }
  if (code === "ER_ACCESS_DENIED_ERROR") {
    return NextResponse.json(
      {
        error:
          "Autentikasi database ditolak. Periksa MYSQL_USER dan MYSQL_PASSWORD di .env.local atau kredensial layanan MySQL.",
      },
      { status: 503 },
    );
  }
  if (code === "ER_BAD_DB_ERROR" || code === "ER_NO_SUCH_TABLE") {
    return NextResponse.json(
      {
        error:
          "Skema database belum siap. Pastikan database yang dipilih benar dan database/schema.sql sudah dijalankan.",
      },
      { status: 503 },
    );
  }
  if (code === "ETIMEDOUT" || code === "ECONNREFUSED" || code === "ENOTFOUND") {
    return NextResponse.json(
      {
        error:
          "Server database tidak dapat dijangkau. Periksa MYSQL_HOST, MYSQL_PORT, jaringan, dan status layanan database.",
      },
      { status: 503 },
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
