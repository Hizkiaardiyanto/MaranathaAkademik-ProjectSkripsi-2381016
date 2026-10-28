"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sessionMarkerKey } from "../../lib/browser-session";
import styles from "../page.module.css";
import { SchoolVisionMission } from "../../components/school-vision-mission";
import { OfficialScheduleBoard } from "../../components/official-schedule-board";
import { useSidebarCollapse } from "../../lib/use-sidebar-collapse";
import { getApiErrorMessage } from "../../lib/api-error";

type TeacherSession = { name: string; email: string; subject: string };
type PortalRecord = { id: string; [key: string]: string | number };

const menu = [
  ["Dashboard", "/portal-guru", "⌂"],
  ["Jadwal Mengajar", "/portal-guru/jadwal", "▦"],
  ["Kelas Mapel", "/portal-guru/kelas", "▤"],
  ["Absensi Siswa", "/portal-guru/kehadiran", "✓"],
  ["Input Nilai", "/portal-guru/nilai", "◷"],
  ["Mata Pelajaran", "/portal-guru/mata-pelajaran", "◈"],
];

export default function TeacherPortalPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherSession | null>(null);
  const [schedules, setSchedules] = useState<PortalRecord[]>([]);
  const [classes, setClasses] = useState<PortalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dashboardScheduleMode, setDashboardScheduleMode] = useState<"official" | "list">("official");
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobile } =
    useSidebarCollapse("maranatha_teacher_sidebar_collapsed");
  const [menuSearch, setMenuSearch] = useState("");

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

  async function logout() {
    window.sessionStorage.removeItem(sessionMarkerKey);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.replace("/login/guru");
      router.refresh();
    }
  }

  const initials = (teacher?.name || "Guru")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const filteredMenu = menu.filter(([label]) =>
    label.toLowerCase().includes(menuSearch.trim().toLowerCase()),
  );

  return (
    <div className={styles.studentDashboard}>
      {/* TOPBAR: always full-width at the top */}
      <header className={styles.studentTopbar}>
        <div className={styles.headerBrandBlock}>
          <span className={styles.headerBrandLogo}>M</span>
          <span className={styles.headerBrandTitle}>SD - SMP Maranatha</span>
          <button
            type="button"
            className={styles.headerHamburgerBtn}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Buka menu sidebar" : "Ciutkan menu sidebar"}
            title={isCollapsed ? "Buka menu sidebar (Expand)" : "Ciutkan menu sidebar (Collapse)"}
          >
            ☰
          </button>
        </div>
        <div className={styles.studentTopbarActions}>
          <div className={styles.studentProfile}>
            <span className={styles.studentAvatar}>{initials}</span>
            <span>
              <b>{teacher?.name || "Guru"}</b>
              <small>{teacher?.subject || "Mata pelajaran"}</small>
            </span>
          </div>
          <button
            type="button"
            className={styles.studentLogoutTopbar}
            onClick={logout}
          >
            Keluar
          </button>
        </div>
      </header>

      {/* BODY: sidebar (left) + main content (right) */}
      <div className={styles.shellBody}>
        {isMobileOpen && (
          <div
            className={styles.sidebarBackdrop}
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}

        <aside
          className={`${styles.studentSidebar} ${isCollapsed ? styles.studentSidebarCollapsed : ""} ${isMobileOpen ? styles.studentSidebarMobileOpen : ""}`}
        >
          <div className={styles.brandRow}>
            <Link href="/portal-guru" className={styles.studentBrand} title="SD - SMP Maranatha">
              <span className={styles.studentBrandMark}>M</span>
              {(!isCollapsed || isMobileOpen) && (
                <span>
                  SD - SMP <b>Maranatha</b>
                </span>
              )}
            </Link>
            {isMobileOpen ? (
              <button
                type="button"
                className={styles.mobileCloseDrawerBtn}
                onClick={closeMobile}
                title="Tutup menu"
                aria-label="Tutup menu"
              >
                ×
              </button>
            ) : !isCollapsed ? (
              <button
                type="button"
                className={styles.sidebarCollapseBtn}
                onClick={toggleSidebar}
                title="Ciutkan menu sidebar (Collapse)"
                aria-label="Ciutkan menu sidebar"
              >
                «
              </button>
            ) : null}
          </div>

          {(!isCollapsed || isMobileOpen) && (
            <label className={styles.studentSearch} style={{ marginBottom: "12px" }}>
              <span aria-hidden="true">⌕</span>
              <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Cari menu (min. 2 karakter)..."
                aria-label="Cari menu"
              />
              {menuSearch && (
                <button
                  type="button"
                  onClick={() => setMenuSearch("")}
                  className={styles.searchClearBtn}
                  title="Hapus pencarian"
                >
                  ×
                </button>
              )}
            </label>
          )}

          {(!isCollapsed || isMobileOpen) && <p className={styles.studentMenuLabel}>MENU GURU</p>}

          <nav className={styles.studentNav} aria-label="Navigasi portal guru">
            {filteredMenu.map(([label, href, icon]) => (
              <Link
                key={href}
                href={href}
                className={`${styles.studentNavItem} ${href === "/portal-guru" ? styles.studentNavActive : ""}`}
                data-tooltip={label}
                title={isCollapsed && !isMobileOpen ? label : undefined}
                onClick={() => {
                  if (isMobileOpen) closeMobile();
                }}
              >
                <span aria-hidden="true">{icon}</span>
                {(!isCollapsed || isMobileOpen) && (
                  <>
                    <span className={styles.studentNavLabel}>{label}</span>
                    <span className={styles.studentNavArrow} aria-hidden="true">
                      ›
                    </span>
                  </>
                )}
              </Link>
            ))}
            {filteredMenu.length === 0 && (!isCollapsed || isMobileOpen) && (
              <p className={styles.menuEmptyNotice}>Menu tidak ditemukan</p>
            )}
          </nav>

          <div className={styles.studentSidebarBottom}>
            <span className={styles.studentHelpIcon} title="Butuh bantuan?">
              ?
            </span>
            {(!isCollapsed || isMobileOpen) && (
              <span>
                <b>Butuh bantuan?</b>
                <small>Hubungi administrasi sekolah</small>
              </span>
            )}
          </div>
          <button
            type="button"
            className={styles.studentLogout}
            onClick={logout}
            title={isCollapsed && !isMobileOpen ? "Keluar" : undefined}
          >
            <span aria-hidden="true">↪</span>
            {(!isCollapsed || isMobileOpen) && " Keluar"}
          </button>
        </aside>

        <main
          className={`${styles.studentMain} ${isCollapsed ? styles.studentMainCollapsed : ""}`}
        >
          <div className={styles.studentContent}>
            <section className={styles.studentSemester}>
            <div>
              <span aria-hidden="true">◈</span>
              <b>MATA PELAJARAN:</b>
              <strong>{teacher?.subject || "Memuat data..."}</strong>
            </div>
            <div>
              <span aria-hidden="true">♟</span>
              <b>GURU:</b>
              <strong>{teacher?.name || "Memuat data..."}</strong>
            </div>
          </section>

          {loadError ? (
            <p className={styles.portalFormError} role="alert">
              {loadError}
            </p>
          ) : null}

          <section className={styles.studentMetricGrid}>
            <div className={styles.studentMetric}>
              <strong>{classes.length}</strong>
              <b>Kelas Mapel</b>
              <small>Kelas yang ditugaskan</small>
            </div>
            <div className={styles.studentMetric}>
              <strong>{schedules.length}</strong>
              <b>Jadwal Mengajar</b>
              <small>Sesuai mata pelajaran Anda</small>
            </div>
            <Link
              href="/portal-guru/kehadiran"
              className={styles.studentMetric}
            >
              <span className={styles.studentMetricIcon}>✓</span>
              <b>Absensi Siswa</b>
              <small>Catat kehadiran kelas</small>
            </Link>
            <Link href="/portal-guru/nilai" className={styles.studentMetric}>
              <span className={styles.studentMetricIcon}>◷</span>
              <b>Input Nilai</b>
              <small>Nilai mapel Anda</small>
            </Link>
          </section>

          <section className={styles.studentPanel} style={{ marginBottom: "20px" }}>
            <div className={styles.studentPanelHeading}>
              <div>
                <span aria-hidden="true">▦</span>
                <h1>Jadwal Pelajaran &amp; Mengajar Guru</h1>
              </div>
              <Link
                href="/portal-guru/jadwal"
                className={styles.studentTextLink}
              >
                Buka jadwal lengkap →
              </Link>
            </div>
            <div className={styles.studentPanelBody}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                <button
                  type="button"
                  style={{
                    padding: "7px 16px",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    background: dashboardScheduleMode === "official" ? "#1e40af" : "#f1f5f9",
                    color: dashboardScheduleMode === "official" ? "#ffffff" : "#475569",
                    transition: "all 0.15s",
                  }}
                  onClick={() => setDashboardScheduleMode("official")}
                >
                  ▦ Matriks Dokumen Resmi (Sesuai Gambar)
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
                    background: dashboardScheduleMode === "list" ? "#1e40af" : "#f1f5f9",
                    color: dashboardScheduleMode === "list" ? "#ffffff" : "#475569",
                    transition: "all 0.15s",
                  }}
                  onClick={() => setDashboardScheduleMode("list")}
                >
                  ▤ Daftar Mengajar Saya
                </button>
              </div>

              {dashboardScheduleMode === "official" ? (
                <OfficialScheduleBoard role="teacher" userName={teacher?.name} />
              ) : (
                <div className={styles.studentTableWrap}>
                  <table className={styles.studentScheduleTable}>
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
                          <td>{item.hari}</td>
                          <td>{item.jam}</td>
                          <td>{item.kelas}</td>
                          <td>{item.mapel}</td>
                          <td>{item.ruang}</td>
                        </tr>
                      ))}
                      {!loading && !schedules.length ? (
                        <tr>
                          <td colSpan={5} className={styles.studentEmptyCell}>
                            Belum ada jadwal untuk mata pelajaran Anda.
                          </td>
                        </tr>
                      ) : null}
                      {loading ? (
                        <tr>
                          <td colSpan={5} className={styles.studentEmptyCell}>
                            Memuat jadwal...
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <div className={styles.studentInfoGrid}>

            <section className={styles.studentPanel}>
              <div className={styles.studentPanelHeading}>
                <div>
                  <span className={styles.studentGreenIcon}>✓</span>
                  <h2>Kelas yang Ditugaskan</h2>
                </div>
              </div>
              <div className={styles.studentPanelBody}>
                {classes.map((item) => (
                  <div className={styles.teacherClassRow} key={item.id}>
                    <b>{item.kelas}</b>
                    <span>{item.jenjang}</span>
                    <small>{item.wali}</small>
                  </div>
                ))}
                {!loading && !classes.length ? (
                  <p className={styles.studentEmptyCell}>
                    Belum ada kelas untuk mata pelajaran ini.
                  </p>
                ) : null}
              </div>
            </section>
          </div>

          <section className={styles.studentPanel}>
            <div className={styles.studentPanelHeading}>
              <div>
                <span aria-hidden="true">＋</span>
                <h2>Mulai Kegiatan Mengajar</h2>
              </div>
            </div>
            <div className={styles.teacherActions}>
              <Link href="/portal-guru/kehadiran">
                <span aria-hidden="true">✓</span>
                <b>Input Kehadiran</b>
                <small>Hadir, izin, sakit, atau alpa</small>
              </Link>
              <Link href="/portal-guru/nilai">
                <span aria-hidden="true">◷</span>
                <b>Input Nilai</b>
                <small>
                  Nilai untuk {teacher?.subject || "mata pelajaran"}
                </small>
              </Link>
              <Link href="/portal-guru/jadwal">
                <span aria-hidden="true">▦</span>
                <b>Lihat Jadwal</b>
                <small>Kelas yang Anda ajar</small>
              </Link>
            </div>
          </section>
          <SchoolVisionMission />
          </div>
        </main>
      </div>
    </div>
  );
}
