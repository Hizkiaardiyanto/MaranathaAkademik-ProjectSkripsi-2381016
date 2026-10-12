"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SchoolShell } from "@/components/school-shell";
import { useAcademicRecords } from "@/lib/use-academic-records";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "../page.module.css";

type Grade = {
  id: string;
  nama: string;
  mapel: string;
  nilai: number;
  studentId?: string;
};
type Subject = { id: string; nama: string };
type Student = { id: string; name: string; status: string };

export default function NilaiPage() {
  const {
    rows,
    loading,
    error,
    clearError,
    saveRecord,
    removeRecord,
  } =
    useAcademicRecords<Grade>("grades");
  const {
    rows: subjectRows,
    loading: subjectsLoading,
    error: subjectsError,
  } = useAcademicRecords<Subject>("subjects");
  const [studentRows, setStudentRows] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [form, setForm] = useState({
    nama: "",
    studentId: "",
    mapel: "",
    nilai: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const subjects = useMemo(
    () =>
      Array.from(
        new Set([...subjectRows.map((subject) => subject.nama), ...rows.map((row) => row.mapel)]),
      ).filter(Boolean),
    [rows, subjectRows],
  );
  const activeStudents = useMemo(
    () => studentRows.filter((student) => student.status === "Aktif"),
    [studentRows],
  );
  const students = useMemo(() => {
    const masterIds = new Set(studentRows.map((student) => student.id));
    const masterNames = new Set(studentRows.map((student) => student.name));
    return [
      ...studentRows.map((student) => ({
        id: student.id,
        name: student.name,
      })),
      ...Array.from(
        new Set(
          rows
            .filter(
              (row) =>
                (!row.studentId || !masterIds.has(row.studentId)) &&
                !masterNames.has(row.nama),
            )
            .map((row) => row.nama),
        ),
      ).map((name) => ({ id: `legacy:${name}`, name })),
    ];
  }, [studentRows, rows]);
  const studentOptions = useMemo(() => {
    const options = activeStudents.map((student) => ({
      id: student.id,
      name: student.name,
    }));
    const existing = studentRows.find(
      (student) => student.id === form.studentId,
    );
    if (
      existing &&
      existing.status !== "Aktif" &&
      !options.some((student) => student.id === existing.id)
    ) {
      options.push({
        id: existing.id,
        name: `${existing.name} (nonaktif; data sebelumnya)`,
      });
    }
    const legacy = students.find((student) => student.id === form.studentId);
    if (
      legacy &&
      legacy.id.startsWith("legacy:") &&
      !options.some((student) => student.id === legacy.id)
    ) {
      options.push(legacy);
    }
    return options;
  }, [activeStudents, form.studentId, studentRows, students]);
  const gradeMap = useMemo(
    () =>
      new Map(
        rows.map((row) => [
          `${row.studentId || `legacy:${row.nama}`}::${row.mapel}`,
          row,
        ]),
      ),
    [rows],
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
              typeof student.status === "string",
          )
        ) {
          throw new Error("Format data siswa dari server tidak valid.");
        }
        if (active) setStudentRows(data as Student[]);
      } catch (loadError) {
        console.error("Failed to load grade students:", loadError);
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
    const grade = {
      nama: form.nama,
      studentId: form.studentId.startsWith("legacy:")
        ? undefined
        : form.studentId,
      mapel: form.mapel,
      nilai: Number(form.nilai),
    };
    setSaving(true);
    try {
      const saved = await saveRecord(grade, editingId ?? undefined);
      if (!saved) return;
      setForm({ nama: "", studentId: "", mapel: "", nilai: "" });
      setEditingId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function editRow(row: Grade) {
    clearError();
    const studentId =
      row.studentId ||
      studentRows.find((student) => student.name === row.nama)?.id ||
      (students.find((student) => student.name === row.nama)?.id ?? "");
    setForm({
      nama: row.nama,
      studentId,
      mapel: row.mapel,
      nilai: String(row.nilai),
    });
    setEditingId(row.id);
    setShowForm(true);
  }

  return (
    <SchoolShell title="Pengelolaan Nilai" activeItem="Pengelolaan Nilai">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>ASSESSMENT</p>
            <h1>Pengelolaan Nilai</h1>
          </div>
          <button
            type="button"
            className={styles.dateButton}
            onClick={() => {
              clearError();
              setForm({ nama: "", studentId: "", mapel: "", nilai: "" });
              setEditingId(null);
              setShowForm(true);
            }}
          >
            + Input Nilai
          </button>
        </div>

        {showForm ? (
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>{editingId ? "Edit Nilai" : "Input Nilai"}</h3>
                <p>Masukkan nilai siswa</p>
              </div>
            </div>
            <form onSubmit={submitForm} className={styles.formGrid}>
              <label>
                Nama Siswa
                <select
                  required
                  value={form.studentId}
                  onChange={(event) => {
                    const student = students.find(
                      (item) => item.id === event.target.value,
                    );
                    setForm({
                      ...form,
                      nama: student?.name || "",
                      studentId: event.target.value,
                    });
                  }}
                  disabled={studentsLoading || Boolean(studentsError)}
                >
                  <option value="">
                    {studentsLoading ? "Memuat siswa..." : "Pilih siswa"}
                  </option>
                  {studentOptions.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
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
                >
                  <option value="">Pilih mata pelajaran</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nilai
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={form.nilai}
                  onChange={(event) =>
                    setForm({ ...form, nilai: event.target.value })
                  }
                />
              </label>
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={
                    saving ||
                    studentsLoading ||
                    subjectsLoading ||
                    Boolean(studentsError || subjectsError) ||
                    (!editingId &&
                      (!activeStudents.length || !subjects.length))
                  }
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Nilai"}
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
              {studentsError || subjectsError || error ? (
                <p className={styles.portalFormError} role="alert">
                  {studentsError || subjectsError || error}
                </p>
              ) : null}
              {!studentsLoading &&
              !studentsError &&
              activeStudents.length === 0 ? (
                <p className={styles.emptyState}>
                  Tambahkan siswa berstatus aktif di Data Siswa sebelum
                  memasukkan nilai.
                </p>
              ) : null}
              {!subjectsLoading &&
              !subjectsError &&
              subjects.length === 0 ? (
                <p className={styles.emptyState}>
                  Tambahkan mata pelajaran terlebih dahulu.
                </p>
              ) : null}
            </form>
          </div>
        ) : null}

        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>Daftar Nilai</h3>
              <p>Rekap hasil belajar siswa</p>
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>Memuat data nilai...</div>
          ) : error ? (
            <p className={styles.portalFormError} role="alert">
              {error}
            </p>
          ) : students.length === 0 ? (
            <div className={styles.emptyState}>
              Belum ada nilai yang diinput. Tambahkan nilai untuk memulai rekap.
            </div>
          ) : (
            <div className={styles.gradeTableWrap}>
              <table className={`${styles.dataTable} ${styles.gradeTable}`}>
                <thead>
                  <tr>
                    <th>Nama Siswa</th>
                    {subjects.map((subject) => (
                      <th key={subject}>{subject}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                        <tr key={student.id}>
                          <td className={styles.studentName}>{student.name}</td>
                      {subjects.map((subject) => {
                            const grade = gradeMap.get(
                              `${student.id}::${subject}`,
                            );
                        return (
                          <td key={subject}>
                            {grade ? (
                              <div className={styles.gradeCell}>
                                <b>{grade.nilai}</b>
                                <span>
                                  <button type="button" onClick={() => editRow(grade)}>Edit</button>
                                  <button type="button" onClick={() => { void removeRecord(grade.id); }}>Hapus</button>
                                </span>
                              </div>
                            ) : (
                              <span className={styles.noGrade}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {error && !showForm && !loading ? (
            <p className={styles.portalFormError} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>
    </SchoolShell>
  );
}
