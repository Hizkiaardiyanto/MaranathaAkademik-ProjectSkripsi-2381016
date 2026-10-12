"use client";

import { SchoolShell } from "@/components/school-shell";
import { useAcademicRecords } from "@/lib/use-academic-records";
import styles from "../page.module.css";

type Summary = { id: string; [key: string]: string | number };

const reportTypes = [
  { key: "attendance", label: "Laporan Kehadiran" },
  { key: "grades", label: "Laporan Nilai" },
  { key: "classes", label: "Laporan Kelas" },
] as const;
type ReportKey = (typeof reportTypes)[number]["key"];

function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function LaporanPage() {
  const {
    rows: attendance,
    loading: attendanceLoading,
    error: attendanceError,
  } = useAcademicRecords<Summary>("attendance");
  const {
    rows: grades,
    loading: gradesLoading,
    error: gradesError,
  } = useAcademicRecords<Summary>("grades");
  const {
    rows: classes,
    loading: classesLoading,
    error: classesError,
  } = useAcademicRecords<Summary>("classes");
  const loading = attendanceLoading || gradesLoading || classesLoading;
  const error = attendanceError || gradesError || classesError;
  const rows: Array<{
    key: ReportKey;
    nama: string;
    status: string;
    records: Summary[];
  }> = [
    {
      key: "attendance",
      nama: `Laporan Kehadiran (${attendance.length} data)`,
      status: loading ? "Memuat" : attendance.length ? "Tersedia" : "Kosong",
      records: attendance,
    },
    {
      key: "grades",
      nama: `Laporan Nilai (${grades.length} data)`,
      status: loading ? "Memuat" : grades.length ? "Tersedia" : "Kosong",
      records: grades,
    },
    {
      key: "classes",
      nama: `Laporan Kelas (${classes.length} kelas)`,
      status: loading ? "Memuat" : classes.length ? "Tersedia" : "Kosong",
      records: classes,
    },
  ];

  function downloadReport(reportKey?: ReportKey) {
    const selected = rows.filter((row) => !reportKey || row.key === reportKey);
    const records: Array<Record<string, string | number>> = selected.flatMap((report) =>
      report.records.map((record) => ({
        "Jenis Laporan":
          reportTypes.find((item) => item.key === report.key)?.label ??
          report.key,
        ...record,
      })),
    );
    const columns = [
      "Jenis Laporan",
      ...new Set(records.flatMap((record) => Object.keys(record))),
    ];
    const csv = [
      columns.map(csvCell).join(","),
      ...records.map((record) =>
        columns.map((column) => csvCell(record[column] ?? "")).join(","),
      ),
    ].join("\r\n");
    const file = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-akademik-${reportKey || "semua"}-${[
      new Date().getFullYear(),
      String(new Date().getMonth() + 1).padStart(2, "0"),
      String(new Date().getDate()).padStart(2, "0"),
    ].join("-")}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <SchoolShell title="Laporan Akademik" activeItem="Laporan Akademik">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>REPORTING</p>
            <h1>Laporan Akademik</h1>
            <p className={styles.subtitle}>
              Unduh data yang sudah tersimpan. Laporan mencakup seluruh data
              tanpa filter periode.
            </p>
          </div>
          <button
            type="button"
            className={styles.dateButton}
            disabled={loading || Boolean(error)}
            onClick={() => downloadReport()}
          >
            + Unduh Laporan
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>Dokumen Laporan</h3>
              <p>Data diambil dari penyimpanan akademik</p>
            </div>
            {error ? (
              <p className={styles.portalFormError} role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Nama Laporan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.nama}</td>
                  <td>
                    <span className={styles.statusBadge}>{row.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.tableAction}
                      disabled={loading || Boolean(error) || row.records.length === 0}
                      onClick={() => downloadReport(row.key)}
                    >
                      Unduh CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SchoolShell>
  );
}
