"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  downloadStudentTemplate,
  parseStudentExcel,
  type ParsedStudentRow,
} from "@/lib/excel-helper";

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

  // State untuk Impor Excel Siswa
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<ParsedStudentRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

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

  async function handleExcelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    setImportLoading(true);
    setImportFileName(file.name);
    try {
      const rows = await parseStudentExcel(file);
      if (rows.length === 0) {
        throw new Error("Tidak ada data siswa yang valid dalam file Excel.");
      }
      setImportRows(rows);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Gagal membaca file Excel.",
      );
      setImportRows([]);
    } finally {
      setImportLoading(false);
    }
  }

  async function handleExecuteImport() {
    if (importRows.length === 0) return;
    setImportSaving(true);
    setImportError("");
    try {
      const response = await fetch("/api/students/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: importRows }),
      });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Gagal mengimpor batch data siswa."),
        );
      }
      const data = await response.json();
      let msg = `Berhasil mengimpor ${data.importedCount ?? importRows.length} data siswa.`;
      if (data.skippedCount > 0) {
        msg += ` (${data.skippedCount} data dilewati karena NIS/NISN sudah ada atau data tidak lengkap)`;
      }
      setImportSuccess(msg);
      setShowImportModal(false);
      setImportRows([]);
      setImportFileName("");
      await loadStudents();
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Gagal menyimpan data siswa.",
      );
    } finally {
      setImportSaving(false);
    }
  }

  return (
    <>
      {importSuccess && (
        <div
          style={{
            padding: "12px 18px",
            marginBottom: "18px",
            borderRadius: "8px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>✓ {importSuccess}</span>
          <button
            onClick={() => setImportSuccess("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#065f46",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.panel}>
        <div className={styles.panelTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3>{editingId ? "Edit Siswa" : "Tambah Siswa"}</h3>
            <p>Form data siswa baru atau update data exist</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={downloadStudentTemplate}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Unduh format file Excel untuk data siswa"
            >
              📥 Unduh Template (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImportModal(true);
                setImportError("");
                setImportRows([]);
                setImportFileName("");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#16a34a",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(22, 163, 74, 0.3)",
              }}
            >
              📂 Impor Data Siswa (Excel)
            </button>
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

      {/* MODAL IMPOR EXCEL SISWA */}
      {showImportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "760px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                  Impor Data Siswa via Excel / CSV
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Unggah file Excel berisi data siswa untuk ditambahkan sekaligus ke master data siswa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            {importError && (
              <p
                style={{
                  color: "#b91c1c",
                  background: "#fef2f2",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "14px",
                }}
              >
                {importError}
              </p>
            )}

            {/* Area Upload File */}
            <div
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                background: "#f8fafc",
                marginBottom: "16px",
              }}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                id="excelStudentInput"
                style={{ display: "none" }}
                onChange={handleExcelFileChange}
              />
              <label
                htmlFor="excelStudentInput"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                📁 Pilih File Excel / CSV
              </label>
              <p
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {importFileName
                  ? `File terpilih: ${importFileName}`
                  : "Mendukung format .xlsx, .xls, .csv"}
              </p>
              <div style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={downloadStudentTemplate}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  📥 Belum punya template? Unduh Template Excel di sini
                </button>
              </div>
            </div>

            {importLoading && (
              <p style={{ textAlign: "center", color: "#64748b" }}>
                Membaca dan memproses file Excel...
              </p>
            )}

            {/* Preview Data yang akan diimpor */}
            {importRows.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>
                    Pratinjau Data ({importRows.length} Siswa Terdeteksi):
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Menampilkan maksimal 5 baris pertama
                  </span>
                </div>
                <div
                  style={{
                    maxHeight: "220px",
                    overflowY: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                  }}
                >
                  <table
                    className={styles.dataTable}
                    style={{ margin: 0, fontSize: "12px" }}
                  >
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nama Siswa</th>
                        <th>NIS</th>
                        <th>NISN</th>
                        <th>Kelas</th>
                        <th>L/P</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <b>{row.name}</b>
                          </td>
                          <td>{row.nis}</td>
                          <td>{row.nisn || "—"}</td>
                          <td>{row.className}</td>
                          <td>{row.gender}</td>
                          <td>
                            <span className={styles.statusBadge}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importRows.length > 5 && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "6px",
                      textAlign: "right",
                    }}
                  >
                    ...dan {importRows.length - 5} baris lainnya akan diimpor.
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportRows([]);
                  setImportFileName("");
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importRows.length === 0 || importSaving}
                onClick={() => void handleExecuteImport()}
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  border: "none",
                  background:
                    importRows.length === 0 || importSaving
                      ? "#94a3b8"
                      : "#16a34a",
                  color: "#fff",
                  fontWeight: 700,
                  cursor:
                    importRows.length === 0 || importSaving
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {importSaving
                  ? "Menyimpan Data..."
                  : `Impor ${importRows.length} Data Siswa`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
