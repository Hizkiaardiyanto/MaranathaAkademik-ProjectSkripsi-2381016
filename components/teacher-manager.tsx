"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { getApiErrorMessage } from "@/lib/api-error";

type Teacher = {
  id: string;
  name: string;
  nip: string;
  subject: string;
  phone: string;
  status: string;
};

const emptyTeacher: Teacher = {
  id: "",
  name: "",
  nip: "",
  subject: "",
  phone: "",
  status: "Aktif",
};

export function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<Teacher>(emptyTeacher);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTeachers() {
    const response = await fetch("/api/teachers");
    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, "Data guru gagal dimuat."),
      );
    }
    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Format data guru dari server tidak valid.");
    }
    setTeachers(data);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/teachers");
        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(response, "Data guru gagal dimuat."),
          );
        }
        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Format data guru dari server tidak valid.");
        }
        if (active) setTeachers(data as Teacher[]);
      } catch (loadError) {
        console.error("Failed to load teachers:", loadError);
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Koneksi gagal. Data guru tidak dapat dimuat.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const url = editingId ? `/api/teachers/${editingId}` : "/api/teachers";
    const method = editingId ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Data guru gagal disimpan."),
        );
      }
      setForm(emptyTeacher);
      setEditingId(null);
      await loadTeachers();
    } catch (saveError) {
      console.error("Failed to save teacher:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Koneksi gagal. Data guru tidak dapat disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(teacher: Teacher) {
    setForm(teacher);
    setEditingId(teacher.id);
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Data guru gagal dihapus."),
        );
      }
      await loadTeachers();
    } catch (deleteError) {
      console.error(`Failed to delete teacher ${id}:`, deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Koneksi gagal. Data guru tidak dapat dihapus.",
      );
    }
  }

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <h3>{editingId ? "Edit Guru" : "Tambah Guru"}</h3>
            <p>Kelola informasi guru dan pengajar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <label>
            Nama
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            NIP
            <input
              required
              value={form.nip}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
            />
          </label>
          <label>
            Mata Pelajaran
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </label>
          <label>
            Nomor Telepon
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Pensiun">Pensiun</option>
            </select>
          </label>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Menyimpan..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Simpan Guru"}
            </button>
            {editingId ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setForm(emptyTeacher);
                  setEditingId(null);
                }}
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>
        {error ? (
          <p className={styles.portalFormError} role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <h3>Daftar Guru</h3>
            <p>Data pendidik aktif</p>
          </div>
        </div>

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIP</th>
              <th>Mapel</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Memuat data guru...</td>
              </tr>
            ) : null}
            {!loading && !error && teachers.length === 0 ? (
              <tr>
                <td colSpan={6}>Belum ada data guru.</td>
              </tr>
            ) : null}
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.name}</td>
                <td>{teacher.nip}</td>
                <td>{teacher.subject}</td>
                <td>{teacher.phone}</td>
                <td>
                  <span className={styles.statusBadge}>{teacher.status}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.tableAction}
                    onClick={() => handleEdit(teacher)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.tableAction} ${styles.danger}`}
                    onClick={() => handleDelete(teacher.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
