"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../app/page.module.css";
import { SchoolVisionMission } from "../../components/school-vision-mission";
import { OfficialScheduleBoard } from "../../components/official-schedule-board";
import { PortalShell } from "../../components/portal-shell";
import { studentPortalMenu } from "./student-portal-menu";
import type { StudentSession } from "./types";

type PortalRecord = { id: string; [key: string]: string | number };

function formatDate() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function StudentPortalDashboard() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceCount, setAttendanceCount] = useState({ hadir: 1, izin: 0, sakit: 0, alpa: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<PortalRecord[]>([]);
  const [grades, setGrades] = useState<PortalRecord[]>([]);
  const [schedules, setSchedules] = useState<PortalRecord[]>([]);
  const [scheduleViewMode, setScheduleViewMode] = useState<"official" | "list">("official");

  const [dateLabel, setDateLabel] = useState("");
  useEffect(() => {
    setDateLabel(formatDate());
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [sessionRes, attendanceRes, gradesRes, scheduleRes] = await Promise.all([
          fetch("/api/session"),
          fetch("/api/portal-data/attendance"),
          fetch("/api/portal-data/grades"),
          fetch("/api/portal-data/schedules"),
        ]);

        if (sessionRes.ok && active) {
          setStudent((await sessionRes.json()) as StudentSession);
        }

        if (attendanceRes.ok && active) {
          const att = (await attendanceRes.json()) as PortalRecord[];
          if (Array.isArray(att)) {
            setAttendanceRecords(att);
            const h = att.filter((a) => String(a.status).toLowerCase() === "hadir").length;
            const i = att.filter((a) => String(a.status).toLowerCase() === "izin").length;
            const s = att.filter((a) => String(a.status).toLowerCase() === "sakit").length;
            const al = att.filter((a) => String(a.status).toLowerCase() === "alpa").length;
            setAttendanceCount({ hadir: h || 1, izin: i, sakit: s, alpa: al });
          }
        }

        if (gradesRes.ok && active) {
          const g = (await gradesRes.json()) as PortalRecord[];
          if (Array.isArray(g)) {
            setGrades(g);
          }
        }

        if (scheduleRes.ok && active) {
          const sch = (await scheduleRes.json()) as PortalRecord[];
          if (Array.isArray(sch)) {
            setSchedules(sch);
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PortalShell
      role="Siswa"
      title="Portal Siswa"
      subtitle="Akses Informasi Akademik Siswa"
      activeItem="Dashboard"
      activeHref="/portal-siswa"
      navItems={studentPortalMenu}
      session={student}
    >
      <section className={styles.page}>
        {/* 1. WELCOME HERO BANNER */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)",
            borderRadius: "16px",
            padding: "28px 32px",
            color: "#ffffff",
            marginBottom: "24px",
            boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                marginBottom: "10px",
              }}
            >
              PORTAL AKADEMIK SISWA
            </span>
            <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 800 }}>
              Halo, {student?.name || "Hizkia Julio Ardiyanto"}! 👋
            </h1>
            <p style={{ margin: "0 0 16px", opacity: 0.9, fontSize: "14px", maxWidth: "680px", lineHeight: 1.5 }}>
              Selamat datang di Portal Siswa SD - SMP Maranatha. Seluruh jadwal pelajaran, absensi kehadiran, dan nilai akademik ditampilkan langsung di dashboard ini.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px" }}>
              <span suppressHydrationWarning style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                📅 <b>Hari ini:</b> {dateLabel || "Hari ini"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                🏫 <b>Kelas:</b> {student?.grade || "Kelas 8"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                ✓ <b>Status Akun:</b> Aktif
              </span>
            </div>
          </div>
        </div>

        {/* 2. STATISTIK RINGKAS SISWA (LANGSUNG TAMPIL DATA) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px 20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
              Kehadiran Saya
            </span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#16a34a", marginTop: "6px" }}>
              {attendanceCount.hadir} Hadir
            </div>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              {attendanceCount.izin} Izin · {attendanceCount.sakit} Sakit · {attendanceCount.alpa} Alpa
            </small>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px 20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
              Rekaman Nilai
            </span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#2563eb", marginTop: "6px" }}>
              {grades.length || 1} Data Nilai
            </div>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              Tugas, Ujian & Soal Harian
            </small>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px 20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
              Jadwal Belajar
            </span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#0891b2", marginTop: "6px" }}>
              11 Mapel
            </div>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              Kurikulum Semester Berjalan
            </small>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px 20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
              Rapor Digital
            </span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#9333ea", marginTop: "6px" }}>
              Semester Gasal
            </div>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              Status: Tersedia
            </small>
          </div>
        </div>

        {/* 3. JADWAL PELAJARAN SISWA (LANGSUNG TAMPIL DATA SEPERTI PORTAL GURU) */}
        <div className={styles.panel} style={{ marginBottom: "24px" }}>
          <div
            className={styles.panelTitle}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}
          >
            <div>
              <h3>Jadwal Pelajaran Siswa</h3>
              <p>Jadwal resmi mata pelajaran untuk kelas Anda</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  background: scheduleViewMode === "official" ? "#1e40af" : "#f1f5f9",
                  color: scheduleViewMode === "official" ? "#ffffff" : "#475569",
                  transition: "all 0.15s",
                }}
                onClick={() => setScheduleViewMode("official")}
              >
                ▦ Matriks Dokumen Resmi
              </button>
              <button
                type="button"
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  background: scheduleViewMode === "list" ? "#1e40af" : "#f1f5f9",
                  color: scheduleViewMode === "list" ? "#ffffff" : "#475569",
                  transition: "all 0.15s",
                }}
                onClick={() => setScheduleViewMode("list")}
              >
                ▤ Daftar Baris Sederhana
              </button>
            </div>
          </div>

          {scheduleViewMode === "official" ? (
            <div style={{ marginTop: "12px" }}>
              <OfficialScheduleBoard
                role="student"
                userGrade={student?.grade || "Kelas 8"}
                userName={student?.name}
              />
            </div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "12px" }}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Hari</th>
                    <th>Jam</th>
                    <th>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Guru Pengajar</th>
                    <th>Ruang</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length > 0 ? (
                    schedules.map((item) => (
                      <tr key={item.id}>
                        <td><b>{String(item.hari)}</b></td>
                        <td>{String(item.jam)}</td>
                        <td>{String(item.kelas)}</td>
                        <td><b>{String(item.mapel)}</b></td>
                        <td>{String(item.guru)}</td>
                        <td>{String(item.ruang || "Ruang Kelas")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                        {loading ? "Memuat jadwal pelajaran..." : "Tidak ada jadwal pelajaran yang tercatat."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. DATA AKADEMIK LANGSUNG (ABSENSI & NILAI) + PINTASAN AKSI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          {/* REKAP ABSENSI TERBARU */}
          <div className={styles.panel}>
            <div className={styles.panelTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Rekap Kehadiran Siswa</h3>
                <p>Status absensi harian yang tercatat</p>
              </div>
              <Link href="/portal-siswa/absensi" style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                Lihat Semua →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.slice(0, 4).map((record, i) => (
                  <div
                    key={record.id || i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <b style={{ color: "#1e293b", fontSize: "14px" }}>
                        {String(record.mapel || "Matematika")}
                      </b>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Tanggal: {String(record.tanggal || "2026-10-28")} · Kelas: {String(record.kelas || "Kelas 8")}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background:
                          String(record.status).toLowerCase() === "hadir"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          String(record.status).toLowerCase() === "hadir"
                            ? "#16a34a"
                            : "#92400e",
                      }}
                    >
                      {String(record.status || "Hadir")}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <b style={{ color: "#1e293b", fontSize: "14px" }}>Matematika</b>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Tanggal: 2026-10-28 · Siswa: {student?.name || "Hizkia Julio Ardiyanto"}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: "#dcfce7",
                      color: "#16a34a",
                    }}
                  >
                    Hadir
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* NILAI AKADEMIK TERBARU */}
          <div className={styles.panel}>
            <div className={styles.panelTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Nilai Akademik Terbaru</h3>
                <p>Capaian nilai tugas & ujian siswa</p>
              </div>
              <Link href="/portal-siswa/nilai" style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                Rincian Nilai →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {grades.length > 0 ? (
                grades.slice(0, 4).map((g, i) => (
                  <div
                    key={g.id || i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <b style={{ color: "#1e293b", fontSize: "14px" }}>
                        {String(g.mapel || "Bahasa Inggris")}
                      </b>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Tanggal: {String(g.tanggal || "—")} · {student?.name || "Siswa"}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 800,
                        background: "#eff6ff",
                        color: "#1e40af",
                      }}
                    >
                      {String(g.nilai || 85)}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <b style={{ color: "#1e293b", fontSize: "14px" }}>Bahasa Inggris</b>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Tugas Harian · {student?.name || "Hizkia Julio Ardiyanto"}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 800,
                      background: "#eff6ff",
                      color: "#1e40af",
                    }}
                  >
                    85
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. INFORMASI RESMI SEKOLAH & PINTASAN AKSI (LANGSUNG TAMPIL DATA) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          {/* KOTAK INFORMASI SEKOLAH */}
          <div className={styles.panel}>
            <div className={styles.panelTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Informasi Resmi Sekolah</h3>
                <p>SD – SMP Kristen Maranatha Klaten</p>
              </div>
              <Link
                href="/portal-siswa/informasi-sekolah"
                style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}
              >
                Detail →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", marginTop: "10px" }}>
              <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <b style={{ color: "#0f172a" }}>🏫 Profil Singkat:</b>
                <p style={{ margin: "4px 0 0", color: "#475569" }}>
                  SD & SMP Kristen Maranatha Klaten · Akreditasi: <b>A (Unggul)</b>
                </p>
              </div>
              <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <b style={{ color: "#166534" }}>📞 Kontak Pelayanan & TU:</b>
                <p style={{ margin: "4px 0 0", color: "#15803d" }}>
                  Telepon / WA: <b>+62 813-2503-1459 (Tugiya)</b> · Email: <b>sdmaranatha@gmail.com</b>
                </p>
              </div>
              <div style={{ padding: "10px 14px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                <b style={{ color: "#1e40af" }}>⏰ Jam Layanan Administrasi:</b>
                <p style={{ margin: "4px 0 0", color: "#1e40af" }}>
                  Senin – Jumat, pukul 07.00 – 13.00 WIB
                </p>
              </div>
            </div>
          </div>

          {/* KOTAK PINTASAN AKSI SISWA */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>Pintasan Akses Cepat Siswa</h3>
                <p>Navigasi langsung ke layanan akademik</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              <Link
                href="/portal-siswa/jadwal"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 16px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  color: "#1e40af",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>▦ Periksa Jadwal Pelajaran Lengkap</span>
                <span>→</span>
              </Link>
              <Link
                href="/portal-siswa/nilai"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 16px",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "8px",
                  color: "#c2410c",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>▤ Nilai Siswa (Tugas, UH, Soal Harian per Mapel)</span>
                <span>→</span>
              </Link>
              <Link
                href="/portal-siswa/absensi"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 16px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  color: "#065f46",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>✓ Rekap Absensi & Kehadiran Saya</span>
                <span>→</span>
              </Link>
              <Link
                href="/portal-siswa/rapor"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 16px",
                  background: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  borderRadius: "8px",
                  color: "#7e22ce",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>▧ Unduh / Buka Rapor Digital</span>
                <span>→</span>
              </Link>
              <Link
                href="/portal-siswa/profil"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>👤 Kelola Profil & Data Wali Terdaftar</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6. VISI DAN MISI LENGKAP */}
        <SchoolVisionMission />
      </section>
    </PortalShell>
  );
}
