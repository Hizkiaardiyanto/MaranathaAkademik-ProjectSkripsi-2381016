import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getPayments, type StudentPayment } from "@/lib/db";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { databaseErrorResponse } from "@/lib/database-response";

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("edunusa_session")?.value);

  if (!session || session.role !== "Siswa") {
    return NextResponse.json(
      { error: "Akses pembayaran siswa ditolak. Sesi siswa tidak aktif." },
      { status: 403 },
    );
  }

  try {
    // Determine student identity from portal_accounts or session
    let studentId: string | undefined = undefined;
    let nis: string | undefined = undefined;
    let studentName = session.name || "";
    let studentGrade = session.grade || "";

    const [accRows] = await pool.query<RowDataPacket[]>(
      "SELECT student_id, nis, name, grade FROM portal_accounts WHERE email = ? LIMIT 1",
      [session.email],
    );

    if (accRows[0]) {
      const acc = accRows[0];
      if (acc.student_id) studentId = acc.student_id;
      if (acc.nis) nis = acc.nis;
      if (acc.name) studentName = acc.name;
      if (acc.grade) studentGrade = acc.grade;
    }

    // If still no studentId, query students table by name
    if (!studentId && studentName) {
      const [stuRows] = await pool.query<RowDataPacket[]>(
        "SELECT id, nis, class_name FROM students WHERE name = ? LIMIT 1",
        [studentName],
      );
      if (stuRows[0]) {
        studentId = stuRows[0].id;
        if (!nis) nis = stuRows[0].nis;
        if (!studentGrade) studentGrade = stuRows[0].class_name;
      }
    }

    // Fetch payments matching this student
    const allPayments = await getPayments();
    const payments = allPayments.filter((p) => {
      if (studentId && p.studentId === studentId) return true;
      if (nis && p.nis === nis) return true;
      if (studentName) {
        const sLower = studentName.toLowerCase();
        const pLower = p.namaSiswa.toLowerCase();
        if (sLower === pLower || sLower.includes(pLower) || pLower.includes(sLower)) return true;
      }
      return false;
    });

    // Check status SPP current month
    const now = new Date();
    const currentMonthName = now.toLocaleString("id-ID", { month: "long" });
    const currentYear = now.getFullYear();
    const currentBulanTag = `${currentMonthName} ${currentYear}`;

    // Look for SPP for this month or most recent SPP
    const currentMonthSPP =
      payments.find(
        (p) =>
          p.jenisPembayaran === "SPP Bulanan" &&
          p.bulan.toLowerCase().includes(currentMonthName.toLowerCase()) &&
          p.bulan.includes(String(currentYear)),
      ) ||
      payments.find(
        (p) =>
          p.jenisPembayaran === "SPP Bulanan" &&
          p.bulan.toLowerCase().includes(currentMonthName.toLowerCase()),
      );

    // Compute metrics
    let totalDibayar = 0;
    let totalTunggakan = 0;
    let jumlahLunas = 0;
    let jumlahBelumLunas = 0;

    for (const p of payments) {
      if (p.status === "Lunas") {
        totalDibayar += p.nominal;
        jumlahLunas++;
      } else {
        totalTunggakan += p.nominal;
        jumlahBelumLunas++;
      }
    }

    return NextResponse.json({
      student: {
        id: studentId,
        nis,
        nama: studentName,
        kelas: studentGrade,
      },
      currentBulan: currentBulanTag,
      statusSppBulanIni: {
        bulan: currentBulanTag,
        isFound: Boolean(currentMonthSPP),
        status: currentMonthSPP ? currentMonthSPP.status : "Belum Ditagihkan",
        nominal: currentMonthSPP ? currentMonthSPP.nominal : 250000,
        tanggalBayar: currentMonthSPP?.tanggalBayar,
        nomorKwitansi: currentMonthSPP?.nomorKwitansi,
        metodePembayaran: currentMonthSPP?.metodePembayaran,
      },
      ringkasan: {
        totalDibayar,
        totalTunggakan,
        jumlahLunas,
        jumlahBelumLunas,
        totalTransaksi: payments.length,
      },
      payments,
      rekeningSekolah: [
        {
          bank: "Bank BRI",
          nomorRekening: "0123-01-001234-53-1",
          atasNama: "Yayasan Pendidikan Maranatha",
          cabang: "KCU Semarang / Tembalang",
        },
        {
          bank: "Bank BCA",
          nomorRekening: "456-789-0123",
          atasNama: "Yayasan Pendidikan Maranatha",
          cabang: "KCP Maranatha",
        },
      ],
      kontakTataUsaha: {
        nama: "Drs. Tugiya, S.Pd, M.Si (Bagian Administrasi & Keuangan)",
        telepon: "+62 813-2503-1459 (Tugiya)",
        email: "sdmaranatha@gmail.com",
        jamLayanan: "Senin – Jumat, 08.00 – 13.00 WIB",
      },
    });
  } catch (error) {
    return databaseErrorResponse(error, "get student portal payments");
  }
}

