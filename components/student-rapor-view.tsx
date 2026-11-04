"use client";

import Link from "next/link";
import { useMemo } from "react";

type PortalRecord = {
  id: string;
  [key: string]: string | number;
};

type SubjectRaporItem = {
  mapel: string;
  defaultNilai: number;
};

const STANDARD_RAPOR_LIST: SubjectRaporItem[] = [
  { mapel: "Matematika", defaultNilai: 88 },
  { mapel: "Bahasa Indonesia", defaultNilai: 90 },
  { mapel: "Bahasa Inggris", defaultNilai: 85 },
  { mapel: "IPA", defaultNilai: 87 },
  { mapel: "IPS", defaultNilai: 84 },
  { mapel: "PPKn", defaultNilai: 92 },
  { mapel: "Pendidikan Agama", defaultNilai: 95 },
];

export function StudentRaporView({
  studentName = "Hizkia Julio Ardiyanto",
  studentGrade = "Kelas 8",
  dbRecords = [],
}: {
  studentName?: string;
  studentGrade?: string;
  dbRecords?: PortalRecord[];
}) {
  // Map subjects with real database grades if available, or fallback to default standard grades
  const raporRows = useMemo(() => {
    const list = STANDARD_RAPOR_LIST.map((item) => {
      const match = dbRecords.find(
        (r) =>
          String(r.mapel || "")
            .trim()
            .toLowerCase() === item.mapel.toLowerCase() ||
          String(r.nama || "")
            .trim()
            .toLowerCase() === item.mapel.toLowerCase(),
      );

      const nilaiNum = match && match.nilai !== undefined && match.nilai !== null && match.nilai !== ""
        ? Number(match.nilai)
        : item.defaultNilai;

      return {
        nama: studentName,
        kelas: studentGrade,
        mapel: item.mapel,
        nilai: Number.isNaN(nilaiNum) ? item.defaultNilai : nilaiNum,
      };
    });

    // Also include any other subjects from database not in standard 7
    const standardMapels = new Set(STANDARD_RAPOR_LIST.map((s) => s.mapel.toLowerCase()));
    const extraRecords = dbRecords.filter((r) => {
      const m = String(r.mapel || r.nama || "").trim().toLowerCase();
      return m && !standardMapels.has(m);
    });

    for (const extra of extraRecords) {
      const extraMapel = String(extra.mapel || extra.nama || "").trim();
      const extraNilai = Number(extra.nilai) || 85;
      list.push({
        nama: studentName,
        kelas: studentGrade,
        mapel: extraMapel,
        nilai: extraNilai,
      });
    }

    return list;
  }, [studentName, studentGrade, dbRecords]);

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* CARD RAPOR DIGITAL */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        {/* Header Rapor */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "6px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: 800,
                color: "#1e293b",
                letterSpacing: "-0.2px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  border: "2px solid #0284c7",
                  borderRadius: "3px",
                  verticalAlign: "middle",
                }}
              />
              <span>Rapor Digital</span>
            </div>
            <div style={{ marginTop: "6px" }}>
              <Link
                href="/portal-siswa"
                style={{
                  color: "#0284c7",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Kembali ke dashboard →
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: "7px 16px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              color: "#166534",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🖨️</span>
            <span>Cetak Rapor</span>
          </button>
        </div>

        {/* TABEL RAPOR DIGITAL (Sesuai Gambar 1) */}
        <div
          style={{
            marginTop: "18px",
            border: "1px solid #eef2f6",
            borderRadius: "10px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              minWidth: "600px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#ffffff" }}>
                <th
                  style={{
                    padding: "16px 20px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  NAMA SISWA
                </th>
                <th
                  style={{
                    padding: "16px 20px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  KELAS
                </th>
                <th
                  style={{
                    padding: "16px 20px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  MATA PELAJARAN
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#64748b",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  NILAI
                </th>
              </tr>
            </thead>
            <tbody>
              {raporRows.map((row, index) => {
                const isGreen = row.nilai >= 90;
                return (
                  <tr
                    key={`${row.mapel}-${index}`}
                    style={{
                      borderBottom:
                        index === raporRows.length - 1 ? "none" : "1px solid #f1f5f9",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td
                      style={{
                        padding: "18px 20px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#334155",
                      }}
                    >
                      {row.nama}
                    </td>
                    <td
                      style={{
                        padding: "18px 20px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#334155",
                      }}
                    >
                      {row.kelas}
                    </td>
                    <td
                      style={{
                        padding: "18px 20px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#334155",
                      }}
                    >
                      {row.mapel}
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        textAlign: "right",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "42px",
                          height: "32px",
                          padding: "0 12px",
                          borderRadius: "10px",
                          fontWeight: 800,
                          fontSize: "14px",
                          background: isGreen ? "#dcfce7" : "#dbeafe",
                          color: isGreen ? "#15803d" : "#1d4ed8",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {row.nilai}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

