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
  // Data tambahan
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  agama?: string;
  waliMurid?: string;
  teleponWali?: string;
  hubunganWali?: string;
  pekerjaanWali?: string;
  fotoUrl?: string;
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
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  agama: "",
  waliMurid: "",
  teleponWali: "",
  hubunganWali: "",
  pekerjaanWali: "",
  fotoUrl: "",
};

const AGAMA_OPTIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const HUBUNGAN_OPTIONS = ["Ayah", "Ibu", "Kakek", "Nenek", "Paman", "Bibi", "Wali"];

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [linkedStudentIds, setLinkedStudentIds] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Record<string, string>>({});
  const [approvingEmail, setApprovingEmail] = useState("");
  const [form, setForm] = useState<Student>(emptyStudent);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // State untuk Impor Excel Siswa
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<ParsedStudentRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  // Tab for form
  const [formTab, setFormTab] = useState<"dasar" | "wali" | "tambahan">("dasar");

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
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const payload = { ...form };
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
      setFormTab("dasar");
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

  async function handleDelete(id: string) {
    if (!confirm("Hapus data siswa ini? Aksi ini tidak bisa dibatalkan.")) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "Gagal menghapus data siswa."));
      }
      await loadStudents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus data siswa.");
    }
  }

  function handleEdit(student: Student) {
    setForm({ ...emptyStudent, ...student });
    setEditingId(student.id);
    setFormTab("dasar");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleApproveRegistration(email: string, studentId: string) {
    setApprovingEmail(email);
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", email, studentId }),
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "Gagal menyetujui pendaftaran."));
      }
      await loadStudents();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Gagal menyetujui pendaftaran.");
    } finally {
      setApprovingEmail("");
    }
  }

  async function handleFileImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    setImportError("");
    setImportSuccess("");
    try {
      const rows = await parseStudentExcel(file);
      setImportRows(rows);
      setImportFileName(file.name);
    } catch (parseError) {
      setImportError(parseError instanceof Error ? parseError.message : "Gagal membaca file Excel.");
    } finally {
      setImportLoading(false);
    }
  }

  async function handleExecuteImport() {
    if (importRows.length === 0) return;
    setImportSaving(true);
    setImportError("");
    setImportSuccess("");
    try {
      const response = await fetch("/api/students/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: importRows }),
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "Gagal mengimpor data siswa."));
      }
      const result = await response.json() as { imported?: number };
      setImportSuccess(`Berhasil mengimpor ${result.imported ?? importRows.length} data siswa.`);
      setImportRows([]);
      setImportFileName("");
      await loadStudents();
    } catch (importErr) {
      setImportError(importErr instanceof Error ? importErr.message : "Gagal mengimpor data siswa.");
    } finally {
      setImportSaving(false);
    }
  }

  const f = (field: keyof Student) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // ─── DETAIL VIEW MODAL ───────────────────────────────────────────────────────
  if (viewingStudent) {
    const s = viewingStudent;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setViewingStudent(null)}
            style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 600 }}
          >
            ← Kembali
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Detail Siswa</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Kolom Kiri: Data Pribadi */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: s.gender === "L" ? "#dbeafe" : "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {s.gender === "L" ? "👦" : "👧"}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{s.name}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>NIS: {s.nis} · NISN: {s.nisn}</div>
                <span style={{ display: "inline-block", marginTop: 4, padding: "2px 10px", borderRadius: 20, background: s.status === "Aktif" ? "#dcfce7" : "#fef3c7", color: s.status === "Aktif" ? "#16a34a" : "#92400e", fontSize: 12, fontWeight: 600 }}>
                  {s.status}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Data Pribadi</h3>
            {[
              ["Kelas", s.className],
              ["Jenis Kelamin", s.gender === "L" ? "Laki-laki" : "Perempuan"],
              ["Agama", s.agama],
              ["Tempat Lahir", s.tempatLahir],
              ["Tanggal Lahir", s.tanggalLahir],
              ["Alamat", s.alamat],
            ].map(([label, value]) => value ? (
              <div key={label} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: "#94a3b8", minWidth: 120 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ) : null)}
          </div>

          {/* Kolom Kanan: Data Wali */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Data Wali Murid</h3>
            {[
              ["Nama Wali", s.waliMurid],
              ["Hubungan", s.hubunganWali],
              ["Telepon Wali", s.teleponWali],
              ["Pekerjaan", s.pekerjaanWali],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: "#94a3b8", minWidth: 120 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Belum diisi</span>}</span>
              </div>
            ))}

            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => { setViewingStudent(null); handleEdit(s); }}
                style={{ padding: "8px 18px", borderRadius: 6, background: "#198caf", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              >
                ✏️ Edit Data
              </button>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN VIEW ───────────────────────────────────────────────────────────────
  return (
    <>
      {error && (
        <div className={styles.errorBanner} style={{ marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── FORM TAMBAH / EDIT ─────────────────────────────────── */}
      <section className={styles.formCard} style={{ marginBottom: 32 }}>
        <div className={styles.formCardHeader}>
          <b>{editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}</b>
          {editingId && (
            <button
              type="button"
              onClick={() => { setForm(emptyStudent); setEditingId(null); setFormTab("dasar"); setError(""); }}
              style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}
            >
              Batal Edit
            </button>
          )}
        </div>

        {/* Tab navigasi form */}
        <div className={styles.formTabNav}>
          {(["dasar", "wali", "tambahan"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFormTab(tab)}
              className={`${styles.formTabBtn} ${formTab === tab ? styles.formTabBtnActive : ""}`}
            >
              {tab === "dasar" ? "📋 Data Dasar" : tab === "wali" ? "👨‍👩‍👧 Wali Murid" : "📌 Data Tambahan"}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          {/* Tab: Data Dasar */}
          {formTab === "dasar" && (
            <div className={styles.formGrid3}>
              <label className={styles.formLabel} style={{ gridColumn: "1/-1" }}>
                <span>Nama Lengkap *</span>
                <input className={styles.formInput} value={form.name} onChange={f("name")} placeholder="Nama lengkap siswa" required />
              </label>
              <label className={styles.formLabel}>
                <span>NIS *</span>
                <input className={styles.formInput} value={form.nis} onChange={f("nis")} placeholder="Nomor Induk Siswa" required />
              </label>
              <label className={styles.formLabel}>
                <span>NISN *</span>
                <input className={styles.formInput} value={form.nisn} onChange={f("nisn")} placeholder="Nomor Induk Siswa Nasional" required />
              </label>
              <label className={styles.formLabel}>
                <span>Kelas *</span>
                <input className={styles.formInput} value={form.className} onChange={f("className")} placeholder="Cth: Kelas 7 / Kelas 8" required />
              </label>
              <label className={styles.formLabel}>
                <span>Jenis Kelamin *</span>
                <select className={styles.formInput} value={form.gender} onChange={f("gender")} required>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </label>
              <label className={styles.formLabel}>
                <span>Status *</span>
                <select className={styles.formInput} value={form.status} onChange={f("status")} required>
                  <option value="Aktif">Aktif</option>
                  <option value="Baru">Baru</option>
                  <option value="Pindah">Pindah</option>
                </select>
              </label>
              <label className={styles.formLabel}>
                <span>Agama</span>
                <select className={styles.formInput} value={form.agama ?? ""} onChange={f("agama")}>
                  <option value="">— Pilih Agama —</option>
                  {AGAMA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
            </div>
          )}

          {/* Tab: Wali Murid */}
          {formTab === "wali" && (
            <div className={styles.formGrid2}>
              <label className={styles.formLabel} style={{ gridColumn: "1/-1" }}>
                <span>Nama Wali Murid</span>
                <input className={styles.formInput} value={form.waliMurid ?? ""} onChange={f("waliMurid")} placeholder="Nama lengkap wali murid" />
              </label>
              <label className={styles.formLabel}>
                <span>Hubungan dengan Siswa</span>
                <select className={styles.formInput} value={form.hubunganWali ?? ""} onChange={f("hubunganWali")}>
                  <option value="">— Pilih Hubungan —</option>
                  {HUBUNGAN_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
              <label className={styles.formLabel}>
                <span>Telepon Wali</span>
                <input className={styles.formInput} value={form.teleponWali ?? ""} onChange={f("teleponWali")} placeholder="Cth: 081234567890" />
              </label>
              <label className={styles.formLabel} style={{ gridColumn: "1/-1" }}>
                <span>Pekerjaan Wali</span>
                <input className={styles.formInput} value={form.pekerjaanWali ?? ""} onChange={f("pekerjaanWali")} placeholder="Cth: Pegawai Negeri, Wiraswasta" />
              </label>
            </div>
          )}

          {/* Tab: Data Tambahan */}
          {formTab === "tambahan" && (
            <div className={styles.formGrid2}>
              <label className={styles.formLabel}>
                <span>Tempat Lahir</span>
                <input className={styles.formInput} value={form.tempatLahir ?? ""} onChange={f("tempatLahir")} placeholder="Cth: Klaten" />
              </label>
              <label className={styles.formLabel}>
                <span>Tanggal Lahir</span>
                <input className={styles.formInput} type="date" value={form.tanggalLahir ?? ""} onChange={f("tanggalLahir")} />
              </label>
              <label className={styles.formLabel} style={{ gridColumn: "1/-1" }}>
                <span>Alamat Lengkap</span>
                <textarea
                  className={styles.formInput}
                  value={form.alamat ?? ""}
                  onChange={f("alamat")}
                  placeholder="Alamat lengkap tempat tinggal siswa"
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </label>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => { setForm(emptyStudent); setEditingId(null); setFormTab("dasar"); }}
              className={styles.resetButton}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className={styles.submitButton}
            >
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Siswa"}
            </button>
          </div>
        </form>
      </section>

      {/* ── IMPORT EXCEL & DOWNLOAD TEMPLATE ─────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #198caf", background: "#f0f9ff", color: "#198caf", cursor: "pointer", fontWeight: 600 }}
        >
          📥 Impor Excel
        </button>
        <button
          type="button"
          onClick={() => void downloadStudentTemplate()}
          style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #16a34a", background: "#f0fdf4", color: "#16a34a", cursor: "pointer", fontWeight: 600 }}
        >
          📄 Unduh Template
        </button>
      </div>

      {/* ── TABEL DAFTAR SISWA ─────────────────────────────────── */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>Memuat data siswa...</p>
      ) : students.length === 0 ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Belum ada data siswa. Tambahkan siswa menggunakan form di atas.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>NIS</th>
                <th>NISN</th>
                <th>Kelas</th>
                <th>L/P</th>
                <th>Wali Murid</th>
                <th>Telepon Wali</th>
                <th>Agama</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setViewingStudent(s)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#198caf", fontWeight: 600, textDecoration: "underline", padding: 0, textAlign: "left" }}
                    >
                      {s.name}
                    </button>
                  </td>
                  <td>{s.nis}</td>
                  <td>{s.nisn}</td>
                  <td>{s.className}</td>
                  <td>{s.gender === "L" ? "L" : "P"}</td>
                  <td>{s.waliMurid || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td>{s.teleponWali || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td>{s.agama || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: s.status === "Aktif" ? "#dcfce7" : "#fef3c7", color: s.status === "Aktif" ? "#16a34a" : "#92400e" }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setViewingStudent(s)}
                      className={styles.editButton}
                      title="Lihat detail"
                    >
                      👁
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                      className={styles.editButton}
                      title="Edit data siswa"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(s.id)}
                      className={styles.deleteButton}
                      title="Hapus siswa"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
            Total: {students.length} siswa terdaftar
          </p>
        </div>
      )}

      {/* ── PENDAFTARAN MENUNGGU ─────────────────────────────────── */}
      {registrations.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            ⏳ Pendaftaran Menunggu Persetujuan ({registrations.length})
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Wali Murid</th>
                  <th>Telepon</th>
                  <th>NIS</th>
                  <th>Tautkan ke Siswa</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.email}>
                    <td>{reg.email}</td>
                    <td>{reg.name}</td>
                    <td>{reg.grade ?? "—"}</td>
                    <td>{reg.parentName ?? "—"}</td>
                    <td>{reg.phone ?? "—"}</td>
                    <td>{reg.nis ?? "—"}</td>
                    <td>
                      {linkedStudentIds.includes(reg.registrationId ?? "") ? (
                        <span style={{ color: "#16a34a", fontSize: 12 }}>✓ Tertaut</span>
                      ) : (
                        <select
                          value={selectedStudents[reg.email] ?? ""}
                          onChange={(e) => setSelectedStudents(prev => ({ ...prev, [reg.email]: e.target.value }))}
                          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 12 }}
                        >
                          <option value="">— Pilih Siswa —</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={approvingEmail === reg.email || !selectedStudents[reg.email]}
                        onClick={() => void handleApproveRegistration(reg.email, selectedStudents[reg.email])}
                        style={{ padding: "4px 12px", borderRadius: 4, background: "#16a34a", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        {approvingEmail === reg.email ? "Memproses..." : "Setujui"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── MODAL IMPOR EXCEL ────────────────────────────────────── */}
      {showImportModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: "min(90vw, 680px)", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Impor Data Siswa dari Excel</h3>
              <button type="button" onClick={() => { setShowImportModal(false); setImportRows([]); setImportFileName(""); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>

            {importError && <p style={{ color: "#bd3b3b", fontSize: 13, marginBottom: 12 }}>⚠ {importError}</p>}
            {importSuccess && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 12 }}>✓ {importSuccess}</p>}

            <div style={{ border: "2px dashed #cbd5e1", borderRadius: 8, padding: 24, textAlign: "center", marginBottom: 16 }}>
              <input type="file" accept=".xlsx,.xls" onChange={(e) => void handleFileImport(e)} style={{ display: "none" }} id="excel-import" />
              <label htmlFor="excel-import" style={{ cursor: "pointer", color: "#198caf", fontWeight: 600 }}>
                📂 {importFileName || "Klik untuk pilih file Excel (.xlsx / .xls)"}
              </label>
            </div>

            {importLoading && <p style={{ textAlign: "center", color: "#64748b" }}>Membaca file Excel...</p>}

            {importRows.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Pratinjau ({importRows.length} siswa terdeteksi):</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Menampilkan maks. 5 baris pertama</span>
                </div>
                <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  <table className={styles.dataTable} style={{ margin: 0, fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>#</th><th>Nama</th><th>NIS</th><th>NISN</th><th>Kelas</th><th>L/P</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><b>{row.name}</b></td>
                          <td>{row.nis}</td>
                          <td>{row.nisn || "—"}</td>
                          <td>{row.className}</td>
                          <td>{row.gender}</td>
                          <td><span className={styles.statusBadge}>{row.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importRows.length > 5 && <p style={{ fontSize: 12, color: "#64748b", marginTop: 6, textAlign: "right" }}>...dan {importRows.length - 5} baris lainnya akan diimpor.</p>}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportRows([]); setImportFileName(""); }}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importRows.length === 0 || importSaving}
                onClick={() => void handleExecuteImport()}
                style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: importRows.length === 0 || importSaving ? "#94a3b8" : "#16a34a", color: "#fff", fontWeight: 700, cursor: importRows.length === 0 || importSaving ? "not-allowed" : "pointer" }}
              >
                {importSaving ? "Menyimpan..." : `Impor ${importRows.length} Data Siswa`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
