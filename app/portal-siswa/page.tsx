"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sessionMarkerKey } from "../../lib/browser-session";
import styles from "../page.module.css";
import { SchoolVisionMission } from "../../components/school-vision-mission";
import { OfficialScheduleBoard } from "../../components/official-schedule-board";
import { getApiErrorMessage } from "../../lib/api-error";

type StudentSession = {
  email: string;
  role: string;
  name: string;
  grade: string;
};

type AcademicRecord = Record<string, string | number> & { id: string };
type StudentGrade = AcademicRecord & { nilai?: number };

const menus = [
  { label: "Dashboard", href: "#overview", icon: "⌂" },
  { label: "Jadwal Pelajaran", href: "/portal-siswa/jadwal", icon: "▦" },
  { label: "Kelas", href: "/portal-siswa/kelas", icon: "▤" },
  { label: "Kehadiran", href: "/portal-siswa/kehadiran", icon: "✓" },
  { label: "Nilai Akademik", href: "/portal-siswa/nilai", icon: "◷" },
  { label: "Rapor", href: "/portal-siswa/rapor", icon: "▧" },
  { label: "Mata Pelajaran", href: "/portal-siswa/mata-pelajaran", icon: "◈" },
  { label: "Pendaftaran", href: "/portal-siswa/register", icon: "＋" },
  { label: "Informasi Sekolah", href: "#informasi-sekolah", icon: "ⓘ" },
];

function getTodayName() {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(
    new Date(),
  );
}

