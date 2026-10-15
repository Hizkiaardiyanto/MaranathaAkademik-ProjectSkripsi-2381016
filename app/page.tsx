"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { SchoolShell } from "../components/school-shell";
import { useAcademicRecords } from "../lib/use-academic-records";
import { getApiErrorMessage } from "../lib/api-error";


type RosterStudent = {
  id: string;
  name: string;
  status: string;
};
type RosterTeacher = { id: string; status: string };
type DashboardRecord = { id: string; [key: string]: string | number };
type DashboardSchedule = DashboardRecord & {
  hari?: string;
  jam?: string;
  kelas?: string;
  mapel?: string;
  guru?: string;
};

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [students, setStudents] = useState<RosterStudent[]>([]);
  const [teachers, setTeachers] = useState<RosterTeacher[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState("");
  const { rows: classes, loading: classesLoading, error: classesError } =
    useAcademicRecords<DashboardRecord>("classes");
  const { rows: schedules, loading: schedulesLoading, error: schedulesError } =
    useAcademicRecords<DashboardSchedule>("schedules");
  const {
    rows: attendance,
    loading: attendanceLoading,
    error: attendanceError,
  } = useAcademicRecords<DashboardRecord>("attendance");
  const {
    rows: grades,
    loading: gradesLoading,
    error: gradesError,
  } = useAcademicRecords<DashboardRecord>("grades");

  useEffect(() => {
    let active = true;

    async function loadRoster() {
      try {
        const [studentsResponse, teachersResponse] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/teachers"),
        ]);
        if (!studentsResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              studentsResponse,
              "Data siswa tidak dapat dimuat.",
            ),
          );
        }
        if (!teachersResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              teachersResponse,
              "Data guru tidak dapat dimuat.",
            ),
          );
        }
        const [studentData, teacherData]: [unknown, unknown] =
          await Promise.all([
            studentsResponse.json(),
            teachersResponse.json(),
          ]);
        if (!Array.isArray(studentData) || !Array.isArray(teacherData)) {
          throw new Error("Format data dashboard dari server tidak valid.");
        }
        if (active) {
          setStudents(studentData as RosterStudent[]);
          setTeachers(teacherData as RosterTeacher[]);
          setRosterError("");
        }
      } catch (error) {
        console.error("Failed to load dashboard roster:", error);
        if (active) {
          setRosterError(
            error instanceof Error
              ? error.message
              : "Data ringkasan sekolah tidak dapat dimuat.",
          );
        }
      } finally {
        if (active) setRosterLoading(false);
      }
    }

    void loadRoster();
    return () => {
      active = false;
    };
  }, []);

  const today = new Date();
  const todayIso = isoDate(today);
  const todayLabel = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayName = today.toLocaleDateString("id-ID", { weekday: "long" });
  const todayAttendance = attendance.filter(
    (record) => String(record.tanggal || "") === todayIso,
  );
  const presentToday = todayAttendance.filter(
    (record) => String(record.status).toLocaleLowerCase("id-ID") === "hadir",
  ).length;
  const attendanceRate = todayAttendance.length
    ? `${Math.round((presentToday / todayAttendance.length) * 100).toLocaleString("id-ID")}%`
    : "—";
  const metrics = [
    {
      label: "Total Siswa",
      value: students.length.toLocaleString("id-ID"),
      detail: `${students.filter((student) => student.status === "Aktif").length.toLocaleString("id-ID")} aktif`,
      meta: "data tersimpan",
      tone: "blue",
    },
    {
      label: "Total Guru",
      value: teachers.length.toLocaleString("id-ID"),
      detail: `${teachers.filter((teacher) => teacher.status === "Aktif").length.toLocaleString("id-ID")} aktif`,
      meta: "data tersimpan",
      tone: "orange",
    },
    {
      label: "Rombel",
      value: classes.length.toLocaleString("id-ID"),
      detail: "kelas terdaftar",
      meta: "data tersimpan",
      tone: "purple",
    },
    {
      label: "Kehadiran Hari Ini",
      value: attendanceRate,
      detail: `${presentToday} hadir`,
      meta: `dari ${todayAttendance.length} catatan`,
      tone: "green",
    },
  ];
  const weekdayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const currentMonday = new Date(today);
  currentMonday.setDate(
    today.getDate() - ((today.getDay() + 6) % 7),
  );
  const weeklyAttendance = weekdayNames.map((day, index) => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + index);
    const dailyRecords = attendance.filter(
      (record) => String(record.tanggal || "") === isoDate(date),
    );
    const present = dailyRecords.filter(
      (record) => String(record.status).toLocaleLowerCase("id-ID") === "hadir",
    ).length;
    const presentPercent = dailyRecords.length
      ? Math.round((present / dailyRecords.length) * 100)
      : 0;
    return {
      day: day.slice(0, 3),
      one: `${presentPercent}%`,
      two: dailyRecords.length ? `${100 - presentPercent}%` : "0%",
    };
  });
  const todaysSchedule = schedules
    .filter(
      (lesson) =>
        (lesson.hari || "").toLocaleLowerCase("id-ID") ===
        todayName.toLocaleLowerCase("id-ID"),
    )
    .sort((a, b) => (a.jam || "").localeCompare(b.jam || ""));
  const latestActivity = [
    ...attendance.map((record) => ({
      id: `attendance-${record.id}`,
      title: `Kehadiran: ${record.nama || "Siswa"}`,
      text: `${record.kelas || "Kelas"} · ${record.status || "Status tidak dicatat"}`,
      time: String(record.tanggal || ""),
      icon: "✓",
      tone: "yellow",
    })),
    ...grades.map((record) => ({
      id: `grade-${record.id}`,
      title: `Nilai: ${record.nama || "Siswa"}`,
      text: `${record.mapel || "Mata pelajaran"} · ${record.nilai ?? "Belum dinilai"}`,
      time: String(record.tanggal || ""),
      icon: "▤",
      tone: "pink",
    })),
  ]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 4);
  const dashboardError =
    rosterError || classesError || schedulesError || attendanceError || gradesError;
  const dashboardLoading =
    rosterLoading ||
    classesLoading ||
    schedulesLoading ||
    attendanceLoading ||
    gradesLoading;

  return (
    <SchoolShell
      title="Dashboard"
      subtitle="Ringkasan administrasi sekolah"
      activeItem="Dashboard"
    >
      <section className={styles.page}>
          <div className={styles.pageHeading}>
            <div>
              <p className={styles.eyebrow}>SELAMAT DATANG KEMBALI</p>
              <h1>
                Halo, Admin! <span>👋</span>
              </h1>
              <p className={styles.subtitle}>
                Berikut ringkasan aktivitas sekolah hari ini.
              </p>
            </div>
            <div className={styles.dateButton}>▣ &nbsp; {todayLabel}</div>
          </div>

          {dashboardError ? (
            <p className={styles.portalFormError} role="alert">
              {dashboardError}
            </p>
          ) : null}

          <div className={styles.statsGrid}>
            {metrics.map(({ label, value, detail, meta, tone }) => (
              <article
                key={label}
                className={`${styles.statCard} ${styles[tone]}`}
              >
                <div className={styles.statIcon}>
                  {tone === "blue"
                    ? "♙"
                    : tone === "orange"
                      ? "♟"
                      : tone === "purple"
                        ? "▦"
                        : "✓"}
                </div>
                <div>
                  <p>{label}</p>
                  <h2>{value}</h2>
                  <span>
                    {detail} <small>{meta}</small>
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.dashboardGrid}>
            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Statistik Kehadiran</h3>
                  <p>Persentase hadir dari catatan tersimpan minggu ini</p>
                </div>
                <select defaultValue="Minggu ini" aria-label="Pilih periode">
                  <option>Minggu ini</option>
                </select>
              </div>

              <div className={styles.chartWrap}>
                <div className={styles.chartY}>
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                <div className={styles.barChart}>
                  {weeklyAttendance.map((item) => (
                    <div key={item.day} className={styles.barSet}>
                      <i style={{ height: item.one }} />
                      <i style={{ height: item.two }} />
                      <b>{item.day}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.legend}>
                <span>
                  <i className={styles.present} /> Hadir
                </span>
                <span>
                  <i className={styles.absent} /> Tidak Hadir
                </span>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Jadwal Hari Ini</h3>
                  <p>{todayLabel}</p>
                </div>
                <Link href="/jadwal" className={styles.linkButton}>
                  Lihat semua →
                </Link>
              </div>

              <div className={styles.scheduleList}>
                {todaysSchedule.map((lesson, index) => (
                  <div key={lesson.id} className={styles.lesson}>
                    <time>{lesson.jam || "—"}</time>
                    <span
                      className={`${styles.lessonDot} ${styles[["math", "eng", "sci"][index % 3]]}`}
                    />
                    <div>
                      <b>{lesson.mapel || "Mata pelajaran"}</b>
                      <p>
                        Kelas {lesson.kelas || "—"} · {lesson.guru || "Guru belum ditentukan"}
                      </p>
                    </div>
                  </div>
                ))}
                {!todaysSchedule.length ? (
                  <p className={styles.emptyState}>
                    {dashboardLoading
                      ? "Memuat jadwal..."
                      : "Belum ada jadwal untuk hari ini."}
                  </p>
                ) : null}
              </div>
            </article>
          </div>

          <div className={`${styles.dashboardGrid} ${styles.lower}`}>
            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Aktivitas Akademik Terbaru</h3>
                  <p>Catatan kehadiran dan nilai tersimpan</p>
                </div>
                <Link href="/laporan" className={styles.linkButton}>
                  Lihat laporan →
                </Link>
              </div>

              {latestActivity.map((item) => (
                <div key={item.id} className={styles.announcement}>
                  <div
                    className={`${styles.announceIcon} ${styles[item.tone]}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <b>{item.title}</b>
                    <p>{item.text}</p>
                    <small>{item.time || "Tanggal tidak dicatat"}</small>
                  </div>
                </div>
              ))}
              {!latestActivity.length ? (
                <p className={styles.emptyState}>
                  {dashboardLoading
                    ? "Memuat aktivitas..."
                    : "Belum ada aktivitas akademik."}
                </p>
              ) : null}
            </article>

            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Akses Cepat</h3>
                  <p>Kelola data sekolah dengan mudah</p>
                </div>
              </div>

              <div className={styles.quickGrid}>
                <Link href="/siswa">＋ Tambah Siswa</Link>
                <Link href="/absensi">✓ Input Absensi</Link>
                <Link href="/nilai">▤ Input Nilai</Link>
                <Link href="/rapor">↓ Cetak Rapor</Link>
              </div>
            </article>
          </div>
        </section>
    </SchoolShell>
  );
}
