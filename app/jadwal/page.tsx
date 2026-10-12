"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SchoolShell } from "@/components/school-shell";
import { OfficialScheduleBoard } from "@/components/official-schedule-board";
import { useAcademicRecords } from "@/lib/use-academic-records";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "../page.module.css";

type Level = "SD" | "SMP";
type Schedule = {
  id: string;
  jenjang?: Level;
  hari: string;
  jam: string;
  kelas: string;
  mapel: string;
  guru: string;
};
type ClassRoom = { id: string; nama: string; jenjang: Level };
type Subject = { id: string; nama: string };
type Teacher = { id: string; name: string; status: string };
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"] as const;
const timeSlots = [
  ["1", "07.00 - 07.40"],
  ["2", "07.40 - 08.20"],
  ["3", "08.20 - 09.00"],
  ["4", "09.15 - 09.55"],
  ["5", "09.55 - 10.35"],
  ["6", "10.35 - 11.15"],
  ["7", "11.30 - 12.10"],
  ["8", "12.10 - 12.50"],
  ["9", "12.50 - 13.30"],
] as const;
const emptySchedule = {
  jenjang: "SMP" as Level,
  hari: "Senin",
  jam: "",
  kelas: "",
  mapel: "",
  guru: "",
};


export default function JadwalPage() {
  const { rows, loading, error, clearError, saveRecord, removeRecord } =
    useAcademicRecords<Schedule>("schedules");
  const {
    rows: classRecords,
    loading: classesLoading,
    error: classesError,
  } = useAcademicRecords<ClassRoom>("classes");
  const {
    rows: subjects,
    loading: subjectsLoading,
    error: subjectsError,
  } = useAcademicRecords<Subject>("subjects");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState("");
  const [level, setLevel] = useState<Level>("SMP");
  const [viewMode, setViewMode] = useState<"official" | "custom">("official");
  const [form, setForm] = useState(emptySchedule);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const classes = classRecords
    .filter((classRoom) => classRoom.jenjang === level)
    .map((classRoom) => classRoom.nama);
  const activeTeachers = teachers.filter((teacher) => teacher.status === "Aktif");
  const formDependenciesLoading =
    classesLoading || subjectsLoading || teachersLoading;
  const formDependencyError =
    classesError || subjectsError || teachersError;
  const visibleRows = rows.filter((row) => (row.jenjang ?? "SMP") === level);
  const scheduleByCell = useMemo(
    () =>
      new Map(
        visibleRows.map((row) => [`${row.hari}|${row.jam}|${row.kelas}`, row]),
      ),
    [visibleRows],
  );

  useEffect(() => {
    let active = true;

    async function loadTeachers() {
      try {
        const response = await fetch("/api/teachers");
        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(
              response,
              "Daftar guru tidak dapat dimuat.",
            ),
          );
        }
        const data: unknown = await response.json();
        if (
          !Array.isArray(data) ||
          !data.every(
            (teacher) =>
              teacher &&
              typeof teacher === "object" &&
              typeof teacher.id === "string" &&
              typeof teacher.name === "string" &&
              typeof teacher.status === "string",
          )
        ) {
          throw new Error("Format data guru dari server tidak valid.");
        }
        if (active) setTeachers(data as Teacher[]);
      } catch (error) {
        console.error("Failed to load schedule teachers:", error);
        if (active) {
          setTeachersError(
            error instanceof Error
              ? error.message
              : "Daftar guru tidak dapat dimuat.",
          );
        }
      } finally {
        if (active) setTeachersLoading(false);
      }
    }

    void loadTeachers();
    return () => {
      active = false;
    };
  }, []);

  function openCreateForm() {
    clearError();
    setForm({ ...emptySchedule, jenjang: level });
    setEditingId(null);
    setShowForm(true);
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await saveRecord(form, editingId ?? undefined);
      if (!saved) return;
      setForm({ ...emptySchedule, jenjang: level });
      setEditingId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }
  function handleEdit(row: Schedule) {
    clearError();
    setForm({
      jenjang: row.jenjang ?? "SMP",
      hari: row.hari,
      jam: row.jam,
      kelas: row.kelas,
      mapel: row.mapel,
      guru: row.guru,
    });
    setLevel(row.jenjang ?? "SMP");
    setEditingId(row.id);
    setShowForm(true);
  }
  function handleDelete(row: Schedule) {
    if (!window.confirm(`Hapus jadwal ${row.mapel} kelas ${row.kelas}?`)) {
      return;
    }
    void removeRecord(row.id);
  }

  return (
    <SchoolShell title="Jadwal Pelajaran" activeItem="Jadwal Pelajaran">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>KALENDER AKADEMIK</p>
            <h1>Jadwal Pelajaran {level}</h1>
            <p className={styles.subtitle}>
              Kelola jadwal SD dan SMP secara terpisah.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            {level === "SMP" ? (
              <div style={{ display: "flex", background: "#e2e8f0", padding: "4px", borderRadius: "8px", gap: "4px" }}>
                <button
                  type="button"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    background: viewMode === "official" ? "#1e40af" : "transparent",
                    color: viewMode === "official" ? "#ffffff" : "#475569",
                    transition: "all 0.15s",
                  }}
                  onClick={() => setViewMode("official")}
                >
                  ▦ Matriks Dokumen Resmi (Gambar)
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
                    background: viewMode === "custom" ? "#1e40af" : "transparent",
                    color: viewMode === "custom" ? "#ffffff" : "#475569",
                    transition: "all 0.15s",
                  }}
                  onClick={() => setViewMode("custom")}
                >
                  ▤ Mode Kelola Slot
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className={styles.dateButton}
              onClick={openCreateForm}
            >
              + Tambah Jadwal {level}
            </button>
          </div>
        </div>
        <div
          className={styles.scheduleLevels}
          role="tablist"
          aria-label="Pilih jenjang sekolah"
        >
          {(["SD", "SMP"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={level === item}
              className={
                level === item
                  ? styles.scheduleLevelActive
                  : styles.scheduleLevel
              }
              onClick={() => {
                setLevel(item);
                setShowForm(false);
                setEditingId(null);
              }}
            >
              {item}
              <small>{item === "SD" ? "Kelas I - VI" : "Kelas VII - IX"}</small>
            </button>
          ))}
        </div>
        {showForm ? (
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>{editingId ? "Edit Jadwal" : "Tambah Jadwal"}</h3>
                <p>Tambahkan atau sesuaikan jadwal pada slot yang dipilih.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <label>
                Jenjang
                <select
                  value={form.jenjang}
                  onChange={(event) => {
                    const nextLevel = event.target.value as Level;
                    setForm({ ...form, jenjang: nextLevel, kelas: "" });
                    setLevel(nextLevel);
                  }}
                >
                  {(["SD", "SMP"] as const).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Hari
                <select
                  value={form.hari}
                  onChange={(event) =>
                    setForm({ ...form, hari: event.target.value })
                  }
                >
                  {days.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              </label>
              <label>
                Jam
                <select
                  required
                  value={form.jam}
                  onChange={(event) =>
                    setForm({ ...form, jam: event.target.value })
                  }
                >
                  <option value="">Pilih jam</option>
                  {timeSlots.map(([period, time]) => (
                    <option key={period} value={time}>
                      Jam ke-{period} ({time})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kelas
                <select
                  required
                  value={form.kelas}
                  onChange={(event) =>
                    setForm({ ...form, kelas: event.target.value })
                  }
                >
                  <option value="">Pilih kelas</option>
                  {classes.map((className) => (
                    <option key={className}>{className}</option>
                  ))}
                </select>
              </label>
              <label>
                Mata Pelajaran
                <select
                  required
                  value={form.mapel}
                  onChange={(event) =>
                    setForm({ ...form, mapel: event.target.value })
                  }
                  disabled={subjectsLoading || Boolean(subjectsError)}
                >
                  <option value="">
                    {subjectsLoading
                      ? "Memuat mata pelajaran..."
                      : "Pilih mata pelajaran"}
                  </option>
                  {form.mapel &&
                  !subjects.some((subject) => subject.nama === form.mapel) ? (
                    <option value={form.mapel}>
                      {form.mapel} (data sebelumnya)
                    </option>
                  ) : null}
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.nama}>
                      {subject.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Guru
                <select
                  required
                  value={form.guru}
                  onChange={(event) =>
                    setForm({ ...form, guru: event.target.value })
                  }
                  disabled={teachersLoading || Boolean(teachersError)}
                >
                  <option value="">
                    {teachersLoading ? "Memuat daftar guru..." : "Pilih guru"}
                  </option>
                  {form.guru &&
                  !teachers.some((teacher) => teacher.name === form.guru) ? (
                    <option value={form.guru}>
                      {form.guru} (data sebelumnya)
                    </option>
                  ) : null}
                  {activeTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </label>
              {formDependencyError ? (
                <p className={styles.portalFormError} role="alert">
                  {formDependencyError}
                </p>
              ) : null}
              {!formDependenciesLoading &&
              !formDependencyError &&
              classes.length === 0 ? (
                <p className={styles.emptyState}>
                  Tambahkan kelas pada jenjang {level} sebelum membuat jadwal.
                </p>
              ) : null}
              {!formDependenciesLoading &&
              !formDependencyError &&
              subjects.length === 0 ? (
                <p className={styles.emptyState}>
                  Tambahkan mata pelajaran sebelum membuat jadwal.
                </p>
              ) : null}
              {!formDependenciesLoading &&
              !formDependencyError &&
              activeTeachers.length === 0 ? (
                <p className={styles.emptyState}>
                  Tambahkan guru aktif sebelum membuat jadwal.
                </p>
              ) : null}
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={
                    saving ||
                    formDependenciesLoading ||
                    Boolean(formDependencyError) ||
                    (!editingId &&
                      (!classes.length ||
                        !subjects.length ||
                        !activeTeachers.length))
                  }
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Jadwal"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    clearError();
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Batal
                </button>
              </div>
              {error ? (
                <p className={styles.portalFormError} role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          </div>
        ) : null}

        {level === "SMP" && viewMode === "official" ? (
          <OfficialScheduleBoard role="admin" />
        ) : (
          <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>Jadwal Kegiatan Belajar Mengajar · {level}</h3>
              <p>
                Jadwal untuk kelas terdaftar pada jenjang {level}.
              </p>
            </div>
            {loading ? (
              <p className={styles.emptyState}>Memuat jadwal...</p>
            ) : null}
            {error && !showForm ? (
              <p className={styles.portalFormError} role="alert">
                {error}
              </p>
            ) : null}
          </div>
          {classesLoading ? (
            <div className={styles.emptyState}>Memuat data kelas...</div>
          ) : classesError ? (
            <p className={styles.portalFormError} role="alert">
              {classesError}
            </p>
          ) : classes.length === 0 ? (
            <div className={styles.emptyState}>
              Belum ada data kelas jenjang {level}. Tambahkan kelas terlebih
              dahulu agar jadwal dapat dikelola.
            </div>
          ) : (
          <div className={styles.scheduleWrap}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>
                    Jam
                    <br />
                    ke-
                  </th>
                  <th rowSpan={2}>Waktu</th>
                  {days.map((day) => (
                    <th key={day} colSpan={classes.length}>
                      {day}
                    </th>
                  ))}
                </tr>
                <tr>
                  {days.flatMap((day) =>
                    classes.map((className) => (
                      <th key={`${day}-${className}`}>{className}</th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {timeSlots.flatMap(([period, time]) => {
                  const breakRow =
                    period === "4"
                      ? "Istirahat · 09.00 - 09.15"
                      : period === "7"
                        ? "Istirahat · 11.15 - 11.30"
                        : null;
                  const classRows = (
                    <tr key={period}>
                      <td>{period}</td>
                      <td>{time}</td>
                      {days.flatMap((day) =>
                        classes.map((className) => {
                          const record = scheduleByCell.get(
                            `${day}|${time}|${className}`,
                          );
                          const subject = record?.mapel ?? "";
                          return (
                            <td
                              key={`${period}-${day}-${className}`}
                              className={styles.scheduleSubject}
                            >
                              {record ? (
                                <div>
                                  <button
                                    type="button"
                                    title={`${record.guru} · klik untuk edit`}
                                    onClick={() => handleEdit(record)}
                                  >
                                    {subject}
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.tableAction}
                                    aria-label={`Hapus jadwal ${record.mapel} kelas ${record.kelas}`}
                                    onClick={() => handleDelete(record)}
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ) : (
                                subject || "—"
                              )}
                            </td>
                          );
                        }),
                      )}
                    </tr>
                  );
                  return breakRow
                    ? [
                        <tr className={styles.breakRow} key={`break-${period}`}>
                          <td colSpan={2 + days.length * classes.length}>
                            {breakRow}
                          </td>
                        </tr>,
                        classRows,
                      ]
                    : [classRows];
                })}
              </tbody>
            </table>
          </div>
          )}
          {formDependencyError && !showForm ? (
            <p className={styles.portalFormError} role="alert">
              {formDependencyError}
            </p>
          ) : null}
        </div>
        )}
      </section>
    </SchoolShell>
  );
}
