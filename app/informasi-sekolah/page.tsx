"use client";

import { useState } from "react";
import { SchoolShell } from "@/components/school-shell";
import styles from "../page.module.css";

export default function AdminInformasiSekolahPage() {
  const [namaSekolah, setNamaSekolah] = useState("SD – SMP Kristen Maranatha Klaten");
  const [akreditasi, setAkreditasi] = useState("A (Unggul)");
  const [alamat, setAlamat] = useState("Jl. Mayor Kusmanto, Klaten, Jawa Tengah");
  const [telepon, setTelepon] = useState("+62 813-2503-1459 - Tugiya");
  const [whatsapp, setWhatsapp] = useState("+62 813-2503-1459 - Tugiya");
  const [email, setEmail] = useState("sdmaranatha@gmail.com");
  const [jamOperasional, setJamOperasional] = useState("Senin – Jumat, 07.00 – 13.00 WIB");
  const [jamLayananTU, setJamLayananTU] = useState("Senin – Jumat, 08.00 – 13.00 WIB");
  const [kepalaSekolahSD, setKepalaSekolahSD] = useState("Drs. Markus Sumardiyono");
  const [kepalaSekolahSMP, setKepalaSekolahSMP] = useState("Drs. Tugiya, S.Pd, M.Si");

  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("Perubahan informasi sekolah berhasil disimpan!");
    setTimeout(() => {
      setSavedMessage("");
    }, 4000);
  };

  return (
    <SchoolShell
      title="Informasi & Profil Sekolah"
      subtitle="Kelola profil institusi, visi misi, kontak resmi, dan layanan tata usaha SD - SMP Kristen Maranatha Klaten"
      activeItem="Informasi Sekolah"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* NOTIFIKASI BERHASIL DISIMPAN */}
        {savedMessage && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              background: "#ecfdf5",
              color: "#059669",
              border: "1px solid #a7f3d0",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>✓</span>
            <span>{savedMessage}</span>
          </div>
        )}

        {/* SECTION 1: KARTU VISI & MISI SEKOLAH RESMI */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>🎯 Visi &amp; Misi Sekolah SD – SMP Kristen Maranatha</h3>
              <p>Pedoman resmi nilai dan arah pendidikan institusi</p>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                background: "#eff6ff",
                color: "#2563eb",
                padding: "4px 10px",
                borderRadius: "12px",
              }}
            >
              Terstandarisasi Dashboard &amp; Portal
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {/* Visi */}
            <div
              style={{
                background: "#f0fdf4",
                borderRadius: "10px",
                padding: "20px",
                border: "1px solid #bbf7d0",
              }}
            >
              <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800, color: "#166534" }}>
                🌟 Visi Sekolah
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#15803d", lineHeight: 1.6, fontWeight: 600 }}>
                &ldquo;Berkarakter Seperti Yesus Kristus, Berprestasi dalam Ilmu Pengetahuan dan Teknologi Serta Mandiri&rdquo;
              </p>
            </div>

            {/* Misi */}
            <div
              style={{
                background: "#eff6ff",
                borderRadius: "10px",
                padding: "20px",
                border: "1px solid #bfdbfe",
              }}
            >
              <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800, color: "#1e40af" }}>
                🎯 Misi Sekolah
              </h4>
              <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#1e40af", lineHeight: 1.8 }}>
                <li>Mewujudkan Pendidikan Advent, yang Beriman dan suka Melayani.</li>
                <li>Mengembangkan Kemampuan Peserta Didik Agar Terampil dalam Ilmu Pengetahuan dan Teknologi.</li>
                <li>Memotivasi Peserta Didik Agar Kreatif, Berprestasi dan Mandiri.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* SECTION 2: FORM PENGELOLAAN PROFIL & KONTAK SEKOLAH */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h3>🏫 Formulir Pengelolaan Profil &amp; Kontak Sekolah</h3>
              <p>Perbarui informasi identitas resmi, alamat, telepon, dan jam operasional tata usaha</p>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Nama Institusi Sekolah
                </label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Status Akreditasi
                </label>
                <input
                  type="text"
                  value={akreditasi}
                  onChange={(e) => setAkreditasi(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Kepala Sekolah SD Maranatha
                </label>
                <input
                  type="text"
                  value={kepalaSekolahSD}
                  onChange={(e) => setKepalaSekolahSD(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Kepala Sekolah SMP Maranatha
                </label>
                <input
                  type="text"
                  value={kepalaSekolahSMP}
                  onChange={(e) => setKepalaSekolahSMP(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Telepon Kantor Tata Usaha
                </label>
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Nomor WhatsApp Layanan Sekolah
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Jam Operasional Sekolah
                </label>
                <input
                  type="text"
                  value={jamOperasional}
                  onChange={(e) => setJamOperasional(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Jam Layanan Administrasi / Tata Usaha
                </label>
                <input
                  type="text"
                  value={jamLayananTU}
                  onChange={(e) => setJamLayananTU(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Alamat Lengkap Sekolah
                </label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
                }}
              >
                <span>💾</span>
                <span>Simpan Perubahan Informasi Sekolah</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolShell>
  );
}