function formatDate() {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export default function StudentPortalPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [schedules, setSchedules] = useState<AcademicRecord[]>([]);
  const [subjects, setSubjects] = useState<AcademicRecord[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [attendance, setAttendance] = useState<AcademicRecord[]>([]);
  const [search, setSearch] = useState("");
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [dashboardScheduleMode, setDashboardScheduleMode] = useState<"official" | "table">("official");
  const [today] = useState(getTodayName);
  const [dateLabel] = useState(formatDate);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [
          sessionResponse,
          scheduleResponse,
          subjectResponse,
          gradesResponse,
          attendanceResponse,
        ] = await Promise.all([
          fetch("/api/session"),
          fetch("/api/portal-data/schedules"),
          fetch("/api/portal-data/subjects"),
          fetch("/api/portal-data/grades"),
          fetch("/api/portal-data/attendance"),
        ]);

        if (!sessionResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              sessionResponse,
              "Data akun siswa tidak dapat dimuat.",
            ),
          );
        }
        if (!scheduleResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              scheduleResponse,
              "Jadwal siswa tidak dapat dimuat.",
            ),
          );
        }
        if (!subjectResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              subjectResponse,
              "Mata pelajaran siswa tidak dapat dimuat.",
            ),
          );
        }
        if (!gradesResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              gradesResponse,
              "Nilai siswa tidak dapat dimuat.",
            ),
          );
        }
        if (!attendanceResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              attendanceResponse,
              "Kehadiran siswa tidak dapat dimuat.",
            ),
          );
        }
        const [
          studentData,
          scheduleData,
          subjectData,
          gradeData,
          attendanceData,
        ]: [
          unknown,
          unknown,
          unknown,
          unknown,
          unknown,
        ] = await Promise.all([
          sessionResponse.json(),
          scheduleResponse.json(),
          subjectResponse.json(),
          gradesResponse.json(),
          attendanceResponse.json(),
        ]);
        if (
          !studentData ||
          typeof studentData !== "object" ||
          Array.isArray(studentData) ||
          !Array.isArray(scheduleData) ||
          !Array.isArray(subjectData) ||
          !Array.isArray(gradeData) ||
          !Array.isArray(attendanceData)
        ) {
          throw new Error("Format data portal siswa tidak valid.");
        }
        if (active) {
          setStudent(studentData as StudentSession);
          setSchedules(scheduleData as AcademicRecord[]);
          setSubjects(subjectData as AcademicRecord[]);
          setGrades(gradeData as StudentGrade[]);
          setAttendance(attendanceData as AcademicRecord[]);
          setLoadError("");
        }
      } catch (error) {
        console.error("Failed to load student dashboard:", error);
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Data portal siswa tidak dapat dimuat.",
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
      router.replace("/login/siswa");
      router.refresh();
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      return;
    }
  }

  const filteredMenus = menus.filter((menu) =>
    menu.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const visibleSchedules = schedules.filter((lesson) => {
    if (showAllClasses || !today) return true;
    return String(lesson.hari || "").toLowerCase() === today.toLowerCase();
  });
  const initials = (student?.name || "Siswa")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const gradedRecords = grades.filter(
    (record) => Number.isFinite(Number(record.nilai)),
  );
  const averageGrade = gradedRecords.length
    ? (
        gradedRecords.reduce(
          (total, record) => total + Number(record.nilai),
          0,
        ) / gradedRecords.length
      ).toLocaleString("id-ID", { maximumFractionDigits: 1 })
    : "—";
  const presentRecords = attendance.filter(
    (record) => String(record.status).toLocaleLowerCase("id-ID") === "hadir",
  ).length;
  const attendanceRate = attendance.length
    ? `${Math.round((presentRecords / attendance.length) * 100)}%`
    : "—";
  const academicUpdates = [
    ...grades.map((record) => ({
      id: `grade-${record.id}`,
      title: `Nilai ${record.mapel || "siswa"}`,
      text: `${record.nilai ?? "Nilai belum dicatat"}${record.tanggal ? ` · ${record.tanggal}` : ""}`,
      date: String(record.tanggal || ""),
      icon: "▣",
      tone: "studentNoticeBlue",
    })),
    ...attendance.map((record) => ({
      id: `attendance-${record.id}`,
      title: `Kehadiran ${record.tanggal || ""}`.trim(),
      text: `${record.status || "Status belum dicatat"}${record.mapel ? ` · ${record.mapel}` : ""}`,
      date: String(record.tanggal || ""),
      icon: "✓",
      tone: "studentNoticeGreen",
    })),
  ]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 4);

  return (
    <div className={styles.studentDashboard} id="overview">
      <aside className={styles.studentSidebar}>
        <Link href="#overview" className={styles.studentBrand}>
          <span className={styles.studentBrandMark}>M</span>
          <span>
            SD - SMP <b>Maranatha</b>
          </span>
        </Link>

        <label className={styles.studentSearch}>
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari menu..."
            aria-label="Cari menu"
          />
        </label>

        <p className={styles.studentMenuLabel}>MENU SISWA</p>
        <nav className={styles.studentNav} aria-label="Navigasi portal siswa">
          {filteredMenus.map((menu, index) => (
            <Link
              key={menu.label}
              href={menu.href}
              className={`${styles.studentNavItem} ${index === 0 ? styles.studentNavActive : ""}`}
            >
              <span aria-hidden="true">{menu.icon}</span>
              {menu.label}
              {menu.href.startsWith("/") ? (
                <span className={styles.studentNavArrow} aria-hidden="true">
                  ›
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className={styles.studentSidebarBottom}>
          <span className={styles.studentHelpIcon}>?</span>
          <span>
            <b>Butuh bantuan?</b>
            <small>Hubungi wali kelas atau sekolah</small>
          </span>
        </div>
        <button type="button" className={styles.studentLogout} onClick={logout}>
          <span aria-hidden="true">↪</span> Keluar
        </button>
      </aside>

      <main className={styles.studentMain}>
        <header className={styles.studentTopbar}>
          <div className={styles.studentTopbarBrand}>
            <span className={styles.studentBrandMark}>M</span>
            <span>Portal Akademik Siswa</span>
          </div>
          <div className={styles.studentTopbarActions}>
            <span className={styles.studentDate}>{dateLabel}</span>
            <div className={styles.studentProfile}>
              <span className={styles.studentAvatar}>{initials}</span>
              <span>
                <b>{student?.name || "Siswa"}</b>
                <small>{student?.grade || "SD - SMP Kristen Maranatha"}</small>
              </span>
            </div>
          </div>
        </header>

        <div className={styles.studentContent}>
          <section className={styles.studentSemester}>
            <div>
              <span aria-hidden="true">▦</span>
              <b>SEMESTER AKTIF:</b>
              <strong>Tahun ajaran belum diatur</strong>
            </div>
            <div>
              <span aria-hidden="true">♙</span>
              <b>SISWA:</b>
              <strong>
                {student?.name || student?.email || "Memuat akun..."}
              </strong>
            </div>
            <time>{dateLabel}</time>
          </section>

          {loadError ? (
            <p className={styles.portalFormError} role="alert">
              {loadError}
            </p>
          ) : null}

          <section
            className={styles.studentPanel}
            aria-labelledby="class-heading"
          >
            <div className={styles.studentPanelHeading}>
              <div>
                <span aria-hidden="true">▣</span>
                <h1 id="class-heading">Jadwal Pelajaran</h1>
              </div>
              <Link
                href="/portal-siswa/jadwal"
                className={styles.studentTextLink}
              >
                Buka jadwal <span aria-hidden="true">→</span>
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
                    background: dashboardScheduleMode === "table" ? "#1e40af" : "#f1f5f9",
                    color: dashboardScheduleMode === "table" ? "#ffffff" : "#475569",
                    transition: "all 0.15s",
                  }}
                  onClick={() => setDashboardScheduleMode("table")}
                >
                  ▤ Tampilan Tabel Kelas
                </button>
              </div>

              {dashboardScheduleMode === "official" ? (
                <OfficialScheduleBoard role="student" userGrade={student?.grade} />
              ) : (
                <>
                  <p className={styles.studentFieldLabel}>TAMPILKAN:</p>
                  <div className={styles.studentSegmented}>
                    <button
                      type="button"
                      className={!showAllClasses ? styles.studentSegmentActive : ""}
                      onClick={() => setShowAllClasses(false)}
                    >
                      <span aria-hidden="true">▣</span> Kelas Hari Ini
                    </button>
                    <button
                      type="button"
                      className={showAllClasses ? styles.studentSegmentActive : ""}
                      onClick={() => setShowAllClasses(true)}
                    >
                      <span aria-hidden="true">▤</span> Semua Kelas
                    </button>
                  </div>
                  <div className={styles.studentTableWrap}>
                    <table className={styles.studentScheduleTable}>
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>Kode Mapel</th>
                          <th>Mata Pelajaran</th>
                          <th>Guru</th>
                          <th>Kelas</th>
                          <th>Jadwal Kelas</th>
                          <th>Materi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleSchedules.map((lesson, index) => {
                          const subject = subjects.find(
                            (item) => item.nama === lesson.mapel,
                          );
                          return (
                            <tr key={lesson.id}>
                              <td>{index + 1}.</td>
                              <td>{subject?.kode || "-"}</td>
                              <td>
                                <b>{lesson.mapel || "Mata pelajaran"}</b>
                              </td>
                              <td>{lesson.guru || "Guru"}</td>
                              <td>{lesson.kelas || student?.grade || "-"}</td>
                              <td>
                                {lesson.hari} · {lesson.jam}
                              </td>
                              <td>
                                <span className={styles.studentUnavailable}>
                                  Belum tersedia
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {!loading && visibleSchedules.length === 0 ? (
                          <tr>
                            <td colSpan={7} className={styles.studentEmptyCell}>
                              Tidak ada jadwal kelas hari ini. Pilih “Semua Kelas”
                              untuk melihat jadwal lain.
                            </td>
                          </tr>
                        ) : null}
                        {loading ? (
                          <tr>
                            <td colSpan={7} className={styles.studentEmptyCell}>
                              Memuat jadwal...
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>

          <div className={styles.studentInfoGrid}>
            <section className={styles.studentPanel}>
              <div className={styles.studentPanelHeading}>
                <div>
                  <span className={styles.studentGreenIcon}>▣</span>
                  <h2>Informasi Pembayaran Sekolah</h2>
                </div>
                <a href="#administrasi" className={styles.studentTextLink}>
                  Informasi <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className={styles.studentPanelBody}>
                <p className={styles.studentBodyLead}>
                  Status pembayaran pribadi
                </p>
                <div className={styles.studentStatusBox}>
                  <b>Data belum tersedia</b>
                  <p>
                    Silakan hubungi bagian administrasi sekolah untuk informasi
                    pembayaran.
                  </p>
                </div>
                <p className={styles.studentSmallNote}>
                  Jangan membagikan bukti atau informasi pembayaran melalui
                  tautan yang tidak dikenal.
                </p>
              </div>
            </section>

            <section className={styles.studentPanel}>
              <div className={styles.studentPanelHeading}>
                <div>
                  <span className={styles.studentVioletIcon}>◆</span>
                  <h2>Kelengkapan Akademik</h2>
                </div>
                <Link
                  href="/portal-siswa/rapor"
                  className={styles.studentTextLink}
                >
                  Buka rapor <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className={styles.studentPanelBody}>
                <ul className={styles.studentChecklist}>
                  <li>
                    <span>•</span> Pastikan data kelas dan identitas siswa sudah
                    sesuai.
                  </li>
                  <li>
                    <span>•</span> Rapor dapat dilihat setelah nilai diterbitkan
                    oleh sekolah.
                  </li>
                </ul>
                <div className={styles.studentStatusBox}>
                  <b>
                    Status rapor: <span>Menunggu data akademik</span>
                  </b>
                  <p>Belum ada rapor yang dipublikasikan untuk akun ini.</p>
                </div>
              </div>
            </section>
          </div>

          <section
            className={styles.studentMetricGrid}
            aria-label="Ringkasan akademik"
            id="akademik"
          >
            <Link href="/portal-siswa/rapor" className={styles.studentMetric}>
              <strong>{averageGrade}</strong>
              <b>Rata-rata Nilai</b>
              <small>{gradedRecords.length} nilai tercatat</small>
            </Link>
            <Link href="/portal-siswa/nilai" className={styles.studentMetric}>
              <strong>{attendanceRate}</strong>
              <b>Kehadiran</b>
              <small>{attendance.length} catatan tersimpan</small>
            </Link>
            <Link
              href="/portal-siswa/mata-pelajaran"
              className={styles.studentMetric}
            >
              <strong>{subjects.length || "—"}</strong>
              <b>Mata Pelajaran</b>
              <small>Jumlah data tersedia</small>
            </Link>
            <div className={styles.studentMetric}>
              <strong>—</strong>
              <b>Poin Karakter</b>
              <small>Data belum tersedia</small>
            </div>
            <a
              href="#administrasi"
              className={styles.studentMetric}
              id="administrasi"
            >
              <span className={styles.studentMetricIcon}>▤</span>
              <b>Administrasi</b>
              <small>Informasi sekolah</small>
            </a>
            <Link href="/portal-siswa/jadwal" className={styles.studentMetric}>
              <span className={styles.studentMetricIcon}>▦</span>
              <b>Jadwal Pelajaran</b>
              <small>Lihat jadwal kelas</small>
            </Link>
          </section>

          <section className={styles.studentQrPanel}>
            <div className={styles.studentQrCopy}>
              <p className={styles.studentEyebrow}>KEGIATAN SEKOLAH</p>
              <h2>QR Kehadiran Acara</h2>
              <p>
                QR kehadiran akan muncul jika sekolah mengadakan kegiatan yang
                memerlukan presensi.
              </p>
            </div>
            <div
              className={styles.studentQrEmpty}
              aria-label="Belum ada QR kegiatan aktif"
            >
              <span aria-hidden="true">▦</span>
              <b>Belum ada acara aktif</b>
            </div>
            <button
              type="button"
              className={styles.studentFullscreenButton}
              onClick={toggleFullscreen}
            >
              Tampilkan Fullscreen
            </button>
          </section>

          <div className={styles.studentInfoGrid}>
            <section className={styles.studentPanel}>
              <div className={styles.studentPanelHeading}>
                <div>
                  <span aria-hidden="true">⚑</span>
                  <h2>Aktivitas Akademik</h2>
                </div>
                <Link href="#pengumuman" className={styles.studentTextLink}>
                  Rekap <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className={styles.studentPanelBody} id="pengumuman">
                {academicUpdates.map((item) => (
                  <article
                    className={styles.studentAnnouncement}
                    key={item.id}
                  >
                    <span className={styles[item.tone]} aria-hidden="true">
                      {item.icon}
                    </span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
                {!loading && academicUpdates.length === 0 ? (
                  <p className={styles.studentEmptyCell}>
                    Belum ada nilai atau kehadiran yang tercatat untuk akun ini.
                  </p>
                ) : null}
                {loading ? (
                  <p className={styles.studentEmptyCell}>
                    Memuat aktivitas akademik...
                  </p>
                ) : null}
              </div>
            </section>

          </div>
          <div id="informasi-sekolah">
            <SchoolVisionMission />
          </div>

          <footer className={styles.studentFooter}>
            Portal Siswa · SD - SMP Kristen Maranatha ·{" "}
            {student?.name || "Siswa"}
          </footer>
        </div>
      </main>
    </div>
  );
}
