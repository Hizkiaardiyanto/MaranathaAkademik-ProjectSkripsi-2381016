"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { getApiErrorMessage } from "@/lib/api-error";

type Student = {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  className: string;
  gender: "L" | "P";
  status: string;
};
type PendingRegistration = {
  email: string;
  name: string;
  grade: string | null;
  parentName: string | null;
  phone: string | null;
  registrationId: string | null;
  nis: string | null;
  nisn: string | null;
  gender: "L" | "P" | null;
};

const emptyStudent: Student = {
  id: "",
  name: "",
  nis: "",
  nisn: "",
  className: "",
  gender: "L",
  status: "Aktif",
};

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [linkedStudentIds, setLinkedStudentIds] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<
    Record<string, string>
  >({});
  const [approvingEmail, setApprovingEmail] = useState("");
  const [form, setForm] = useState<Student>(emptyStudent);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadStudents() {
    const response = await fetch("/api/students");
    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, "Data siswa gagal dimuat."),
      );
    }
    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Format data siswa dari server tidak valid.");
    }
    setStudents(data);

    const registrationsResponse = await fetch("/api/student-registrations");
    if (!registrationsResponse.ok) {
      throw new Error(
        await getApiErrorMessage(
          registrationsResponse,
          "Pendaftaran siswa gagal dimuat.",
        ),
      );
    }
    const pendingData: unknown = await registrationsResponse.json();
    if (
      !pendingData ||
      typeof pendingData !== "object" ||
      !("registrations" in pendingData) ||
      !("linkedStudentIds" in pendingData) ||
      !Array.isArray(pendingData.registrations) ||
      !Array.isArray(pendingData.linkedStudentIds)
    ) {
      throw new Error("Format pendaftaran siswa dari server tidak valid.");
    }
    setRegistrations(pendingData.registrations as PendingRegistration[]);
    setLinkedStudentIds(pendingData.linkedStudentIds as string[]);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await loadStudents();
      } catch (loadError) {
        console.error("Failed to load students:", loadError);
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Koneksi gagal. Data siswa tidak dapat dimuat.",
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
    const payload = {
      ...form,
      className: form.className,
    };
    const url = editingId ? `/api/students/${editingId}` : "/api/students";
    const method = editingId ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Data siswa gagal disimpan."),
        );
      }
      setForm(emptyStudent);
      setEditingId(null);
      await loadStudents();
    } catch (saveError) {
      console.error("Failed to save student:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Koneksi gagal. Data siswa tidak dapat disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(student: Student) {
    setForm(student);
    setEditingId(student.id);
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Data siswa gagal dihapus."),
        );
      }
      await loadStudents();
    } catch (deleteError) {
      console.error(`Failed to delete student ${id}:`, deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Koneksi gagal. Data siswa tidak dapat dihapus.",
      );
    }
  }

  async function approveRegistration(registration: PendingRegistration) {
    const selection = selectedStudents[registration.email] ?? "__create__";
    const createStudent = selection === "__create__";
    setError("");
    setApprovingEmail(registration.email);
    try {
      const response = await fetch("/api/student-registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registration.email,
          ...(createStudent ? { createStudent: true } : { studentId: selection }),
        }),
      });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Pendaftaran siswa gagal diverifikasi.",
          ),
        );
      }
      await loadStudents();
      setSelectedStudents((current) => {
        const next = { ...current };
        delete next[registration.email];
        return next;
      });
    } catch (approvalError) {
      console.error(
        `Failed to approve student registration ${registration.email}:`,
        approvalError,
      );
      setError(
        approvalError instanceof Error
          ? approvalError.message
          : "Koneksi gagal. Pendaftaran tidak dapat diverifikasi.",
      );
    } finally {
      setApprovingEmail("");
    }
  }

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <h3>{editingId ? "Edit Siswa" : "Tambah Siswa"}</h3>
            <p>Form data siswa baru atau update data exist</p>
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
            NIS
            <input
              required
              value={form.nis}
              onChange={(e) => setForm({ ...form, nis: e.target.value })}
            />
          </label>
          <label>
            NISN
            <input
              required
              value={form.nisn}
              onChange={(e) => setForm({ ...form, nisn: e.target.value })}
            />
          </label>
          <label>
            Kelas
            <input
              required
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
            />
          </label>
          <label>
            Jenis Kelamin
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as "L" | "P" })
              }
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Aktif">Aktif</option>
              <option value="Lulus">Lulus</option>
              <option value="Pindah">Pindah</option>
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
                  ? "Update Siswa"
                  : "Simpan Siswa"}
            </button>
            {editingId ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setForm(emptyStudent);
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
            <h3>Pendaftaran Siswa Menunggu Verifikasi</h3>
            <p>
              Tekan tombol Verifikasi untuk langsung mendaftarkan pendaftar menjadi siswa aktif.
            </p>
          </div>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Pendaftar</th>
              <th>Informasi</th>
              <th>Data Induk Siswa</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Memuat pendaftaran siswa...</td>
              </tr>
            ) : null}
            {!loading && registrations.length === 0 ? (
              <tr>
                <td colSpan={4}>Tidak ada pendaftaran yang menunggu verifikasi.</td>
              </tr>
            ) : null}
            {registrations.map((registration) => {
              const selectedAction =
                selectedStudents[registration.email] ?? "__create__";
              const isCreate = selectedAction === "__create__";
              return (
                <tr key={registration.email}>
                  <td>
                    <b>{registration.name}</b>
                    <br />
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {registration.email}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {registration.registrationId || "—"}
                    </span>
                    <br />
                    Kelas: <b>{registration.grade || "—"}</b>
                    <br />
                    Wali: {registration.parentName || "—"}
                  </td>
                  <td>
                    <select
                      aria-label={`Pilih tindakan verifikasi untuk ${registration.name}`}
                      value={selectedAction}
                      onChange={(event) =>
                        setSelectedStudents((current) => ({
                          ...current,
                          [registration.email]: event.target.value,
                        }))
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        maxWidth: "100%",
                      }}
                    >
                      <option value="__create__">
                        ✨ Buat data induk siswa baru (Otomatis)
                      </option>
                      {students
                        .filter(
                          (student) => !linkedStudentIds.includes(student.id),
                        )
                        .map((student) => (
                          <option key={student.id} value={student.id}>
                            Tautkan ke: {student.name} · {student.nis} · {student.className}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={approvingEmail === registration.email}
                      onClick={() => void approveRegistration(registration)}
                      style={{
                        padding: "8px 18px",
                        fontSize: "13px",
                        fontWeight: 700,
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: approvingEmail === registration.email ? "not-allowed" : "pointer",
                        boxShadow: "0 1px 3px rgba(37, 99, 235, 0.25)",
                        whiteSpace: "nowrap",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {approvingEmail === registration.email
                        ? "Memverifikasi..."
                        : isCreate
                          ? "Verifikasi"
                          : "Verifikasi & Tautkan"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <h3>Daftar Siswa</h3>
            <p>Data siswa aktif dalam sistem</p>
          </div>
        </div>

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIS</th>
              <th>NISN</th>
              <th>Kelas</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Memuat data siswa...</td>
              </tr>
            ) : null}
            {!loading && !error && students.length === 0 ? (
              <tr>
                <td colSpan={6}>Belum ada data siswa.</td>
              </tr>
            ) : null}
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.nis}</td>
                <td>{student.nisn}</td>
                <td>{student.className}</td>
                <td>
                  <span className={styles.statusBadge}>{student.status}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.tableAction}
                    onClick={() => handleEdit(student)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.tableAction} ${styles.danger}`}
                    onClick={() => handleDelete(student.id)}
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
