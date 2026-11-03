import { NextResponse } from "next/server";
import {
  createPayment,
  generateBulkMonthlySPP,
  getPayments,
  type StudentPayment,
} from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kelas = searchParams.get("kelas") || undefined;
    const bulan = searchParams.get("bulan") || undefined;
    const status = searchParams.get("status") || undefined;
    const jenisPembayaran = searchParams.get("jenisPembayaran") || undefined;
    const search = searchParams.get("search") || undefined;

    const payments = await getPayments({
      kelas,
      bulan,
      status,
      jenisPembayaran,
      search,
    });

    // Compute metrics
    let totalPenerimaan = 0;
    let totalTunggakan = 0;
    let countLunas = 0;
    let countBelumLunas = 0;

    for (const p of payments) {
      if (p.status === "Lunas") {
        totalPenerimaan += p.nominal;
        countLunas++;
      } else {
        totalTunggakan += p.nominal;
        countBelumLunas++;
      }
    }

    return NextResponse.json({
      payments,
      summary: {
        totalPenerimaan,
        totalTunggakan,
        countLunas,
        countBelumLunas,
        totalTransaksi: payments.length,
      },
    });
  } catch (error) {
    return databaseErrorResponse(error, "list student payments");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if bulk generation requested
    if (body.action === "generate-bulk") {
      const { bulan, tahunAjaran, nominalSD, nominalSMP } = body;
      if (!bulan || !bulan.trim()) {
        return NextResponse.json(
          { error: "Nama bulan tagihan wajib diisi." },
          { status: 400 },
        );
      }
      const result = await generateBulkMonthlySPP(
        bulan.trim(),
        tahunAjaran?.trim() || "2026/2027",
        Number(nominalSD) || 250000,
        Number(nominalSMP) || 300000,
      );
      return NextResponse.json({
        message: `Berhasil membuat tagihan SPP massal: ${result.created} siswa dibuat, ${result.skipped} siswa dilewati (sudah memiliki tagihan bulan ini).`,
        result,
      });
    }

    // Single payment creation
    if (!body.namaSiswa?.trim() || !body.nis?.trim() || !body.kelas?.trim()) {
      return NextResponse.json(
        { error: "Nama siswa, NIS, dan Kelas wajib diisi." },
        { status: 400 },
      );
    }

    const created = await createPayment(body as Partial<StudentPayment>);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, "create student payment");
  }
}

