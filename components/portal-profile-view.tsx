"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type ProfileData = {
  email: string;
  role: "Siswa" | "Guru" | string;
  name: string;
  grade?: string;
  subject?: string;
  className?: string;
  phone?: string | null;
  parentName?: string | null;
  nis?: string | null;
  nisn?: string | null;
  gender?: "L" | "P" | null;
  status?: string | null;
  alamat?: string | null;
  agama?: string | null;
  waliMurid?: string | null;
  teleponWali?: string | null;
  hubunganWali?: string | null;
  pekerjaanWali?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  nip?: string | null;
  pendidikanTerakhir?: string | null;
  jurusan?: string | null;
  gelar?: string | null;
  statusKepegawaian?: string | null;
  createdAt?: string | null;
};

const AGAMA_OPTIONS = ["Kristen", "Katolik", "Islam", "Hindu", "Buddha", "Konghucu"];
const HUBUNGAN_OPTIONS = ["Ayah", "Ibu", "Kakek", "Nenek", "Paman", "Bibi", "Wali"];
const PENDIDIKAN_OPTIONS = [
  "D3",
  "D4",
  "S1",
  "S2",
  "S3",
  "Profesi Akta IV / PPG",
  "SMA / SMK Sederajat",
];

export function PortalProfileView({ role }: { role: "Siswa" | "Guru" }) {
  const isTeacher = role === "Guru";
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Edit form state
  const [form, setForm] = useState({
    phone: "",
    alamat: "",
    agama: "",
    waliMurid: "",
    teleponWali: "",
    hubunganWali: "",
    pekerjaanWali: "",
    tempatLahir: "",
    tanggalLahir: "",
    pendidikanTerakhir: "",
    jurusan: "",
    gelar: "",
  });

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Gagal memuat profil akun.");
      const data = (await res.json()) as ProfileData;
      setProfile(data);
      setForm({
        phone: data.phone || "",
        alamat: data.alamat || "",
        agama: data.agama || "Kristen",
        waliMurid: data.waliMurid || data.parentName || "",
        teleponWali: data.teleponWali || data.phone || "",
        hubunganWali: data.hubunganWali || "",
        pekerjaanWali: data.pekerjaanWali || "",
        tempatLahir: data.tempatLahir || "",
        tanggalLahir: data.tanggalLahir ? data.tanggalLahir.slice(0, 10) : "",
        pendidikanTerakhir: data.pendidikanTerakhir || "S1",
        jurusan: data.jurusan || "",
        gelar: data.gelar || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Gagal memperbarui profil.");
      }

      setMessage("Profil berhasil diperbarui.");
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Memuat profil akun...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "20px", color: "#dc2626" }}>
        {error || "Profil tidak dapat ditemukan. Silakan login kembali."}
      </div>
    );
  }

  const initials =
    (profile.name || role)
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || (isTeacher ? "GU" : "SI");

  const displayName = isTeacher
    ? `${profile.name}${profile.gelar ? `, ${profile.gelar}` : ""}`
    : profile.name;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {message && (
        <div
          style={{
            padding: "12px 18px",
            background: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: "8px",
            color: "#166534",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          ✓ {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 18px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* HEADER KARTU PROFIL */}
      <div
        style={{
          background: isTeacher
            ? "linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)"
            : "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)",
          borderRadius: "16px",
          padding: "30px 32px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: isTeacher
            ? "0 10px 25px -5px rgba(5, 150, 105, 0.25)"
            : "0 10px 25px -5px rgba(37, 99, 235, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "grid",
              placeItems: "center",
              fontSize: "26px",
              fontWeight: 800,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>{displayName}</h1>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(255, 255, 255, 0.25)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                {isTeacher
                  ? profile.statusKepegawaian || "GURU TETAP YAYASAN"
                  : "SISWA MARANATHA"}
              </span>
            </div>
            <p style={{ margin: "6px 0 0", opacity: 0.9, fontSize: "14px" }}>
              {isTeacher
                ? `Mata Pelajaran: ${profile.subject || "Semua Mata Pelajaran"} · SD - SMP Kristen Maranatha`
                : `${profile.grade || profile.className || "Kelas 8"} · SD - SMP Kristen Maranatha Klaten`}
            </p>
            <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: "13px" }}>
              Email Akun: <b>{profile.email}</b>
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: isEditing ? "#ffffff" : "rgba(255, 255, 255, 0.25)",
              color: isEditing ? "#0f172a" : "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backdropFilter: "blur(4px)",
              transition: "all 0.2s ease",
            }}
          >
            <span>{isEditing ? "✕ Batal Edit" : "✏️ Edit Profil"}</span>
          </button>
        </div>
      </div>

      {/* FORM EDIT / TAMPILAN PROFIL */}
      {isEditing ? (
        <form
          onSubmit={(e) => void handleSave(e)}
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "26px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
              Perbarui Informasi Profil
            </h2>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {isTeacher ? "Data domisili, pendidikan & kontak guru" : "Data akun dan identitas resmi siswa"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            {/* Field Bersama: No Telepon */}
            <label className={styles.formLabel}>
              <span>{isTeacher ? "No. Telepon / WhatsApp Guru *" : "Telepon / WhatsApp Siswa"}</span>
              <input
                className={styles.formInput}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Contoh: 081234567890"
                required={isTeacher}
              />
            </label>

            {/* Field Guru: Gelar & Pendidikan */}
            {isTeacher && (
              <>
                <label className={styles.formLabel}>
                  <span>Gelar Akademik</span>
                  <input
                    className={styles.formInput}
                    value={form.gelar}
                    onChange={(e) => setForm({ ...form, gelar: e.target.value })}
                    placeholder="Contoh: S.Pd., M.Pd."
                  />
                </label>

                <label className={styles.formLabel}>
                  <span>Pendidikan Terakhir</span>
                  <select
                    className={styles.formInput}
                    value={form.pendidikanTerakhir}
                    onChange={(e) => setForm({ ...form, pendidikanTerakhir: e.target.value })}
                  >
                    {PENDIDIKAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.formLabel}>
                  <span>Program Studi / Jurusan</span>
                  <input
                    className={styles.formInput}
                    value={form.jurusan}
                    onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                    placeholder="Contoh: Pendidikan Bahasa Inggris"
                  />
                </label>
              </>
            )}

            {/* Data Pribadi (Tempat & Tanggal Lahir, Agama) */}
            <label className={styles.formLabel}>
              <span>Tempat Lahir</span>
              <input
                className={styles.formInput}
                value={form.tempatLahir}
                onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
                placeholder="Contoh: Klaten"
              />
            </label>

            <label className={styles.formLabel}>
              <span>Tanggal Lahir</span>
              <input
                type="date"
                className={styles.formInput}
                value={form.tanggalLahir}
                onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
              />
            </label>

            <label className={styles.formLabel}>
              <span>Agama</span>
              <select
                className={styles.formInput}
                value={form.agama}
                onChange={(e) => setForm({ ...form, agama: e.target.value })}
              >
                {AGAMA_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>

            {/* Khusus Siswa: Wali Murid */}
            {!isTeacher && (
              <>
                <label className={styles.formLabel}>
                  <span>Nama Wali Murid</span>
                  <input
                    className={styles.formInput}
                    value={form.waliMurid}
                    onChange={(e) => setForm({ ...form, waliMurid: e.target.value })}
                    placeholder="Nama orang tua / wali"
                  />
                </label>

                <label className={styles.formLabel}>
                  <span>Hubungan dengan Siswa</span>
                  <select
                    className={styles.formInput}
                    value={form.hubunganWali}
                    onChange={(e) => setForm({ ...form, hubunganWali: e.target.value })}
                  >
                    <option value="">— Pilih Hubungan —</option>
                    {HUBUNGAN_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.formLabel}>
                  <span>Telepon / WhatsApp Wali</span>
                  <input
                    className={styles.formInput}
                    value={form.teleponWali}
                    onChange={(e) => setForm({ ...form, teleponWali: e.target.value })}
                    placeholder="Contoh: 081234567890"
                  />
                </label>

                <label className={styles.formLabel}>
                  <span>Pekerjaan Wali</span>
                  <input
                    className={styles.formInput}
                    value={form.pekerjaanWali}
                    onChange={(e) => setForm({ ...form, pekerjaanWali: e.target.value })}
                    placeholder="Contoh: Wiraswasta, Guru, Karyawan"
                  />
                </label>
              </>
            )}

            {/* Alamat Domisili */}
            <label className={styles.formLabel} style={{ gridColumn: "1 / -1" }}>
              <span>Alamat Domisili Lengkap Tempat Tinggal</span>
              <textarea
                className={styles.formInput}
                rows={3}
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                placeholder="Alamat domisili lengkap saat ini"
                style={{ resize: "vertical" }}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "8px 24px",
                borderRadius: "6px",
                border: "none",
                background: isTeacher ? "#059669" : "#2563eb",
                color: "#ffffff",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      ) : (
        /* DETAIL DATA PROFIL LENGKAP */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {/* KOTAK 1: DATA AKADEMIK / DATA PENDIDIK */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: 800,
                color: "#475569",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {isTeacher ? "📋 Data Tenaga Pendidik & Kualifikasi" : "📋 Data Akademik Siswa"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              {[
                ["Nama Lengkap", displayName],
                !isTeacher ? ["NIS", profile.nis || "—"] : ["NIP", profile.nip || "—"],
                !isTeacher ? ["NISN", profile.nisn || "—"] : null,
                !isTeacher
                  ? ["Kelas / Rombel", profile.grade || profile.className || "Kelas 8"]
                  : ["Mata Pelajaran", profile.subject || "Semua Mata Pelajaran"],
                isTeacher
                  ? [
                      "Pendidikan Terakhir",
                      `${profile.pendidikanTerakhir || "S1"}${profile.jurusan ? ` (${profile.jurusan})` : ""}`,
                    ]
                  : null,
                isTeacher
                  ? ["Status Kepegawaian", profile.statusKepegawaian || "Guru Tetap Yayasan (GTY)"]
                  : null,
                [
                  "Jenis Kelamin",
                  profile.gender === "L"
                    ? "Laki-laki"
                    : profile.gender === "P"
                      ? "Perempuan"
                      : "—",
                ],
                ["Agama", profile.agama || "—"],
                [
                  "Tempat, Tgl Lahir",
                  profile.tempatLahir || profile.tanggalLahir
                    ? `${profile.tempatLahir || ""}${profile.tempatLahir && profile.tanggalLahir ? ", " : ""}${profile.tanggalLahir ? profile.tanggalLahir.slice(0, 10) : ""}`
                    : "—",
                ],
                ["Status", profile.status || "Aktif"],
              ]
                .filter((item): item is [string, string] => Boolean(item))
                .map(([label, val]) => (
                  <div
                    key={String(label)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #f8fafc",
                    }}
                  >
                    <span style={{ color: "#64748b" }}>{label}</span>
                    <b style={{ color: "#0f172a", textAlign: "right" }}>{val}</b>
                  </div>
                ))}
            </div>
          </div>

          {/* KOTAK 2: DATA WALI / KONTAK & ALAMAT DOMISILI */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: 800,
                color: "#475569",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {isTeacher ? "📞 Kontak & Alamat Domisili Guru" : "👨‍👩‍👧 Data Wali & Tempat Tinggal"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              {!isTeacher ? (
                <>
                  {[
                    ["Wali Murid", profile.waliMurid || profile.parentName || "—"],
                    ["Hubungan", profile.hubunganWali || "Orang Tua / Wali"],
                    ["Telepon Wali", profile.teleponWali || profile.phone || "—"],
                    ["Pekerjaan Wali", profile.pekerjaanWali || "—"],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>{label}</span>
                      <b style={{ color: "#0f172a", textAlign: "right" }}>{val}</b>
                    </div>
                  ))}

                  <div style={{ paddingTop: "8px" }}>
                    <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Alamat Domisili:</span>
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        color: "#1e293b",
                        lineHeight: 1.5,
                      }}
                    >
                      {profile.alamat || "Alamat belum dilengkapi. Klik 'Edit Profil' di atas untuk melengkapi."}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {[
                    ["Email Akun", profile.email],
                    ["Telepon / WA", profile.phone || "—"],
                    ["Unit Sekolah", "SD - SMP Kristen Maranatha Klaten"],
                    ["Hak Akses", "Tenaga Pendidik (Guru)"],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>{label}</span>
                      <b style={{ color: "#0f172a", textAlign: "right" }}>{val}</b>
                    </div>
                  ))}

                  <div style={{ paddingTop: "8px" }}>
                    <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Alamat Domisili Guru:</span>
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        color: "#1e293b",
                        lineHeight: 1.5,
                      }}
                    >
                      {profile.alamat || "Alamat domisili belum dilengkapi. Klik 'Edit Profil' di atas untuk melengkapi."}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KOTAK BANTUAN ADMINISTRATOR */}
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "12px",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <b style={{ color: "#166534", fontSize: "14px", display: "block" }}>
            🛡️ Butuh Bantuan atau Perubahan Data Resmi?
          </b>
          <p style={{ margin: "4px 0 0", color: "#15803d", fontSize: "13px" }}>
            Untuk penyesuaian data jadwal mengajar, NIP, atau sinkronisasi akun pendidik, silakan hubungi staf tata usaha sekolah.
          </p>
        </div>
        <div style={{ fontSize: "13px", color: "#166534", fontWeight: 700 }}>
          📞 0813-2503-1459 (Tugiya) · ✉️ sdmaranatha@gmail.com
        </div>
      </div>
    </div>
  );
}
