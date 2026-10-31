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
  alamat?: string;
  pendidikanTerakhir?: string;
  jurusan?: string;
  gelar?: string;
  gender?: "L" | "P";
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  email?: string;
  statusKepegawaian?: string;
};

const emptyTeacher: Teacher = {
  id: "",
  name: "",
  nip: "",
  subject: "",
  phone: "",
  status: "Aktif",
  alamat: "",
  pendidikanTerakhir: "S1",
  jurusan: "",
  gelar: "",
  gender: "L",
  tempatLahir: "",
  tanggalLahir: "",
  agama: "Kristen",
  email: "",
  statusKepegawaian: "GTY",
};

const PENDIDIKAN_OPTIONS = [
  "D3",
  "D4",
  "S1",
  "S2",
  "S3",
  "Profesi Akta IV / PPG",
  "SMA / SMK Sederajat",
];

const AGAMA_OPTIONS = ["Kristen", "Katolik", "Islam", "Hindu", "Buddha", "Konghucu"];
const STATUS_KEPEGAWAIAN_OPTIONS = [
  "Guru Tetap Yayasan (GTY)",
  "Guru Tidak Tetap (GTT)",
  "Guru Honorer",
  "PNS DPK",
  "Guru Kontrak",
];

export function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<Teacher>(emptyTeacher);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [formTab, setFormTab] = useState<"dasar" | "pendidikan" | "pribadi">("dasar");

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
    setTeachers(data as Teacher[]);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await loadTeachers();
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
    const payload = { ...form };
    const url = editingId ? `/api/teachers/${editingId}` : "/api/teachers";
    const method = editingId ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Data guru gagal disimpan."),
        );
      }
      setForm(emptyTeacher);
      setEditingId(null);
      setFormTab("dasar");
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
    setForm({ ...emptyTeacher, ...teacher });
    setEditingId(teacher.id);
    setFormTab("dasar");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus data guru ini? Tindakan ini tidak dapat dibatalkan.")) return;
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

  const f =
    (field: keyof Teacher) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // ── DETAIL VIEW MODAL ────────────────────────────────────────────────────────
  if (viewingTeacher) {
    const t = viewingTeacher;
    const fullName = `${t.name}${t.gelar ? `, ${t.gelar}` : ""}`;

    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setViewingTeacher(null)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Kembali
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Detail Data Guru & Tenaga Pendidik
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Kolom 1: Profil & Kepegawaian */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: t.gender === "P" ? "#fce7f3" : "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {t.gender === "P" ? "👩‍🏫" : "👨‍🏫"}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{fullName}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>NIP: {t.nip}</div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    padding: "2px 10px",
                    borderRadius: 20,
                    background: t.status === "Aktif" ? "#dcfce7" : "#fee2e2",
                    color: t.status === "Aktif" ? "#16a34a" : "#b91c1c",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {t.status}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Data Pendidik & Kepegawaian
            </h3>
            {[
              ["Mata Pelajaran", t.subject],
              ["Status Kepegawaian", t.statusKepegawaian || "Guru Tetap Yayasan (GTY)"],
              ["Jenis Kelamin", t.gender === "L" ? "Laki-laki" : t.gender === "P" ? "Perempuan" : "—"],
              ["Agama", t.agama || "—"],
              [
                "Tempat, Tgl Lahir",
                t.tempatLahir || t.tanggalLahir
                  ? `${t.tempatLahir || ""}${t.tempatLahir && t.tanggalLahir ? ", " : ""}${t.tanggalLahir ? t.tanggalLahir.slice(0, 10) : ""}`
                  : "—",
              ],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: "#94a3b8", minWidth: 140 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Kolom 2: Pendidikan & Domisili */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Pendidikan & Kualifikasi
            </h3>
            {[
              ["Pendidikan Terakhir", t.pendidikanTerakhir || "S1"],
              ["Program Studi / Jurusan", t.jurusan || "—"],
              ["Gelar Akademik", t.gelar || "—"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: "#94a3b8", minWidth: 150 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}

            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#64748b",
                marginTop: 20,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Kontak & Domisili
            </h3>
            {[
              ["No. Telepon / WA", t.phone],
              ["Email", t.email || "—"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: "#94a3b8", minWidth: 150 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}

            <div style={{ marginTop: 12 }}>
              <span style={{ color: "#94a3b8", fontSize: 14, display: "block", marginBottom: 4 }}>Alamat Domisili:</span>
              <div
                style={{
                  padding: "10px 14px",
                  background: "#f8fafc",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {t.alamat || "Alamat domisili belum dilengkapi."}
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setViewingTeacher(null);
                  handleEdit(t);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  background: "#198caf",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                ✏️ Edit Data
              </button>
              <button
                type="button"
                onClick={() => setViewingTeacher(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ───────────────────────────────────────────────────────────────
  return (
    <>
      {error && (
        <div className={styles.errorBanner} style={{ marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── FORM TAMBAH / EDIT GURU ──────────────────────────────── */}
      <section className={styles.formCard} style={{ marginBottom: 32 }}>
        <div className={styles.formCardHeader}>
          <b>{editingId ? "Edit Data Guru" : "Tambah Data Guru Baru"}</b>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(emptyTeacher);
                setEditingId(null);
                setFormTab("dasar");
                setError("");
              }}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Batal Edit
            </button>
          )}
        </div>

        {/* Tab Navigasi Form */}
        <div className={styles.formTabNav}>
          {(["dasar", "pendidikan", "pribadi"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFormTab(tab)}
              className={`${styles.formTabBtn} ${formTab === tab ? styles.formTabBtnActive : ""}`}
            >
              {tab === "dasar"
                ? "📋 Data Pendidik"
                : tab === "pendidikan"
                  ? "🎓 Kualifikasi Pendidikan"
                  : "📌 Domisili & Data Pribadi"}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          {/* TAB 1: DATA PENDIDIK */}
          {formTab === "dasar" && (
            <div className={styles.formGrid3}>
              <label className={styles.formLabel} style={{ gridColumn: "span 2" }}>
                <span>Nama Lengkap Guru *</span>
                <input
                  className={styles.formInput}
                  value={form.name}
                  onChange={f("name")}
                  placeholder="Nama lengkap tanpa gelar"
                  required
                />
              </label>

              <label className={styles.formLabel}>
                <span>Gelar Akademik</span>
                <input
                  className={styles.formInput}
                  value={form.gelar ?? ""}
                  onChange={f("gelar")}
                  placeholder="Contoh: S.Pd., M.Pd."
                />
              </label>

              <label className={styles.formLabel}>
                <span>NIP (Nomor Induk Pegawai) *</span>
                <input
                  className={styles.formInput}
                  value={form.nip}
                  onChange={f("nip")}
                  placeholder="NIP guru"
                  required
                />
              </label>

              <label className={styles.formLabel}>
                <span>Mata Pelajaran yang Diampu *</span>
                <input
                  className={styles.formInput}
                  value={form.subject}
                  onChange={f("subject")}
                  placeholder="Contoh: Matematika, Bahasa Inggris"
                  required
                />
              </label>

              <label className={styles.formLabel}>
                <span>Status Aktif *</span>
                <select
                  className={styles.formInput}
                  value={form.status}
                  onChange={f("status")}
                  required
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Pensiun">Pensiun</option>
                </select>
              </label>

              <label className={styles.formLabel}>
                <span>Status Kepegawaian</span>
                <select
                  className={styles.formInput}
                  value={form.statusKepegawaian ?? "GTY"}
                  onChange={f("statusKepegawaian")}
                >
                  {STATUS_KEPEGAWAIAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formLabel}>
                <span>Jenis Kelamin</span>
                <select
                  className={styles.formInput}
                  value={form.gender ?? "L"}
                  onChange={f("gender")}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </label>

              <label className={styles.formLabel}>
                <span>No. Telepon / WhatsApp *</span>
                <input
                  className={styles.formInput}
                  value={form.phone}
                  onChange={f("phone")}
                  placeholder="Contoh: 081234567890"
                  required
                />
              </label>
            </div>
          )}

          {/* TAB 2: PENDIDIKAN TERAKHIR */}
          {formTab === "pendidikan" && (
            <div className={styles.formGrid2}>
              <label className={styles.formLabel}>
                <span>Pendidikan Terakhir</span>
                <select
                  className={styles.formInput}
                  value={form.pendidikanTerakhir ?? "S1"}
                  onChange={f("pendidikanTerakhir")}
                >
                  {PENDIDIKAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formLabel}>
                <span>Program Studi / Jurusan</span>
                <input
                  className={styles.formInput}
                  value={form.jurusan ?? ""}
                  onChange={f("jurusan")}
                  placeholder="Contoh: Pendidikan Bahasa Inggris, PGSD"
                />
              </label>

              <label className={styles.formLabel} style={{ gridColumn: "1 / -1" }}>
                <span>Email Guru</span>
                <input
                  type="email"
                  className={styles.formInput}
                  value={form.email ?? ""}
                  onChange={f("email")}
                  placeholder="emailguru@maranatha.sch.id"
                />
              </label>
            </div>
          )}

          {/* TAB 3: DOMISILI & DATA PRIBADI */}
          {formTab === "pribadi" && (
            <div className={styles.formGrid2}>
              <label className={styles.formLabel}>
                <span>Tempat Lahir</span>
                <input
                  className={styles.formInput}
                  value={form.tempatLahir ?? ""}
                  onChange={f("tempatLahir")}
                  placeholder="Contoh: Klaten"
                />
              </label>

              <label className={styles.formLabel}>
                <span>Tanggal Lahir</span>
                <input
                  type="date"
                  className={styles.formInput}
                  value={form.tanggalLahir ?? ""}
                  onChange={f("tanggalLahir")}
                />
              </label>

              <label className={styles.formLabel} style={{ gridColumn: "1 / -1" }}>
                <span>Agama</span>
                <select
                  className={styles.formInput}
                  value={form.agama ?? "Kristen"}
                  onChange={f("agama")}
                >
                  {AGAMA_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formLabel} style={{ gridColumn: "1 / -1" }}>
                <span>Alamat Domisili Lengkap</span>
                <textarea
                  className={styles.formInput}
                  rows={3}
                  value={form.alamat ?? ""}
                  onChange={f("alamat")}
                  placeholder="Alamat lengkap tempat tinggal guru saat ini"
                  style={{ resize: "vertical" }}
                />
              </label>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setForm(emptyTeacher);
                setEditingId(null);
                setFormTab("dasar");
              }}
              className={styles.resetButton}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className={styles.submitButton}
            >
              {saving
                ? "Menyimpan..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Tambah Guru"}
            </button>
          </div>
        </form>
      </section>

      {/* ── TABEL DAFTAR GURU ────────────────────────────────────── */}
      <div className={styles.panel}>
        <div
          className={styles.panelTitle}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <h3>Daftar Guru & Tenaga Pendidik</h3>
            <p>Data pendidik SD - SMP Kristen Maranatha</p>
          </div>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            Total: {teachers.length} Guru
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Guru</th>
                <th>NIP</th>
                <th>Mata Pelajaran</th>
                <th>Pendidikan</th>
                <th>Domisili / Alamat</th>
                <th>No. Telepon</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
                    Memuat data guru...
                  </td>
                </tr>
              ) : null}
              {!loading && !error && teachers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                    Belum ada data guru. Tambahkan guru menggunakan form di atas.
                  </td>
                </tr>
              ) : null}
              {teachers.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setViewingTeacher(t)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#198caf",
                        fontWeight: 700,
                        textAlign: "left",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      {t.name}
                      {t.gelar ? `, ${t.gelar}` : ""}
                    </button>
                    {t.statusKepegawaian && (
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {t.statusKepegawaian}
                      </div>
                    )}
                  </td>
                  <td>{t.nip}</td>
                  <td>
                    <b>{t.subject}</b>
                  </td>
                  <td>
                    {t.pendidikanTerakhir || "S1"}
                    {t.jurusan ? ` (${t.jurusan})` : ""}
                  </td>
                  <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.alamat || <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td>{t.phone}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: t.status === "Aktif" ? "#dcfce7" : "#fee2e2",
                        color: t.status === "Aktif" ? "#16a34a" : "#b91c1c",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setViewingTeacher(t)}
                        className={styles.editButton}
                        title="Lihat Detail Guru"
                      >
                        👁
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(t)}
                        className={styles.editButton}
                        title="Edit Data Guru"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(t.id)}
                        className={styles.deleteButton}
                        title="Hapus Data Guru"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
