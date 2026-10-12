"use client";

import { SchoolShell } from "@/components/school-shell";
import { useAcademicRecords } from "@/lib/use-academic-records";
import styles from "../page.module.css";

type Grade = { id: string; nama: string; mapel: string; nilai: number };

function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function RaporPage() {
  return (
    <SchoolShell title="Rapor" activeItem="Rapor">
      <RaporContent />
    </SchoolShell>
  );
}

function RaporContent() {
  const { rows, loading, error } = useAcademicRecords<Grade>("grades");

  function downloadReport() {
    const columns = ["Nama Siswa", "Mata Pelajaran", "Nilai"];
    const csv = [
      columns.map(csvCell).join(","),
      ...rows.map((row) =>
        [row.nama, row.mapel, row.nilai].map(csvCell).join(","),
      ),
    ].join("\r\n");
    const file = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap-nilai-${[
      new Date().getFullYear(),
      String(new Date().getMonth() + 1).padStart(2, "0"),
      String(new Date().getDate()).padStart(2, "0"),
    ].join("-")}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>LAPORAN</p>
            <h1>Rapor</h1>
            <p className={styles.subtitle}>
              Rekap nilai tersimpan; periode/semester belum tersedia pada data.
            </p>
          </div>
          <button
            type="button"
            className={styles.dateButton}
            onClick={downloadReport}
            disabled={loading || Boolean(error) || rows.length === 0}
          >
            Unduh Rekap Nilai CSV
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>Rekap Nilai</h3>
              <p>Nilai siswa yang telah tersimpan pada sistem</p>
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>Memuat data nilai...</div>
          ) : error ? (
            <p className={styles.portalFormError} role="alert">
              {error}
            </p>
          ) : rows.length === 0 ? (
            <div className={styles.emptyState}>
              Rapor belum dibuat untuk periode ini.
            </div>
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>Mata Pelajaran</th>
                  <th>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.nama}</td>
                    <td>{row.mapel}</td>
                    <td>{row.nilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
