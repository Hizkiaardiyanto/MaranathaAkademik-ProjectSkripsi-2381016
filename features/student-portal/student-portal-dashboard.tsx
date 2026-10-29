"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../app/page.module.css";
import { SchoolVisionMission } from "../../components/school-vision-mission";
import { PortalShell } from "../../components/portal-shell";
import { studentPortalMenu } from "./student-portal-menu";
import type { StudentSession } from "./types";

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
  const [attendanceCount, setAttendanceCount] = useState({ hadir: 0, izin: 0, sakit: 0, alpa: 0 });
  const [gradesCount, setGradesCount] = useState(0);
  const [todaySchedules, setTodaySchedules] = useState<Array<{ id: string; jam: string; mapel: string; guru: string; ruang: string }>>([]);

  const dateLabel = formatDate();

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
          const att = (await attendanceRes.json()) as Array<{ status: string }>;
          if (Array.isArray(att)) {
            const h = att.filter((a) => a.status?.toLowerCase() === "hadir").length;
            const i = att.filter((a) => a.status?.toLowerCase() === "izin").length;
            const s = att.filter((a) => a.status?.toLowerCase() === "sakit").length;
            const al = att.filter((a) => a.status?.toLowerCase() === "alpa").length;
            setAttendanceCount({ hadir: h, izin: i, sakit: s, alpa: al });
          }
        }

        if (gradesRes.ok && active) {
          const g = (await gradesRes.json()) as Array<{ nilai: number }>;
          if (Array.isArray(g)) {
            setGradesCount(g.length);
          }
        }

        if (scheduleRes.ok && active) {
          const sch = (await scheduleRes.json()) as Array<{ id: string; jam: string; mapel: string; guru: string; ruang: string }>;
          if (Array.isArray(sch)) {
            setTodaySchedules(sch.slice(0, 4));
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
            <h1 style={{ margin: "0 0 8px", fontSize: "26px", fontWeight: 800 }}>
              Halo, {student?.name || "Siswa Maranatha"}! 👋
            </h1>
            <p style={{ margin: "0 0 16px", opacity: 0.9, fontSize: "14px", maxWidth: "680px", lineHeight: 1.5 }}>
              Selamat datang di Portal Siswa SD - SMP Maranatha. Portal ini disediakan khusus untuk memudahkan Anda mengakses seluruh informasi akademik Anda secara mandiri, cepat, dan transparan.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                📅 <b>Hari ini:</b> {dateLabel}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                🏫 <b>Kelas:</b> {student?.grade || "Siswa SD - SMP Kristen Maranatha"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                ✓ <b>Status Akun:</b> Aktif
              </span>
            </div>
          </div>
        </div>

        {/* 2. FITUR UTAMA PORTAL SISWA (5 POIN UTAMA) */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
              Akses Informasi Akademik Siswa
            </h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
              Pilih menu di bawah ini untuk melihat jadwal, absensi, nilai, rapor digital, dan profil sekolah.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {/* FITUR 1: Melihat Jadwal Pelajaran */}
            <Link
              href="/portal-siswa/jadwal"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    marginBottom: "14px",
                  }}
                >
                  ◷
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Melihat Jadwal Pelajaran
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
                  Periksa jadwal mata pelajaran harian, waktu sesi, ruang kelas, dan nama guru pengajar.
                </p>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>Buka Jadwal</span>
                <span>→</span>
              </div>
            </Link>

            {/* FITUR 2: Melihat Absensi */}
            <Link
              href="/portal-siswa/absensi"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    marginBottom: "14px",
                  }}
                >
                  ✓
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Melihat Absensi Siswa
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
                  Pantau rekap kehadiran harian: status Hadir, Izin, Sakit, atau Alpa secara langsung.
                </p>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#059669",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>
                  {loading ? "Memuat..." : `${attendanceCount.hadir} Hadir · ${attendanceCount.izin + attendanceCount.sakit} Izin/Sakit`}
                </span>
                <span>→</span>
              </div>
            </Link>

            {/* FITUR 3: Melihat Nilai */}
            <Link
              href="/portal-siswa/nilai"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#fff7ed",
                    color: "#ea580c",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    marginBottom: "14px",
                  }}
                >
                  ▤
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Melihat Nilai Akademik
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
                  Lihat rincian nilai tugas, ujian harian, dan latihan soal harian terkelompok per mata pelajaran.
                </p>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#ea580c",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>{loading ? "Memuat..." : `${gradesCount} Rekaman Nilai`}</span>
                <span>→</span>
              </div>
            </Link>

            {/* FITUR 4: Melihat Rapor jika sudah tersedia secara digital */}
            <Link
              href="/portal-siswa/rapor"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#faf5ff",
                    color: "#7e22ce",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    marginBottom: "14px",
                  }}
                >
                  ▧
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Melihat Rapor Digital
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
                  Akses laporan hasil belajar siswa semester berjalan jika sudah diterbitkan secara digital oleh sekolah.
                </p>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#7e22ce",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>Lihat Status Rapor</span>
                <span>→</span>
              </div>
            </Link>

            {/* FITUR 5: Melihat Informasi Sekolah */}
            <Link
              href="/portal-siswa/informasi-sekolah"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#ecfeff",
                    color: "#0891b2",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    marginBottom: "14px",
                  }}
                >
                  ⓘ
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Melihat Informasi Sekolah
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
                  Informasi resmi, profil, visi & misi, serta kontak layanan administrasi SD - SMP Maranatha.
                </p>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#0891b2",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <span>Buka Informasi</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 3. JADWAL HARI INI & PENGUMUMAN */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          {/* Jadwal Pelajaran Singkat */}
          <div className={styles.panel}>
            <div className={styles.panelTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Jadwal Pelajaran Terdekat</h3>
                <p>Pratinjau jadwal belajar kelas Anda</p>
              </div>
              <Link href="/portal-siswa/jadwal" style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                Lihat Semua Jadwal →
              </Link>
            </div>
            {todaySchedules.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {todaySchedules.map((item, idx) => (
                  <div
                    key={item.id || idx}
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
                      <b style={{ color: "#1e293b", fontSize: "14px" }}>{item.mapel}</b>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Guru: {item.guru} · Ruang: {item.ruang || "-"}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "4px 8px", borderRadius: "6px" }}>
                      {item.jam}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "13px", margin: "8px 0" }}>
                {loading ? "Memuat jadwal..." : "Tidak ada jadwal pelajaran yang tercatat saat ini."}
              </p>
            )}
          </div>

          {/* Visi Misi / Profil Singkat */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>Profil & Visi Misi Sekolah</h3>
                <p>SD - SMP Kristen Maranatha</p>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Membentuk generasi peserta didik yang takut akan Tuhan, berkarakter unggul, berilmu pengetahuan tinggi, dan siap melayani sesama dengan penuh kasih dan integritas.
            </p>
            <div style={{ marginTop: "16px" }}>
              <Link
                href="/portal-siswa/informasi-sekolah"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  background: "#f1f5f9",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Lihat Informasi Sekolah Selengkapnya →
              </Link>
            </div>
          </div>
        </div>

        {/* 4. VISI DAN MISI LENGKAP */}
        <SchoolVisionMission />
      </section>
    </PortalShell>
  );
}
