"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sessionMarkerKey } from "../lib/browser-session";
import styles from "../app/page.module.css";
import { OfficialScheduleBoard } from "./official-schedule-board";
import { useSidebarCollapse } from "../lib/use-sidebar-collapse";

type PortalRole = "Siswa" | "Guru";
type PortalRecord = { id: string; [key: string]: string | number };
type PortalSession = {
  name: string;
  email: string;
  grade: string;
  subject: string;
};

const studentFeatures = [
  ["Dashboard", "/portal-siswa", "⌂"],
  ["Jadwal Pelajaran", "/portal-siswa/jadwal", "▦"],
  ["Kelas", "/portal-siswa/kelas", "▤"],
  ["Kehadiran", "/portal-siswa/kehadiran", "✓"],
  ["Nilai Akademik", "/portal-siswa/nilai", "◷"],
  ["Rapor", "/portal-siswa/rapor", "▧"],
  ["Mata Pelajaran", "/portal-siswa/mata-pelajaran", "◈"],
];

const teacherFeatures = [
  ["Dashboard", "/portal-guru", "⌂"],
  ["Jadwal Mengajar", "/portal-guru/jadwal", "▦"],
  ["Kelas Mapel", "/portal-guru/kelas", "▤"],
  ["Absensi Siswa", "/portal-guru/kehadiran", "✓"],
  ["Input Nilai", "/portal-guru/nilai", "◷"],
  ["Mata Pelajaran", "/portal-guru/mata-pelajaran", "◈"],
];

const featureInfo: Record<string, { title: string; resource: string }> = {
  jadwal: { title: "Jadwal Pelajaran", resource: "schedules" },
  kelas: { title: "Kelas", resource: "classes" },
  kehadiran: { title: "Kehadiran", resource: "attendance" },
  nilai: { title: "Nilai Akademik", resource: "grades" },
  rapor: { title: "Rapor", resource: "grades" },
  "mata-pelajaran": { title: "Mata Pelajaran", resource: "subjects" },
};

const columns: Record<string, Array<[string, string]>> = {
  schedules: [
    ["hari", "Hari"],
    ["jam", "Jam"],
    ["kelas", "Kelas"],
    ["mapel", "Mata Pelajaran"],
    ["guru", "Guru"],
    ["ruang", "Ruang"],
  ],
  classes: [
    ["kelas", "Kelas"],
    ["jenjang", "Jenjang"],
    ["mapel", "Mata Pelajaran"],
    ["wali", "Wali Kelas"],
  ],
  subjects: [
    ["kode", "Kode"],
    ["mapel", "Mata Pelajaran"],
    ["jenjang", "Jenjang"],
  ],
  students: [
    ["nis", "NIS"],
    ["nama", "Nama Siswa"],
    ["kelas", "Kelas"],
    ["jenjang", "Jenjang"],
  ],
  attendance: [
    ["tanggal", "Tanggal"],
    ["nama", "Nama Siswa"],
    ["kelas", "Kelas"],
    ["mapel", "Mata Pelajaran"],
    ["status", "Kehadiran"],
  ],
  grades: [
    ["tanggal", "Tanggal"],
    ["nama", "Nama Siswa"],
    ["kelas", "Kelas"],
    ["mapel", "Mata Pelajaran"],
    ["nilai", "Nilai"],
  ],
};

function resolveResource(role: PortalRole, feature: string) {
  const configured = featureInfo[feature];
  if (!configured) return null;
  if (feature === "rapor" && role === "Siswa") {
    return { title: configured.title, resource: "grades" };
  }
  return configured;
}

