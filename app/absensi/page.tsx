"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SchoolShell } from "@/components/school-shell";
import { useAcademicRecords } from "@/lib/use-academic-records";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "../page.module.css";

type Attendance = {
  id: string;
  studentId?: string;
  nama: string;
  kelas: string;
  tanggal: string;
  mapel: string;
  guru: string;
  status: string;
};
type Student = { id: string; name: string; className: string; status: string };
type Schedule = { id: string; kelas: string; mapel: string; guru: string };

function localDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export default function AbsensiPage() {
  const { rows, loading, error, clearError, saveRecord, removeRecord } =
    useAcademicRecords<Attendance>("attendance");
  const {
    rows: schedules,
    loading: schedulesLoading,
    error: schedulesError,
  } = useAcademicRecords<Schedule>("schedules");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    studentId: "",
    kelas: "",
    tanggal: localDate(),
    mapel: "",
    guru: "",
    status: "Hadir",
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const activeStudents = students.filter((student) => student.status === "Aktif");
  const classSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.kelas === form.kelas),
    [form.kelas, schedules],
  );

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(response, "Daftar siswa gagal dimuat."),
          );
        }
        const data: unknown = await response.json();
        if (
          !Array.isArray(data) ||
          !data.every(
            (student) =>
              student &&
              typeof student === "object" &&
              typeof student.id === "string" &&
              typeof student.name === "string" &&
              typeof student.className === "string" &&
              typeof student.status === "string",
          )
        ) {
          throw new Error("Format data siswa dari server tidak valid.");
        }
        if (active) setStudents(data as Student[]);
      } catch (loadError) {
        console.error("Failed to load attendance students:", loadError);
        if (active) {
          setStudentsError(
            loadError instanceof Error
              ? loadError.message
              : "Daftar siswa tidak dapat dimuat.",
          );
        }
      } finally {
        if (active) setStudentsLoading(false);
      }
    }

    void loadStudents();
    return () => {
      active = false;
    };
  }, []);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const { studentId, ...attendance } = form;
      const saved = await saveRecord({
        ...attendance,
        ...(studentId ? { studentId } : {}),
      });
      if (!saved) return;
      setForm({
        nama: "",
        studentId: "",
        kelas: "",
        tanggal: localDate(),
        mapel: "",
        guru: "",
        status: "Hadir",
      });
      setSelectedScheduleId("");
      setEditingId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function editAttendance(row: Attendance) {
    clearError();
    const studentId =
      row.studentId ||
      students.find(
        (student) =>
          student.name === row.nama && student.className === row.kelas,
      )?.id ||
      "";
    setForm({
      nama: row.nama,
      studentId,
      kelas: row.kelas,
      tanggal: row.tanggal,
      mapel: row.mapel,
      guru: row.guru,
      status: row.status === "Alpa" ? "Alpha" : row.status,
    });
    setSelectedScheduleId(
      schedules.find(
        (schedule) =>
          schedule.kelas === row.kelas &&
          schedule.mapel === row.mapel &&
          schedule.guru === row.guru,
      )?.id || "",
    );
    setEditingId(row.id);
    setShowForm(true);
  }

  return (
    <SchoolShell title="Absensi Siswa" activeItem="Absensi Siswa">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>KEHADIRAN</p>
            <h1>Absensi Siswa</h1>
          </div>
          <button
            type="button"
            className={styles.dateButton}
            onClick={() => {
              clearError();
              setShowForm(true);
            }}
          >
            + Input Absensi
          </button>
        </div>

        {showForm ? (
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>{editingId ? "Edit Absensi" : "Input Absensi"}</h3>
                <p>
                  {editingId
                    ? "Perbarui catatan kehadiran"
                    : "Tambahkan kehadiran siswa"}
                </p>
              </div>
            </div>
            <form onSubmit={submitForm} className={styles.formGrid}>
              <label>
                Nama Siswa
                <select
                  required
                  value={form.studentId}
                  disabled={studentsLoading || Boolean(studentsError)}
                  onChange={(event) => {
                    const student = activeStudents.find(
                      (item) => item.id === event.target.value,
                    );
                    setForm({
                      ...form,
                      nama: student?.name || "",
                      studentId: student?.id || "",
                      kelas: student?.className || "",
                      mapel: "",
                      guru: "",
                    });
                    setSelectedScheduleId("");
                  }}
                >
                  <option value="">
                    {studentsLoading ? "Memuat siswa..." : "Pilih siswa"}
                  </option>
                  {activeStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} · {student.className}
                    </option>
                  ))}
                  {form.studentId &&
                  !activeStudents.some(
                    (student) => student.id === form.studentId,
                  ) ? (
                    <option value={form.studentId}>
                      {students.find(
                        (student) => student.id === form.studentId,
                      )?.name || form.nama}{" "}
                      (nonaktif/data sebelumnya)
                    </option>
                  ) : null}
                </select>
              </label>
              <label>
                Kelas
                <input required readOnly value={form.kelas} />
              </label>
              <label>
                Tanggal
                <input
                  required
                  type="date"
                  value={form.tanggal}
                  onChange={(event) =>
                    setForm({ ...form, tanggal: event.target.value })
                  }
                />
              </label>
              <label>
                Jadwal Pelajaran (opsional)
                <select
                  value={selectedScheduleId}
                  disabled={!form.kelas || schedulesLoading || Boolean(schedulesError)}
                  onChange={(event) => {
                    const schedule = classSchedules.find(
                      (item) => item.id === event.target.value,
                    );
                    setSelectedScheduleId(event.target.value);
                    setForm({
                      ...form,
                      mapel: schedule?.mapel || "",
                      guru: schedule?.guru || "",
                    });
                  }}
                >
                  <option value="">
                    {schedulesLoading
                      ? "Memuat jadwal..."
                      : "Tanpa mata pelajaran khusus"}
                  </option>
                  {classSchedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.mapel} · {schedule.guru}
                    </option>
                  ))}
                </select>
              </label>
              {form.mapel ? (
                <p className={styles.emptyState}>
                  {form.mapel} · {form.guru}
                </p>
              ) : null}
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  <option>Hadir</option>
                  <option>Izin</option>
                  <option>Sakit</option>
                  <option>Alpha</option>
                </select>
              </label>
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={
                    saving ||
                    studentsLoading ||
                    Boolean(studentsError) ||
                    !activeStudents.length
                  }
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Absensi"}
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
              {studentsError || schedulesError || error ? (
                <p className={styles.portalFormError} role="alert">
                  {studentsError || schedulesError || error}
                </p>
              ) : null}
              {!studentsLoading &&
              !studentsError &&
              activeStudents.length === 0 ? (
                <p className={styles.emptyState}>
                  Tambahkan siswa aktif terlebih dahulu sebelum mencatat
                  kehadiran.
                </p>
              ) : null}
            </form>
          </div>
        ) : null}

        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>Rekap Kehadiran</h3>
              <p>Perkembangan kehadiran per kelas</p>
            </div>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Mata Pelajaran</th>
                <th>Guru</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>Memuat rekap kehadiran...</td>
                </tr>
              ) : null}
              {!loading && !error && rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>Belum ada data kehadiran.</td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.tanggal}</td>
                  <td>{row.nama}</td>
                  <td>{row.kelas}</td>
                  <td>{row.mapel || "—"}</td>
                  <td>{row.guru || "—"}</td>
                  <td>{row.status}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.tableAction}
                      onClick={() => editAttendance(row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`${styles.tableAction} ${styles.danger}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Hapus catatan kehadiran ${row.nama} tanggal ${row.tanggal}?`,
                          )
                        ) {
                          void removeRecord(row.id);
                        }
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {error && !showForm ? (
            <p className={styles.portalFormError} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>
    </SchoolShell>
  );
}