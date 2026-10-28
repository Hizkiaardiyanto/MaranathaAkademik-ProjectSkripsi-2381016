"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import { SchoolVisionMission } from "../../components/school-vision-mission";
import { OfficialScheduleBoard } from "../../components/official-schedule-board";
import { PortalShell } from "../../components/portal-shell";
import { teacherPortalMenu } from "../../features/student-portal/student-portal-menu";
import { getApiErrorMessage } from "../../lib/api-error";

type TeacherSession = { name: string; email: string; subject: string };
type PortalRecord = { id: string; [key: string]: string | number };

export default function TeacherPortalPage() {
  const [teacher, setTeacher] = useState<TeacherSession | null>(null);
  const [schedules, setSchedules] = useState<PortalRecord[]>([]);
  const [classes, setClasses] = useState<PortalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dashboardScheduleMode, setDashboardScheduleMode] = useState<
    "official" | "list"
  >("official");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [sessionResponse, scheduleResponse, classResponse] =
          await Promise.all([
            fetch("/api/session"),
            fetch("/api/portal-data/schedules"),
            fetch("/api/portal-data/classes"),
          ]);
        if (!sessionResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              sessionResponse,
              "Data akun guru tidak dapat dimuat.",
            ),
          );
        }
        if (!scheduleResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              scheduleResponse,
              "Jadwal mengajar tidak dapat dimuat.",
            ),
          );
        }
        if (!classResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              classResponse,
              "Data kelas guru tidak dapat dimuat.",
            ),
          );
        }
        const [teacherData, scheduleData, classData]: [
          unknown,
          unknown,
          unknown,
        ] = await Promise.all([
          sessionResponse.json(),
          scheduleResponse.json(),
          classResponse.json(),
        ]);
        if (
          !teacherData ||
          typeof teacherData !== "object" ||
          Array.isArray(teacherData) ||
          !Array.isArray(scheduleData) ||
          !Array.isArray(classData)
        ) {
          throw new Error("Format data portal guru tidak valid.");
        }
        if (active) {
          setTeacher(teacherData as TeacherSession);
          setSchedules(scheduleData as PortalRecord[]);
          setClasses(classData as PortalRecord[]);
          setLoadError("");
        }
      } catch (error) {
        console.error("Failed to load teacher dashboard:", error);
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Data portal guru tidak dapat dimuat.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PortalShell
      role="Guru"
      title="Portal Guru"
      subtitle="Pengelolaan Akademik & Jadwal Mengajar"
      activeItem="Dashboard"
      activeHref="/portal-guru"
      navItems={teacherPortalMenu}
      session={teacher}
    >
      <section className={styles.page}>
        {/* WELCOME BANNER GURU */}
        <div
          style={{
            background: "linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)",
            borderRadius: "16px",
            padding: "26px 32px",
            color: "#ffffff",
            marginBottom: "24px",
            boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.25)",
          }}
        >
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
            PORTAL TENAGA PENDIDIK
          </span>
          <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 800 }}>
            Selamat Datang, {teacher?.name || "Bapak/Ibu Guru"}!
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "14px", lineHeight: 1.5 }}>
            Mata Pelajaran: <b>{teacher?.subject || "Semua Mata Pelajaran"}</b> · SD - SMP Kristen Maranatha
          </p>
        </div>

        {loadError && (
          <p className={styles.portalFormError} role="alert">
            {loadError}
          </p>
        )}

        {/* METRICS GRID GURU */}
        <div className={styles.statsGrid} style={{ marginBottom: "24px" }}>
          <article className={`${styles.statCard} ${styles.blue}`}>
            <div className={styles.statIcon}>▦</div>
            <div>
              <p>Kelas Ditugaskan</p>
              <h2>{classes.length}</h2>
              <span>Kelas rombel aktif</span>
            </div>
          </article>

          <article className={`${styles.statCard} ${styles.purple}`}>
            <div className={styles.statIcon}>◷</div>
            <div>
              <p>Jadwal Mengajar</p>
              <h2>{schedules.length}</h2>
              <span>Sesi per minggu</span>
            </div>
          </article>

          <article className={`${styles.statCard} ${styles.orange}`}>
            <div className={styles.statIcon}>✓</div>
            <div>
              <p>Absensi Siswa</p>
              <h2 style={{ fontSize: "18px", marginTop: "4px" }}>
                <Link
                  href="/portal-guru/absensi"
                  style={{ color: "inherit", textDecoration: "underline" }}
                >
                  Catat Kehadiran →
                </Link>
              </h2>
              <span>Input presensi siswa</span>
            </div>
          </article>

          <article className={`${styles.statCard} ${styles.yellow}`}>
            <div className={styles.statIcon}>▤</div>
            <div>
              <p>Pengelolaan Nilai</p>
              <h2 style={{ fontSize: "18px", marginTop: "4px" }}>
                <Link
                  href="/portal-guru/nilai"
                  style={{ color: "inherit", textDecoration: "underline" }}
                >
                  Input Nilai Mapel →
                </Link>
              </h2>
              <span>Tugas, UTS & UAS</span>
            </div>
          </article>
        </div>

        {/* JADWAL PELAJARAN / MENGAJAR */}
        <div className={styles.panel} style={{ marginBottom: "24px" }}>
          <div
            className={styles.panelTitle}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3>Jadwal Pelajaran & Mengajar Guru</h3>
              <p>Jadwal pengajaran resmi sesuai dokumen sekolah</p>
            </div>
            <Link
              href="/portal-guru/jadwal"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#059669",
                textDecoration: "none",
              }}
            >
              Buka Jadwal Lengkap →
            </Link>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            <button
              type="button"
              style={{
                padding: "7px 16px",
                borderRadius: "6px",
                border: "none",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                background:
                  dashboardScheduleMode === "official" ? "#059669" : "#f1f5f9",
                color:
                  dashboardScheduleMode === "official" ? "#ffffff" : "#475569",
                transition: "all 0.15s",
              }}
              onClick={() => setDashboardScheduleMode("official")}
            >
              ▦ Matriks Dokumen Resmi (Sesuai Jadwal Sekolah)
            </button>
            <button
              type="button"
              style={{
                padding: "7px 16px",
                borderRadius: "6px",
                border: "none",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                background:
                  dashboardScheduleMode === "list" ? "#059669" : "#f1f5f9",
                color:
                  dashboardScheduleMode === "list" ? "#ffffff" : "#475569",
                transition: "all 0.15s",
              }}
              onClick={() => setDashboardScheduleMode("list")}
            >
              ▤ Daftar Baris Mengajar Saya
            </button>
          </div>

          {dashboardScheduleMode === "official" ? (
            <OfficialScheduleBoard role="teacher" userName={teacher?.name} />
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Hari</th>
                  <th>Waktu</th>
                  <th>Kelas</th>
                  <th>Mata Pelajaran</th>
                  <th>Ruang</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr key={item.id}>
                    <td><b>{item.hari}</b></td>
                    <td>{item.jam}</td>
                    <td>{item.kelas}</td>
                    <td>{item.mapel}</td>
                    <td>{item.ruang}</td>
                  </tr>
                ))}
                {!loading && !schedules.length ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                      Belum ada jadwal untuk mata pelajaran Anda.
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                      Memuat jadwal mengajar...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>

        {/* KELAS YANG DITUGASKAN & PINTASAN AKSI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>Kelas yang Ditugaskan</h3>
                <p>Daftar rombongan belajar yang Anda ajar</p>
              </div>
            </div>
            {classes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {classes.map((item) => (
                  <div
                    key={item.id}
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
                      <b style={{ color: "#1e293b", fontSize: "14px" }}>{item.kelas}</b>
                      <span style={{ marginLeft: "8px", fontSize: "12px", color: "#64748b" }}>
                        ({item.jenjang})
                      </span>
                    </div>
                    <small style={{ color: "#475569", fontWeight: 600 }}>
                      Wali: {item.wali || "—"}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "13px", margin: "8px 0" }}>
                {loading ? "Memuat kelas..." : "Belum ada kelas yang ditugaskan."}
              </p>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>Pintasan Aksi Guru</h3>
                <p>Akses cepat penginputan data harian</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/portal-guru/absensi"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  color: "#065f46",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                <span>✓ Catat Kehadiran Siswa Hari Ini</span>
                <span>→</span>
              </Link>
              <Link
                href="/portal-guru/nilai"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  color: "#1e40af",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                <span>▤ Masukkan / Perbarui Nilai Siswa</span>
                <span>→</span>
              </Link>
              <Link
                href="/portal-guru/jadwal"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                <span>▦ Periksa Jadwal Mengajar Lengkap</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* VISI MISI SEKOLAH */}
        <SchoolVisionMission />
      </section>
    </PortalShell>
  );
}