export function PortalWorkspace({
  role,
  feature,
}: {
  role: PortalRole;
  feature: string;
}) {
  const router = useRouter();
  const isTeacher = role === "Guru";
  const menu = isTeacher ? teacherFeatures : studentFeatures;
  const base = isTeacher ? "/portal-guru" : "/portal-siswa";
  const configured = resolveResource(role, feature);
  const title =
    configured?.title || (isTeacher ? "Portal Guru" : "Portal Siswa");
  const resource = configured?.resource || "schedules";
  const canEdit = isTeacher && ["attendance", "grades"].includes(resource);
  const [session, setSession] = useState<PortalSession | null>(null);
  const [records, setRecords] = useState<PortalRecord[]>([]);
  const [classes, setClasses] = useState<PortalRecord[]>([]);
  const [students, setStudents] = useState<PortalRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [studentName, setStudentName] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceStatus, setAttendanceStatus] = useState("Hadir");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scheduleViewMode, setScheduleViewMode] = useState<"official" | "list">("official");
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobile } =
    useSidebarCollapse(
      isTeacher
        ? "maranatha_teacher_sidebar_collapsed"
        : "maranatha_student_sidebar_collapsed",
    );
  const [menuSearch, setMenuSearch] = useState("");
  const isStudentList = resource === "students";
  const tableResource = isStudentList ? "students" : resource;
  const headers = columns[tableResource] || columns.schedules;
  const classStudents = students.filter(
    (student) => String(student.kelas) === selectedClass,
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionResponse, dataResponse, classResponse, studentResponse] =
          await Promise.all([
            fetch("/api/session"),
            fetch(`/api/portal-data/${resource}`),
            fetch("/api/portal-data/classes"),
            fetch("/api/portal-data/students"),
          ]);
        if (sessionResponse.ok) {
          setSession((await sessionResponse.json()) as PortalSession);
        }
        if (dataResponse.ok) {
          setRecords((await dataResponse.json()) as PortalRecord[]);
        }
        if (classResponse.ok) {
          const classData = (await classResponse.json()) as PortalRecord[];
          setClasses(classData);
          if (classData[0]?.kelas) setSelectedClass(String(classData[0].kelas));
        }
        if (studentResponse.ok) {
          setStudents((await studentResponse.json()) as PortalRecord[]);
        }
      } catch {
        setError("Data portal tidak dapat dimuat saat ini.");
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [resource]);

  async function logout() {
    window.sessionStorage.removeItem(sessionMarkerKey);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.replace(isTeacher ? "/login/guru" : "/login/siswa");
      router.refresh();
    }
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      kelas: selectedClass,
      nama: studentName,
      tanggal: date,
      ...(resource === "grades"
        ? { nilai: Number(value) }
        : { status: attendanceStatus }),
    };
    try {
      const response = await fetch(`/api/portal-data/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as PortalRecord & {
        error?: string;
      };
      if (!response.ok) {
        setError(result.error || "Data tidak dapat disimpan.");
        return;
      }
      setRecords((current) => [result, ...current]);
      setStudentName("");
      setValue("");
      setMessage(
        resource === "grades"
          ? "Nilai berhasil disimpan."
          : "Kehadiran berhasil disimpan.",
      );
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    }
  }

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
            <span className={styles.studentAvatar}>
              {(session?.name || role).slice(0, 1).toUpperCase()}
            </span>
            <span>
              <b>{session?.name || role}</b>
              <small>
                {isTeacher
                  ? session?.subject || "Guru"
                  : session?.grade || "Siswa"}
              </small>
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
            <Link href={base} className={styles.studentBrand} title="SD - SMP Maranatha">
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

          {(!isCollapsed || isMobileOpen) && (
            <p className={styles.studentMenuLabel}>
              {isTeacher ? "MENU GURU" : "MENU SISWA"}
            </p>
          )}

          <nav
            className={styles.studentNav}
            aria-label={`Navigasi portal ${isTeacher ? "guru" : "siswa"}`}
          >
            {filteredMenu.map(([label, href, icon]) => (
              <Link
                key={href}
                href={href}
                className={`${styles.studentNavItem} ${href === `${base}/${feature}` ? styles.studentNavActive : ""}`}
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
                <small>
                  {isTeacher
                    ? "Hubungi administrasi sekolah"
                    : "Hubungi wali kelas"}
                </small>
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
              <span aria-hidden="true">▦</span>
              <b>AREA:</b>
              <strong>
                {isTeacher
                  ? `Guru · ${session?.subject || "Mata pelajaran"}`
                  : `Siswa · ${session?.grade || "SD - SMP"}`}
              </strong>
            </div>
            <div>
              <span aria-hidden="true">▤</span>
              <b>FITUR:</b>
              <strong>{title}</strong>
            </div>
          </section>

          <section className={styles.studentPanel}>
            <div className={styles.studentPanelHeading}>
              <div>
                <span aria-hidden="true">▣</span>
                <h1>{title}</h1>
              </div>
              <Link href={base} className={styles.studentTextLink}>
                Kembali ke dashboard →
              </Link>
            </div>
            <div className={styles.studentPanelBody}>
              {canEdit ? (
                <form className={styles.portalEntryForm} onSubmit={saveRecord}>
                  <label>
                    Kelas
                    <select
                      value={selectedClass}
                      onChange={(event) => setSelectedClass(event.target.value)}
                      required
                    >
                      {classes.map((item) => (
                        <option key={item.id} value={String(item.kelas)}>
                          {item.kelas} · {item.jenjang}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nama siswa
                    <select
                      value={studentName}
                      onChange={(event) => setStudentName(event.target.value)}
                      required
                    >
                      <option value="">Pilih siswa</option>
                      {classStudents.map((student) => (
                        <option key={student.id} value={String(student.nama)}>
                          {student.nama}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tanggal
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      required
                    />
                  </label>
                  {resource === "grades" ? (
                    <label>
                      Nilai (0-100)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        required
                      />
                    </label>
                  ) : (
                    <label>
                      Status kehadiran
                      <select
                        value={attendanceStatus}
                        onChange={(event) =>
                          setAttendanceStatus(event.target.value)
                        }
                      >
                        <option>Hadir</option>
                        <option>Izin</option>
                        <option>Sakit</option>
                        <option>Alpa</option>
                      </select>
                    </label>
                  )}
                  <p className={styles.portalLockedSubject}>
                    Mata pelajaran:{" "}
                    <b>{session?.subject || "Belum ditentukan"}</b>
                  </p>
                  {error ? (
                    <p className={styles.portalFormError}>{error}</p>
                  ) : null}
                  {message ? (
                    <p className={styles.portalFormSuccess}>{message}</p>
                  ) : null}
                  <button
                    type="submit"
                    className={styles.studentFullscreenButton}
                  >
                    {resource === "grades"
                      ? "Simpan Nilai"
                      : "Simpan Kehadiran"}
                  </button>
                </form>
              ) : null}

              {error && !canEdit ? (
                <p className={styles.portalFormError}>{error}</p>
              ) : null}

              {feature === "jadwal" ? (
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
                      background: scheduleViewMode === "official" ? "#1e40af" : "#f1f5f9",
                      color: scheduleViewMode === "official" ? "#ffffff" : "#475569",
                      transition: "all 0.15s",
                    }}
                    onClick={() => setScheduleViewMode("official")}
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
                      background: scheduleViewMode === "list" ? "#1e40af" : "#f1f5f9",
                      color: scheduleViewMode === "list" ? "#ffffff" : "#475569",
                      transition: "all 0.15s",
                    }}
                    onClick={() => setScheduleViewMode("list")}
                  >
                    ▤ Daftar Baris Sederhana
                  </button>
                </div>
              ) : null}

              {feature === "jadwal" && scheduleViewMode === "official" ? (
                <OfficialScheduleBoard
                  role={isTeacher ? "teacher" : "student"}
                  userGrade={session?.grade}
                  userName={session?.name}
                />
              ) : (
                <div className={styles.studentTableWrap}>
                  <table className={styles.studentScheduleTable}>
                    <thead>
                      <tr>
                        {headers.map(([key, label]) => (
                          <th key={key}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          {headers.map(([key]) => (
                            <td key={key}>{record[key] ?? "-"}</td>
                          ))}
                        </tr>
                      ))}
                      {!loading && records.length === 0 ? (
                        <tr>
                          <td
                            colSpan={headers.length}
                            className={styles.studentEmptyCell}
                          >
                            {canEdit
                              ? "Belum ada data. Gunakan formulir di atas untuk memasukkan data."
                              : "Belum ada data untuk akun atau mata pelajaran ini."}
                          </td>
                        </tr>
                      ) : null}
                      {loading ? (
                        <tr>
                          <td
                            colSpan={headers.length}
                            className={styles.studentEmptyCell}
                          >
                            Memuat data...
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
        </main>
      </div>
    </div>
  );
}
