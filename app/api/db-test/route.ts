import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

type DatabaseRow = RowDataPacket & {
  database_name: string | null;
};

function connectionMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : undefined;

  if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(code || "")) {
    return "Server database tidak dapat dijangkau. Periksa MYSQL_HOST dan MYSQL_PORT Aiven.";
  }
  if (code === "ER_ACCESS_DENIED_ERROR") {
    return "Kredensial database ditolak. Periksa MYSQL_USER dan MYSQL_PASSWORD.";
  }
  if (code === "ER_BAD_DB_ERROR") {
    return "Database tidak ditemukan. Periksa MYSQL_DATABASE.";
  }
  return "Koneksi database gagal. Periksa konfigurasi MySQL dan sertifikat TLS Aiven.";
}

export async function GET() {
  try {
    const [rows] = await pool.query<DatabaseRow[]>(
      "SELECT DATABASE() AS database_name",
    );

    return NextResponse.json({
      success: true,
      message: "Koneksi MySQL berhasil",
      data: rows,
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : undefined;
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: connectionMessage(error),
        ...(code ? { errorCode: code } : {}),
      },
      { status: 503 },
    );
  }
}
