"use client";

import { FormEvent, useEffect, useState } from "react";
import { SchoolShell } from "@/components/school-shell";
import { useAcademicRecords } from "@/lib/use-academic-records";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "../page.module.css";

type Subject = { id: string; nama: string; kode: string; guru: string };
type Teacher = { id: string; name: string; status: string };

const emptyForm = { nama: "", kode: "", guru: "" };

export default function MataPelajaranPage() {
  const { rows, loading, error, clearError, saveRecord, removeRecord } =
    useAcademicRecords<Subject>("subjects");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState("");
  const activeTeachers = teachers.filter((teacher) => teacher.status === "Aktif");
  const normalizedName = form.nama.trim().toLocaleLowerCase("id-ID");
  const normalizedCode = form.kode.trim().toLocaleLowerCase("id-ID");
  const duplicateName = rows.some(
    (row) =>
      row.id !== editingId &&
      row.nama.trim().toLocaleLowerCase("id-ID") === normalizedName,
  );
  const duplicateCode = rows.some(
    (row) =>
      row.id !== editingId &&
      row.kode.trim().toLocaleLowerCase("id-ID") === normalizedCode,
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
              "Daftar guru pengampu tidak dapat dimuat.",
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
      } catch (loadError) {
        console.error("Failed to load subject teachers:", loadError);
        if (active) {
          setTeachersError(
            loadError instanceof Error
              ? loadError.message
              : "Daftar guru pengampu tidak dapat dimuat.",
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

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (duplicateName || duplicateCode) {
      return;
    }
    setSaving(true);
    try {
      const saved = await saveRecord(
        { nama: form.nama.trim(), kode: form.kode.trim(), guru: form.guru },
        editingId ?? undefined,
      );
      if (!saved) return;
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function editRow(row: Subject) {
    clearError();
    setForm({ nama: row.nama, kode: row.kode, guru: row.guru });
    setEditingId(row.id);
    setShowForm(true);
  }

  return (
    <SchoolShell title="Mata Pelajaran" activeItem="Mata Pelajaran">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>KURIKULUM</p>
            <h1>Mata Pelajaran</h1>
          </div>
          <button
            type="button"
            className={styles.dateButton}
            onClick={() => {
              clearError();
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
          >
            + Tambah Mapel
          </button>
        </div>

        {showForm ? (
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>
                  {editingId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
                </h3>
                <p>Masukkan data mata pelajaran</p>
              </div>
            </div>
            <form onSubmit={submitForm} className={styles.formGrid}>
              <label>
                Nama Mata Pelajaran
                <input
                  required
                  maxLength={120}
                  value={form.nama}
                  onChange={(event) => {
                    setForm({ ...form, nama: event.target.value });
                    clearError();
                  }}
                />
              </label>
              <label>
                Kode
                <input
                  required
                  maxLength={30}
                  value={form.kode}
                  onChange={(event) => {
                    setForm({ ...form, kode: event.target.value });
                    clearError();
                  }}
                />
              </label>
              <label>
                Guru Pengampu
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
                  !activeTeachers.some(
                    (teacher) => teacher.name === form.guru,
                  ) ? (
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
              {teachersError ? (
                <p className={styles.portalFormError} role="alert">
                  {teachersError}
                </p>
              ) : null}
              {!teachersLoading &&
              !teachersError &&
              activeTeachers.length === 0 ? (
                <p className={styles.emptyState}>
                  Tambahkan data guru terlebih dahulu sebelum memilih guru
                  pengampu.
                </p>
              ) : null}
              {duplicateName ? (
                <p className={styles.portalFormError} role="alert">
                  Nama mata pelajaran sudah digunakan.
                </p>
              ) : null}
              {duplicateCode ? (
                <p className={styles.portalFormError} role="alert">
                  Kode mata pelajaran sudah digunakan.
                </p>
              ) : null}
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={
                    saving ||
                    teachersLoading ||
                    Boolean(teachersError) ||
                    (activeTeachers.length === 0 && !form.guru) ||
                    duplicateName ||
                    duplicateCode
                  }
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Mapel"}
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

        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>Daftar Mapel</h3>
              <p>Struktur pembelajaran sekolah</p>
            </div>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mata Pelajaran</th>
                <th>Kode</th>
                <th>Guru Pengampu</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Memuat mata pelajaran...</td>
                </tr>
              ) : null}
              {!loading && !error && rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>Belum ada mata pelajaran.</td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.nama}</td>
                  <td>{row.kode}</td>
                  <td>{row.guru}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.tableAction}
                      onClick={() => editRow(row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`${styles.tableAction} ${styles.danger}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Hapus mata pelajaran ${row.nama}?`,
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
