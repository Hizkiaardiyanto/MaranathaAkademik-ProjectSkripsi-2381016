import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS database_name");

    return NextResponse.json({
      success: true,
      message: "Koneksi MySQL berhasil",
      data: rows,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database gagal",
      },
      { status: 500 },
    );
  }
}
