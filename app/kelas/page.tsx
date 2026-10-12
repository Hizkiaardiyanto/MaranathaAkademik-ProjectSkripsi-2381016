"use client";

import { FormEvent, useState } from "react";
import { SchoolShell } from "@/components/school-shell";
import { useAcademicRecords } from "@/lib/use-academic-records";
import styles from "../page.module.css";

type ClassRoom = {
  id: string;
  nama: string;
  jenjang: "SD" | "SMP";
  wali: string;
  jumlah: number;
};

const emptyForm: Omit<ClassRoom, "id" | "jumlah"> & { jumlah: string } = {
  nama: "",
  jenjang: "SD",
  wali: "",
  jumlah: "",
};

export default function KelasPage() {
  const { rows, loading, error, clearError, saveRecord, removeRecord } =
    useAcademicRecords<ClassRoom>("classes");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const classRoom = {
      nama: form.nama,
      jenjang: form.jenjang,
      wali: form.wali,
      jumlah: Number(form.jumlah),
    };
    setSaving(true);
    try {
      const saved = await saveRecord(classRoom, editingId ?? undefined);
      if (!saved) return;
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function editRow(row: ClassRoom) {
    setForm({
      nama: row.nama,
      jenjang: row.jenjang,
      wali: row.wali,
      jumlah: String(row.jumlah),
    });
    setEditingId(row.id);
    setShowForm(true);
  }

  return (
    <SchoolShell title="Kelas" activeItem="Kelas">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>STRUKTUR KELAS</p>
            <h1>Data Kelas</h1>
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
            + Tambah Kelas
          </button>
        </div>

        {showForm ? (
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <div>
                <h3>{editingId ? "Edit Kelas" : "Tambah Kelas"}</h3>
                <p>Masukkan data rombel</p>
              </div>
            </div>
            <form onSubmit={submitForm} className={styles.formGrid}>
              <label>
                Nama Kelas
                <input
                  required
                  value={form.nama}
                  onChange={(event) =>
                    setForm({ ...form, nama: event.target.value })
                  }
                />
              </label>
              <label>
                Jenjang
                <select
                  value={form.jenjang}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      jenjang: event.target.value as "SD" | "SMP",
                    })
                  }
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                </select>
              </label>
              <label>
                Wali Kelas
                <input
                  required
                  value={form.wali}
                  onChange={(event) =>
                    setForm({ ...form, wali: event.target.value })
                  }
                />
              </label>
              <label>
                Jumlah Siswa
                <input
                  required
                  type="number"
                  min="0"
                  value={form.jumlah}
                  onChange={(event) =>
                    setForm({ ...form, jumlah: event.target.value })
                  }
                />
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
                      : "Simpan Kelas"}
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
              <h3>Daftar Rombel</h3>
              <p>Informasi kelas aktif</p>
            </div>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Nama Kelas</th>
                  <th>Jenjang</th>
                  <th>Wali Kelas</th>
                <th>Jumlah Siswa</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Memuat data kelas...</td>
                </tr>
              ) : null}
              {!loading && !error && rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>Belum ada data kelas.</td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.nama}</td>
                  <td>{row.jenjang}</td>
                  <td>{row.wali}</td>
                  <td>{row.jumlah}</td>
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
                        void removeRecord(row.id);
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
