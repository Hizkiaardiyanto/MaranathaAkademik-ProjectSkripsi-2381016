"use client";

import { useEffect, useState } from "react";
import type { StudentPayment } from "../lib/db";

type PaymentData = {
  student: {
    id?: string;
    nis?: string;
    nama: string;
    kelas: string;
  };
  currentBulan: string;
  statusSppBulanIni: {
    bulan: string;
    isFound: boolean;
    status: string;
    nominal: number;
    tanggalBayar?: string;
    nomorKwitansi?: string;
    metodePembayaran?: string;
  };
  ringkasan: {
    totalDibayar: number;
    totalTunggakan: number;
    jumlahLunas: number;
    jumlahBelumLunas: number;
    totalTransaksi: number;
  };
  payments: StudentPayment[];
  rekeningSekolah: Array<{
    bank: string;
    nomorRekening: string;
    atasNama: string;
    cabang: string;
  }>;
  kontakTataUsaha: {
    nama: string;
    telepon: string;
    email: string;
    jamLayanan: string;
  };
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const TAHUN_AJARAN_BULAN = [
  "Juli 2026",
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
  "Januari 2027",
  "Februari 2027",
  "Maret 2027",
  "April 2027",
  "Mei 2027",
  "Juni 2027",
];

export function StudentPaymentView() {
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptPayment, setReceiptPayment] = useState<StudentPayment | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const res = await fetch("/api/portal-data/payments");
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Gagal memuat status administrasi.");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Koneksi gagal saat memuat status administrasi.");
      } finally {
        setLoading(false);
      }
    }
    void fetchPayments();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>💳</div>
        <b>Memeriksa status administrasi & SPP...</b>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          padding: "20px",
          borderRadius: "12px",
          color: "#991b1b",
        }}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: "16px" }}>Gagal Memuat Administrasi</h3>
        <p style={{ margin: 0, fontSize: "14px" }}>{error || "Data administrasi tidak tersedia."}</p>
      </div>
    );
  }

  const sppCurrent = data.statusSppBulanIni;
  const isCurrentMonthLunas = sppCurrent.status === "Lunas";
  const nonSppPayments = data.payments.filter((p) => p.jenisPembayaran !== "SPP Bulanan");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. HERO STATUS SPP BULAN BERJALAN */}
      <div
        style={{
          background: isCurrentMonthLunas
            ? "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)"
            : "linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          color: "#ffffff",
          boxShadow: isCurrentMonthLunas
            ? "0 10px 25px -5px rgba(22, 163, 74, 0.3)"
            : "0 10px 25px -5px rgba(217, 119, 6, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                background: "rgba(255, 255, 255, 0.25)",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Status SPP Bulan {sppCurrent.bulan}
            </span>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                background: isCurrentMonthLunas ? "#ffffff" : "#fee2e2",
                color: isCurrentMonthLunas ? "#15803d" : "#991b1b",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              {isCurrentMonthLunas ? "✓ SUDAH LUNAS" : "⏳ BELUM DIBAYAR"}
            </span>
          </div>

          <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 800 }}>
            {isCurrentMonthLunas
              ? `SPP Bulan ${sppCurrent.bulan} Telah Lunas`
              : `SPP Bulan ${sppCurrent.bulan} Menunggu Pembayaran`}
          </h2>

          <p style={{ margin: "0 0 18px", fontSize: "14px", opacity: 0.95, maxWidth: "600px", lineHeight: 1.6 }}>
            {isCurrentMonthLunas
              ? `Terima kasih! Pembayaran SPP untuk siswa an. ${data.student.nama} (${data.student.kelas}) telah terverifikasi oleh Tata Usaha Sekolah Maranatha.`
              : `Tagihan SPP sebesar ${formatRupiah(sppCurrent.nominal)} untuk siswa an. ${data.student.nama} (${data.student.kelas}) belum lunas. Silakan lakukan pembayaran sebelum tanggal 10 bulan berjalan.`}
          </p>

          {isCurrentMonthLunas && sppCurrent.nomorKwitansi && (
            <div
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "16px",
                background: "rgba(0, 0, 0, 0.15)",
                padding: "10px 16px",
                borderRadius: "10px",
                fontSize: "13px",
              }}
            >
              <span>
                No. Kwitansi: <b>{sppCurrent.nomorKwitansi}</b>
              </span>
              <span>·</span>
              <span>
                Tanggal Bayar: <b>{sppCurrent.tanggalBayar}</b>
              </span>
              <span>·</span>
              <span>
                Metode: <b>{sppCurrent.metodePembayaran || "Kasir TU"}</b>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. STAT KARTU RINGKASAN */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>TOTAL SUDAH DIBAYAR</span>
          <strong style={{ fontSize: "20px", color: "#15803d", fontWeight: 800 }}>
            {formatRupiah(data.ringkasan.totalDibayar)}
          </strong>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            {data.ringkasan.jumlahLunas} transaksi lunas
          </small>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b" }}>SISA TUNGGAKAN AKTIF</span>
          <strong style={{ fontSize: "20px", color: "#b91c1c", fontWeight: 800 }}>
            {formatRupiah(data.ringkasan.totalTunggakan)}
          </strong>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            {data.ringkasan.jumlahBelumLunas} tagihan belum lunas
          </small>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af" }}>STATUS KESISWAAN</span>
          <strong style={{ fontSize: "18px", color: "#1e3a8a", fontWeight: 800 }}>
            {data.student.kelas}
          </strong>
          <small style={{ color: "#64748b", fontSize: "12px" }}>NIS: {data.student.nis || "—"}</small>
        </div>
      </div>

      {/* 3. MATRIKS STATUS SPP 1 TAHUN AJARAN (2026/2027) */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "22px 24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
            📅 Matriks Pembayaran SPP Tahun Ajaran 2026/2027
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Rincian status pembayaran iuran SPP bulanan selama 1 tahun ajaran kalender pendidikan.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px",
          }}
        >
          {TAHUN_AJARAN_BULAN.map((bulanName) => {
            // Find payment record matching this month
            const record = data.payments.find(
              (p) =>
                p.jenisPembayaran === "SPP Bulanan" &&
                p.bulan.toLowerCase().includes(bulanName.toLowerCase().split(" ")[0]),
            );

            const isLunas = record?.status === "Lunas";
            const isTagihanExists = Boolean(record);

            return (
              <div
                key={bulanName}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: isLunas ? "1px solid #86efac" : "1px solid #e2e8f0",
                  background: isLunas ? "#f0fdf4" : isTagihanExists ? "#fffbeb" : "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  position: "relative",
                  transition: "transform 0.15s",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  {bulanName}
                </div>

                <div style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                  {record ? formatRupiah(record.nominal) : "Rp 300.000"}
                </div>

                <div>
                  {isLunas ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        background: "#dcfce7",
                        color: "#166534",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      ✓ LUNAS
                    </span>
                  ) : isTagihanExists ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      ⏳ BELUM LUNAS
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        background: "#f1f5f9",
                        color: "#64748b",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      — Terjadwal —
                    </span>
                  )}
                </div>

                {isLunas && record?.tanggalBayar && (
                  <small style={{ fontSize: "10px", color: "#166534" }}>
                    Bayar: {record.tanggalBayar}
                  </small>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3B. TAGIHAN SERAGAM, SARPRAS & ADMINISTRASI LAINNYA */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "22px 24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
              👕 Tagihan Seragam, Sarpras &amp; Administrasi Non-SPP
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Status pembayaran perlengkapan seragam sekolah, batik, sarana prasarana, dan iuran kegiatan resmi.
            </p>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              background: "#f1f5f9",
              color: "#475569",
              padding: "4px 10px",
              borderRadius: "12px",
            }}
          >
            {nonSppPayments.length} Tagihan Terdaftar
          </span>
        </div>

        {nonSppPayments.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#94a3b8",
              background: "#f8fafc",
              borderRadius: "10px",
              border: "1px dashed #cbd5e1",
            }}
          >
            Belum ada tagihan non-SPP untuk tahun ajaran ini.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "14px",
            }}
          >
            {nonSppPayments.map((item) => {
              const isLunas = item.status === "Lunas";
              const isSeragam = item.jenisPembayaran.toLowerCase().includes("seragam");
              const isSarpras =
                item.jenisPembayaran.toLowerCase().includes("sarpras") ||
                item.jenisPembayaran.toLowerCase().includes("gedung");
              const icon = isSeragam ? "👕" : isSarpras ? "🏫" : "🎯";

              return (
                <div
                  key={item.id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "12px",
                    border: isLunas ? "1px solid #86efac" : "1px solid #fecaca",
                    background: isLunas ? "#f0fdf4" : "#fff5f5",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "20px" }}>{icon}</span>
                      <div>
                        <b style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
                          {item.jenisPembayaran}
                        </b>
                        <small style={{ fontSize: "11px", color: "#64748b" }}>
                          Periode: {item.bulan}
                        </small>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: isLunas ? "#dcfce7" : "#fee2e2",
                        color: isLunas ? "#166534" : "#991b1b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isLunas ? "✓ LUNAS" : "⏳ BELUM LUNAS"}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: isLunas ? "#15803d" : "#b91c1c",
                    }}
                  >
                    {formatRupiah(item.nominal)}
                  </div>

                  {item.keterangan && (
                    <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                      {item.keterangan}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      paddingTop: "8px",
                      marginTop: "auto",
                    }}
                  >
                    <small style={{ fontSize: "11px", color: "#64748b" }}>
                      {isLunas ? `Tgl: ${item.tanggalBayar || "-"}` : "Harap selesaikan administrasi"}
                    </small>
                    {isLunas && (
                      <button
                        type="button"
                        onClick={() => setReceiptPayment(item)}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #86efac",
                          color: "#166534",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Kwitansi ↗
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. TABEL RIWAYAT TRANSAKSI & KWITANSI */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
            📋 Riwayat Pembayaran & Kwitansi Siswa
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Daftar seluruh transaksi pembayaran administrasi sekolah Anda dan unduh kwitansi resmi.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700 }}>No. Kwitansi</th>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700 }}>Jenis Tagihan</th>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700 }}>Periode</th>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700 }}>Nominal</th>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700 }}>Tanggal Bayar</th>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700 }}>Metode</th>
                <th style={{ padding: "12px 18px", color: "#475569", fontWeight: 700, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                    Belum ada riwayat transaksi pembayaran.
                  </td>
                </tr>
              ) : (
                data.payments.map((p) => {
                  const isLunas = p.status === "Lunas";
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 18px", fontFamily: "monospace", fontWeight: 600, color: "#0369a1" }}>
                        {p.nomorKwitansi || "—"}
                      </td>
                      <td style={{ padding: "12px 18px", fontWeight: 600, color: "#0f172a" }}>
                        {p.jenisPembayaran}
                      </td>
                      <td style={{ padding: "12px 18px", color: "#475569" }}>{p.bulan}</td>
                      <td style={{ padding: "12px 18px", fontWeight: 700, color: "#0f172a" }}>
                        {formatRupiah(p.nominal)}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        {isLunas ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              background: "#dcfce7",
                              color: "#166534",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            ✓ LUNAS
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              background: "#fee2e2",
                              color: "#991b1b",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            ⏳ BELUM LUNAS
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 18px", color: "#64748b" }}>
                        {p.tanggalBayar || "—"}
                      </td>
                      <td style={{ padding: "12px 18px", color: "#64748b" }}>
                        {p.metodePembayaran || "—"}
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "right" }}>
                        {isLunas && (
                          <button
                            type="button"
                            style={{
                              padding: "5px 12px",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              borderRadius: "6px",
                              fontWeight: 700,
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                            onClick={() => setReceiptPayment(p)}
                          >
                            📄 Bukti Kwitansi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INFORMASI REKENING RESMI & KONTAK TATA USAHA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Rekening Pembayaran */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            🏦 Rekening Resmi Pembayaran Sekolah
          </h4>
          <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#64748b" }}>
            Pembayaran non-tunai (transfer bank) dapat dikirimkan ke rekening resmi berikut:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.rekeningSekolah.map((rek) => (
              <div
                key={rek.nomorRekening}
                style={{
                  background: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <b style={{ color: "#1e3a8a", fontSize: "14px" }}>{rek.bank}</b>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>{rek.cabang}</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  {rek.nomorRekening}
                </div>
                <small style={{ color: "#64748b" }}>a.n. {rek.atasNama}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Layanan Tata Usaha */}
        <div
          style={{
            background: "#f0fdf4",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #bbf7d0",
          }}
        >
          <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#166534" }}>
            📞 Bantuan & Konfirmasi Pembayaran
          </h4>
          <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#15803d" }}>
            Setelah melakukan transfer atau ingin konfirmasi tunai, hubungi Bagian Tata Usaha:
          </p>

          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#166534", width: "40%", fontWeight: 600 }}>
                  Petugas TU
                </td>
                <td style={{ padding: "6px 0", color: "#14532d" }}>: {data.kontakTataUsaha.nama}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#166534", fontWeight: 600 }}>WhatsApp / Telp</td>
                <td style={{ padding: "6px 0", color: "#14532d", fontWeight: 700 }}>
                  : {data.kontakTataUsaha.telepon}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#166534", fontWeight: 600 }}>Email Resmi</td>
                <td style={{ padding: "6px 0", color: "#14532d" }}>: {data.kontakTataUsaha.email}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#166534", fontWeight: 600 }}>Jam Layanan</td>
                <td style={{ padding: "6px 0", color: "#14532d" }}>
                  : {data.kontakTataUsaha.jamLayanan}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MODAL KWITANSI BUKTI PEMBAYARAN RESMI */}
      {receiptPayment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setReceiptPayment(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "580px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #15803d, #16a34a)",
                color: "#ffffff",
                padding: "22px 26px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    marginBottom: "6px",
                  }}
                >
                  KWITANSI PEMBAYARAN RESMI
                </span>
                <h3 style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: 800 }}>
                  SD – SMP MARANATHA
                </h3>
                <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
                  Jl. Maranatha No. 01, Semarang · Telp: +62 813-2503-1459
                </p>
              </div>
              <button
                type="button"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "18px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                onClick={() => setReceiptPayment(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "10px",
                  borderBottom: "1px dashed #cbd5e1",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ color: "#64748b" }}>No. Kwitansi: </span>
                  <b style={{ color: "#0f172a", fontFamily: "monospace" }}>{receiptPayment.nomorKwitansi}</b>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Tanggal: </span>
                  <b>{receiptPayment.tanggalBayar}</b>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "6px 0", color: "#64748b", width: "35%" }}>Nama Siswa</td>
                    <td style={{ padding: "6px 0", color: "#0f172a", fontWeight: 700 }}>
                      : {receiptPayment.namaSiswa}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", color: "#64748b" }}>NIS / Kelas</td>
                    <td style={{ padding: "6px 0", color: "#0f172a" }}>
                      : {receiptPayment.nis} ({receiptPayment.kelas})
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", color: "#64748b" }}>Keperluan</td>
                    <td style={{ padding: "6px 0", color: "#0f172a", fontWeight: 600 }}>
                      : {receiptPayment.jenisPembayaran} - {receiptPayment.bulan}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", color: "#64748b" }}>Metode Bayar</td>
                    <td style={{ padding: "6px 0", color: "#0f172a" }}>
                      : {receiptPayment.metodePembayaran || "Kasir TU"}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                style={{
                  background: "#f0fdf4",
                  border: "2px solid #86efac",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700 }}>
                    TOTAL TELAH DIBAYAR:
                  </span>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: "#15803d" }}>
                    {formatRupiah(receiptPayment.nominal)}
                  </div>
                </div>
                <div
                  style={{
                    padding: "5px 12px",
                    background: "#dcfce7",
                    borderRadius: "20px",
                    fontWeight: 800,
                    color: "#166534",
                    fontSize: "12px",
                  }}
                >
                  ✓ LUNAS
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: "12px",
                  color: "#475569",
                }}
              >
                <div>
                  <span>Penyetor,</span>
                  <div style={{ height: "40px" }} />
                  <b>{receiptPayment.namaSiswa}</b>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span>Bagian Keuangan Maranatha,</span>
                  <div style={{ height: "15px" }} />
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>[TERVERIFIKASI]</span>
                  <div style={{ height: "15px" }} />
                  <b>{receiptPayment.petugas || "Tata Usaha"}</b>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "14px 26px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setReceiptPayment(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                style={{
                  padding: "8px 18px",
                  background: "#15803d",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={() => window.print()}
              >
                🖨 Cetak Bukti Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

