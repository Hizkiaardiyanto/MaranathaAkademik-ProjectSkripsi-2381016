"use client";

import { useEffect, useState, useMemo } from "react";
import type { Student, StudentPayment } from "../lib/db";
import styles from "../app/page.module.css";

type PaymentSummary = {
  totalPenerimaan: number;
  totalTunggakan: number;
  countLunas: number;
  countBelumLunas: number;
  totalTransaksi: number;
};

const JENIS_TAGIHAN_OPTIONS = [
  "SPP Bulanan",
  "Uang Pangkal / Sarpras",
  "Uang Kegiatan & PGM",
  "Uang Ujian & Asesmen",
  "Seragam & Buku Pelajaran",
  "Lainnya",
];

const BULAN_OPTIONS = [
  "Semua",
  "Juli 2026",
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
  "Januari 2027",
  "Februari 2027",
  "Maret 2027",
  "April 2027",
  "Mei 2027",
  "Juni 2027",
];

const KELAS_OPTIONS = ["Semua", "Kelas 6", "Kelas 7", "Kelas 8", "Kelas 9"];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function PaymentManager() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalPenerimaan: 0,
    totalTunggakan: 0,
    countLunas: 0,
    countBelumLunas: 0,
    totalTransaksi: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"single" | "bulk">("single");
  const [receiptPayment, setReceiptPayment] = useState<StudentPayment | null>(null);
  const [editingPayment, setEditingPayment] = useState<StudentPayment | null>(null);

  // Form State Single Payment
  const [formStudentId, setFormStudentId] = useState("");
  const [formNamaSiswa, setFormNamaSiswa] = useState("");
  const [formNis, setFormNis] = useState("");
  const [formKelas, setFormKelas] = useState("Kelas 8");
  const [formJenisPembayaran, setFormJenisPembayaran] = useState("SPP Bulanan");
  const [formBulan, setFormBulan] = useState("November 2026");
  const [formTahunAjaran, setFormTahunAjaran] = useState("2026/2027");
  const [formNominal, setFormNominal] = useState("300000");
  const [formStatus, setFormStatus] = useState<"Lunas" | "Belum Lunas">("Lunas");
  const [formTanggalBayar, setFormTanggalBayar] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [formMetodePembayaran, setFormMetodePembayaran] = useState("Tunai (Kasir TU)");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State Bulk Generator
  const [bulkBulan, setBulkBulan] = useState("Desember 2026");
  const [bulkTahunAjaran, setBulkTahunAjaran] = useState("2026/2027");
  const [bulkNominalSD, setBulkNominalSD] = useState("250000");
  const [bulkNominalSMP, setBulkNominalSMP] = useState("300000");
  const [generatingBulk, setGeneratingBulk] = useState(false);

  // Load Initial Data
  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [payRes, stuRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/students"),
      ]);

      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData.payments || []);
        if (payData.summary) setSummary(payData.summary);
      } else {
        setError("Gagal memuat data pembayaran.");
      }

      if (stuRes.ok) {
        const stuData = await stuRes.json();
        setStudents(stuData || []);
      }
    } catch {
      setError("Koneksi gagal saat memuat data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      if (filterKelas !== "Semua" && item.kelas !== filterKelas) return false;
      if (filterStatus !== "Semua" && item.status !== filterStatus) return false;
      if (filterJenis !== "Semua" && item.jenisPembayaran !== filterJenis) return false;
      if (filterBulan !== "Semua" && item.bulan !== filterBulan) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.namaSiswa.toLowerCase().includes(q);
        const matchNis = item.nis.toLowerCase().includes(q);
        const matchKwitansi = item.nomorKwitansi?.toLowerCase().includes(q);
        if (!matchName && !matchNis && !matchKwitansi) return false;
      }
      return true;
    });
  }, [payments, filterKelas, filterStatus, filterJenis, filterBulan, searchQuery]);

  // Handle Student Selection in Single Form
  function handleSelectStudent(studentId: string) {
    setFormStudentId(studentId);
    const selected = students.find((s) => s.id === studentId);
    if (selected) {
      setFormNamaSiswa(selected.name);
      setFormNis(selected.nis);
      setFormKelas(selected.className);
      const isSMP =
        selected.className.includes("7") ||
        selected.className.includes("8") ||
        selected.className.includes("9");
      if (formJenisPembayaran === "SPP Bulanan") {
        setFormNominal(isSMP ? "300000" : "250000");
      }
    }
  }

  // Toggle Quick Status (Lunas <-> Belum Lunas)
  async function toggleStatus(payment: StudentPayment) {
    const nextStatus = payment.status === "Lunas" ? "Belum Lunas" : "Lunas";
    const confirmMsg =
      nextStatus === "Lunas"
        ? `Tandai tagihan ${payment.namaSiswa} (${payment.bulan}) sebagai LUNAS?`
        : `Batalkan status Lunas untuk tagihan ${payment.namaSiswa} (${payment.bulan})?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          metodePembayaran: nextStatus === "Lunas" ? "Tunai (Kasir TU)" : undefined,
          tanggalBayar: nextStatus === "Lunas" ? new Date().toISOString().slice(0, 10) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal memperbarui status.");
        return;
      }

      setSuccess(`Status pembayaran ${payment.namaSiswa} berhasil diubah menjadi ${nextStatus}.`);
      setTimeout(() => setSuccess(""), 4000);
      await loadData();
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  }

  // Delete Payment Record
  async function handleDelete(payment: StudentPayment) {
    if (!window.confirm(`Hapus catatan tagihan ${payment.namaSiswa} (${payment.jenisPembayaran} - ${payment.bulan})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/payments/${payment.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal menghapus data.");
        return;
      }
      setSuccess("Catatan pembayaran berhasil dihapus.");
      setTimeout(() => setSuccess(""), 4000);
      await loadData();
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  }

  // Submit Single Payment
  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        studentId: formStudentId || undefined,
        namaSiswa: formNamaSiswa,
        nis: formNis,
        kelas: formKelas,
        jenisPembayaran: formJenisPembayaran,
        bulan: formBulan,
        tahunAjaran: formTahunAjaran,
        nominal: Number(formNominal),
        status: formStatus,
        tanggalBayar: formStatus === "Lunas" ? formTanggalBayar : undefined,
        metodePembayaran: formStatus === "Lunas" ? formMetodePembayaran : undefined,
        keterangan: formKeterangan,
        petugas: "Admin TU",
      };

      const url = editingPayment ? `/api/payments/${editingPayment.id}` : "/api/payments";
      const method = editingPayment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan data pembayaran.");
        setSubmitting(false);
        return;
      }

      setSuccess(
        editingPayment
          ? "Data pembayaran berhasil diperbarui."
          : "Data pembayaran baru berhasil dicatat.",
      );
      setTimeout(() => setSuccess(""), 4000);
      setShowAddForm(false);
      setEditingPayment(null);
      resetSingleForm();
      await loadData();
    } catch {
      setError("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  }

  // Submit Bulk Generator
  async function handleBulkGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGeneratingBulk(true);
    setError("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-bulk",
          bulan: bulkBulan,
          tahunAjaran: bulkTahunAjaran,
          nominalSD: Number(bulkNominalSD),
          nominalSMP: Number(bulkNominalSMP),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat tagihan SPP massal.");
        setGeneratingBulk(false);
        return;
      }

      setSuccess(data.message || "Tagihan SPP massal berhasil dibuat!");
      setTimeout(() => setSuccess(""), 5000);
      setShowAddForm(false);
      await loadData();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setGeneratingBulk(false);
    }
  }

  function resetSingleForm() {
    setFormStudentId("");
    setFormNamaSiswa("");
    setFormNis("");
    setFormKelas("Kelas 8");
    setFormJenisPembayaran("SPP Bulanan");
    setFormBulan("November 2026");
    setFormNominal("300000");
    setFormStatus("Lunas");
    setFormTanggalBayar(new Date().toISOString().slice(0, 10));
    setFormMetodePembayaran("Tunai (Kasir TU)");
    setFormKeterangan("");
  }

  function startEdit(payment: StudentPayment) {
    setEditingPayment(payment);
    setFormStudentId(payment.studentId || "");
    setFormNamaSiswa(payment.namaSiswa);
    setFormNis(payment.nis);
    setFormKelas(payment.kelas);
    setFormJenisPembayaran(payment.jenisPembayaran);
    setFormBulan(payment.bulan);
    setFormTahunAjaran(payment.tahunAjaran);
    setFormNominal(String(payment.nominal));
    setFormStatus(payment.status);
    setFormTanggalBayar(payment.tanggalBayar || new Date().toISOString().slice(0, 10));
    setFormMetodePembayaran(payment.metodePembayaran || "Tunai (Kasir TU)");
    setFormKeterangan(payment.keterangan || "");
    setActiveFormTab("single");
    setShowAddForm(true);
    window.scrollTo({ top: 180, behavior: "smooth" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. STATISTIK KEUANGAN & ADMINISTRASI SEKOLAH */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Card 1: Total Penerimaan */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
              Total Kas Diterima
            </span>
            <span style={{ fontSize: "20px", background: "#dcfce7", padding: "6px", borderRadius: "8px" }}>
              💰
            </span>
          </div>
          <strong style={{ fontSize: "22px", color: "#15803d", fontWeight: 800 }}>
            {formatRupiah(summary.totalPenerimaan)}
          </strong>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Dari <b>{summary.countLunas}</b> tagihan berstatus lunas
          </small>
        </div>

        {/* Card 2: Tunggakan Belum Bayar */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>
              Total Tunggakan Aktif
            </span>
            <span style={{ fontSize: "20px", background: "#fee2e2", padding: "6px", borderRadius: "8px" }}>
              ⏳
            </span>
          </div>
          <strong style={{ fontSize: "22px", color: "#b91c1c", fontWeight: 800 }}>
            {formatRupiah(summary.totalTunggakan)}
          </strong>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Menunggu <b>{summary.countBelumLunas}</b> pembayaran siswa
          </small>
        </div>

        {/* Card 3: Persentase Kelunasan */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase" }}>
              Tingkat Kelunasan
            </span>
            <span style={{ fontSize: "20px", background: "#dbeafe", padding: "6px", borderRadius: "8px" }}>
              📈
            </span>
          </div>
          <strong style={{ fontSize: "22px", color: "#1d4ed8", fontWeight: 800 }}>
            {summary.totalTransaksi > 0
              ? `${Math.round((summary.countLunas / summary.totalTransaksi) * 100)}%`
              : "0%"}
          </strong>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            <b>{summary.countLunas}</b> dari <b>{summary.totalTransaksi}</b> total tagihan
          </small>
        </div>

        {/* Card 4: Siswa Terdaftar */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
              Siswa Terdata
            </span>
            <span style={{ fontSize: "20px", background: "#f1f5f9", padding: "6px", borderRadius: "8px" }}>
              👥
            </span>
          </div>
          <strong style={{ fontSize: "22px", color: "#0f172a", fontWeight: 800 }}>
            {students.length} Siswa
          </strong>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Jenjang SD & SMP Maranatha
          </small>
        </div>
      </div>

      {/* 2. NOTIFIKASI SUCCESS / ERROR */}
      {success && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "14px 18px",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: "14px 18px",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* 3. TOMBOL AKSI UTAMA */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
            Kelola Administrasi & SPP Siswa
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Pencatatan pembayaran SPP bulanan, uang gedung, seragam, kegiatan, dan cetak bukti kwitansi resmi.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              padding: "9px 18px",
              background: showAddForm ? "#64748b" : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
              transition: "background 0.2s",
            }}
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) {
                setEditingPayment(null);
                resetSingleForm();
              }
            }}
          >
            <span>{showAddForm ? "✕ Tutup Formulir" : "+ Buat / Catat Tagihan"}</span>
          </button>
        </div>
      </div>

      {/* 4. FORMULIR INPUT TAGIHAN & PEMBAYARAN */}
      {showAddForm && (
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <div>
              <h3>
                {editingPayment
                  ? `Edit Data Tagihan: ${editingPayment.namaSiswa}`
                  : activeFormTab === "single"
                    ? "Formulir Tagihan / Pembayaran Perorangan"
                    : "Generate Tagihan SPP Massal per Bulan"}
              </h3>
              <p>
                {activeFormTab === "single"
                  ? "Pilih siswa atau masukkan rincian pembayaran untuk mencatat status lunas / belum lunas."
                  : "Buat tagihan SPP bulanan otomatis untuk seluruh siswa terdaftar sekaligus dengan satu klik."}
              </p>
            </div>
            {!editingPayment && (
              <div className={styles.formTabNav}>
                <button
                  type="button"
                  className={`${styles.formTabBtn} ${activeFormTab === "single" ? styles.formTabBtnActive : ""}`}
                  onClick={() => setActiveFormTab("single")}
                >
                  📋 Tagihan Satuan
                </button>
                <button
                  type="button"
                  className={`${styles.formTabBtn} ${activeFormTab === "bulk" ? styles.formTabBtnActive : ""}`}
                  onClick={() => setActiveFormTab("bulk")}
                >
                  ⚡ Generate SPP Massal
                </button>
              </div>
            )}
          </div>

          {activeFormTab === "single" ? (
            <form onSubmit={handleSingleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className={styles.formGrid3}>
                <div className={styles.formControl}>
                  <label className={styles.formLabel}>Pilih Siswa Terdaftar</label>
                  <select
                    className={styles.formInput}
                    value={formStudentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                  >
                    <option value="">-- Pilih dari database siswa (Opsional) --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nis} · {s.className})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    Nama Siswa <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formNamaSiswa}
                    onChange={(e) => setFormNamaSiswa(e.target.value)}
                    placeholder="Nama lengkap siswa"
                    required
                  />
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    NIS Siswa <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="Nomor Induk Siswa"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid3}>
                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    Kelas <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className={styles.formInput}
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    required
                  >
                    <option value="Kelas 6">Kelas 6 (SD)</option>
                    <option value="Kelas 7">Kelas 7 (SMP)</option>
                    <option value="Kelas 8">Kelas 8 (SMP)</option>
                    <option value="Kelas 9">Kelas 9 (SMP)</option>
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    Jenis Pembayaran <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className={styles.formInput}
                    value={formJenisPembayaran}
                    onChange={(e) => setFormJenisPembayaran(e.target.value)}
                    required
                  >
                    {JENIS_TAGIHAN_OPTIONS.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    Periode / Bulan <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formBulan}
                    onChange={(e) => setFormBulan(e.target.value)}
                    placeholder="Contoh: November 2026 atau Semester 1"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid3}>
                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    Nominal Tagihan (Rp) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={formNominal}
                    onChange={(e) => setFormNominal(e.target.value)}
                    placeholder="Contoh: 300000"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    Status Pembayaran <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className={styles.formInput}
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Lunas" | "Belum Lunas")}
                    required
                  >
                    <option value="Lunas">✅ Lunas</option>
                    <option value="Belum Lunas">⏳ Belum Lunas (Tagihan)</option>
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>Tahun Ajaran</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formTahunAjaran}
                    onChange={(e) => setFormTahunAjaran(e.target.value)}
                    placeholder="2026/2027"
                  />
                </div>
              </div>

              {formStatus === "Lunas" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    background: "#f0fdf4",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div className={styles.formControl}>
                    <label className={styles.formLabel} style={{ color: "#166534" }}>
                      Tanggal Pembayaran
                    </label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={formTanggalBayar}
                      onChange={(e) => setFormTanggalBayar(e.target.value)}
                      required={formStatus === "Lunas"}
                    />
                  </div>

                  <div className={styles.formControl}>
                    <label className={styles.formLabel} style={{ color: "#166534" }}>
                      Metode Pembayaran
                    </label>
                    <select
                      className={styles.formInput}
                      value={formMetodePembayaran}
                      onChange={(e) => setFormMetodePembayaran(e.target.value)}
                    >
                      <option value="Tunai (Kasir TU)">Tunai (Kasir TU)</option>
                      <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="Virtual Account">Virtual Account</option>
                    </select>
                  </div>
                </div>
              )}

              <div className={styles.formControl}>
                <label className={styles.formLabel}>Catatan / Keterangan</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Keterangan tambahan (misal: Diserahkan langsung oleh orang tua siswa)"
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPayment(null);
                    resetSingleForm();
                  }}
                >
                  Batal
                </button>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting
                    ? "Menyimpan..."
                    : editingPayment
                      ? "Perbarui Pembayaran"
                      : "Simpan Pembayaran"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBulkGenerate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "#eff6ff",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  border: "1px solid #bfdbfe",
                  fontSize: "13px",
                  color: "#1e40af",
                }}
              >
                💡 <b>Petunjuk:</b> Fitur ini akan otomatis memeriksa database siswa dan menghasilkan tagihan
                SPP bulanan dengan status <b>Belum Lunas</b> untuk setiap siswa yang belum memiliki tagihan pada
                bulan yang dipilih.
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formControl}>
                  <label className={styles.formLabel}>
                    Bulan Tagihan SPP <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className={styles.formInput}
                    value={bulkBulan}
                    onChange={(e) => setBulkBulan(e.target.value)}
                    required
                  >
                    {BULAN_OPTIONS.filter((b) => b !== "Semua").map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>Tahun Ajaran</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={bulkTahunAjaran}
                    onChange={(e) => setBulkTahunAjaran(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formControl}>
                  <label className={styles.formLabel}>Tarif SPP SD (Rp)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={bulkNominalSD}
                    onChange={(e) => setBulkNominalSD(e.target.value)}
                    step="1000"
                    required
                  />
                </div>

                <div className={styles.formControl}>
                  <label className={styles.formLabel}>Tarif SPP SMP (Rp)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={bulkNominalSMP}
                    onChange={(e) => setBulkNominalSMP(e.target.value)}
                    step="1000"
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={() => setShowAddForm(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  style={{ background: "#0284c7" }}
                  disabled={generatingBulk}
                >
                  {generatingBulk ? "Sedang Memproses Massal..." : "⚡ Mulai Generate Tagihan Massal"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 5. FILTER & PENCARIAN DATA */}
      <div
        style={{
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Search Input */}
          <div style={{ flex: "1 1 240px", minWidth: "220px" }}>
            <input
              type="text"
              placeholder="🔍 Cari nama siswa, NIS, atau no. kwitansi..."
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Kelas */}
          <div style={{ flex: "0 1 140px" }}>
            <select
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#ffffff",
              }}
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
            >
              <option value="Semua">Semua Kelas</option>
              {KELAS_OPTIONS.filter((k) => k !== "Semua").map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div style={{ flex: "0 1 140px" }}>
            <select
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#ffffff",
              }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Lunas">✅ Lunas</option>
              <option value="Belum Lunas">⏳ Belum Lunas</option>
            </select>
          </div>

          {/* Filter Bulan */}
          <div style={{ flex: "0 1 150px" }}>
            <select
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#ffffff",
              }}
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option value="Semua">Semua Periode</option>
              {BULAN_OPTIONS.filter((b) => b !== "Semua").map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jenis */}
          <div style={{ flex: "0 1 170px" }}>
            <select
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#ffffff",
              }}
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Semua Jenis Tagihan</option>
              {JENIS_TAGIHAN_OPTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {(filterKelas !== "Semua" ||
            filterStatus !== "Semua" ||
            filterBulan !== "Semua" ||
            filterJenis !== "Semua" ||
            searchQuery.trim()) && (
            <button
              type="button"
              style={{
                padding: "8px 14px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
              onClick={() => {
                setFilterKelas("Semua");
                setFilterStatus("Semua");
                setFilterBulan("Semua");
                setFilterJenis("Semua");
                setSearchQuery("");
              }}
            >
              ✕ Reset Filter
            </button>
          )}
        </div>

        <div style={{ fontSize: "12px", color: "#64748b" }}>
          Menampilkan <b>{filteredPayments.length}</b> dari total {payments.length} transaksi pembayaran
        </div>
      </div>

      {/* 6. TABEL DATA PEMBAYARAN */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>No. Kwitansi</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>Siswa & NIS</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>Kelas</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>Jenis Tagihan</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>Periode</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>Nominal</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700 }}>Tgl Bayar & Metode</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 700, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                    Memuat data administrasi dan SPP...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
                    <b>Tidak ada data pembayaran yang sesuai</b>
                    <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                      Silakan sesuaikan filter atau tambahkan tagihan baru di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isLunas = p.status === "Lunas";

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* No Kwitansi */}
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                        {p.nomorKwitansi ? (
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#0369a1",
                              background: "#e0f2fe",
                              padding: "3px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {p.nomorKwitansi}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>— Belum Ada —</span>
                        )}
                      </td>

                      {/* Siswa & NIS */}
                      <td style={{ padding: "14px 16px" }}>
                        <strong style={{ display: "block", color: "#0f172a" }}>{p.namaSiswa}</strong>
                        <small style={{ color: "#64748b" }}>NIS: {p.nis}</small>
                      </td>

                      {/* Kelas */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "12px",
                            color: "#334155",
                          }}
                        >
                          {p.kelas}
                        </span>
                      </td>

                      {/* Jenis Tagihan */}
                      <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: 600 }}>
                        {p.jenisPembayaran}
                      </td>

                      {/* Bulan */}
                      <td style={{ padding: "14px 16px", color: "#475569" }}>{p.bulan}</td>

                      {/* Nominal */}
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>
                        {formatRupiah(p.nominal)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        {isLunas ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            ✓ LUNAS
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#fee2e2",
                              color: "#991b1b",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            ⏳ BELUM LUNAS
                          </span>
                        )}
                      </td>

                      {/* Tgl Bayar & Metode */}
                      <td style={{ padding: "14px 16px", fontSize: "12px" }}>
                        {isLunas ? (
                          <>
                            <div style={{ color: "#0f172a", fontWeight: 600 }}>{p.tanggalBayar}</div>
                            <div style={{ color: "#64748b" }}>{p.metodePembayaran || "Kasir TU"}</div>
                          </>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>Menunggu Pembayaran</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          {/* Toggle Status Quick Button */}
                          <button
                            type="button"
                            title={isLunas ? "Batalkan Lunas" : "Tandai Lunas"}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "none",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              background: isLunas ? "#fef3c7" : "#dcfce7",
                              color: isLunas ? "#92400e" : "#166534",
                              transition: "all 0.15s",
                            }}
                            onClick={() => toggleStatus(p)}
                          >
                            {isLunas ? "↺ Batal" : "✓ Lunas"}
                          </button>

                          {/* Kwitansi Print Button */}
                          {isLunas && (
                            <button
                              type="button"
                              title="Lihat & Cetak Kwitansi Resmi"
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #bfdbfe",
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                              onClick={() => setReceiptPayment(p)}
                            >
                              📄 Kwitansi
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            title="Edit Data"
                            style={{
                              padding: "6px 9px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#475569",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                            onClick={() => startEdit(p)}
                          >
                            ✎
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            title="Hapus Data"
                            style={{
                              padding: "6px 9px",
                              borderRadius: "6px",
                              border: "1px solid #fecaca",
                              background: "#fff1f2",
                              color: "#e11d48",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleDelete(p)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. MODAL KWITANSI PEMBAYARAN RESMI */}
      {receiptPayment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setReceiptPayment(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Kwitansi */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                color: "#ffffff",
                padding: "24px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  BUKTI PEMBAYARAN RESMI
                </span>
                <h3 style={{ margin: "0 0 2px", fontSize: "20px", fontWeight: 800 }}>
                  SD – SMP MARANATHA
                </h3>
                <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
                  Jl. Maranatha No. 01, Semarang · Telp: +62 813-2503-1459
                </p>
              </div>
              <button
                type="button"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "18px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                onClick={() => setReceiptPayment(null)}
              >
                ✕
              </button>
            </div>

            {/* Isi Kwitansi */}
            <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px dashed #cbd5e1",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ color: "#64748b" }}>Nomor Kwitansi: </span>
                  <b style={{ color: "#0f172a", fontFamily: "monospace", fontSize: "14px" }}>
                    {receiptPayment.nomorKwitansi}
                  </b>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Tanggal: </span>
                  <b>{receiptPayment.tanggalBayar || new Date().toISOString().slice(0, 10)}</b>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#64748b", width: "35%" }}>Telah Terima Dari</td>
                    <td style={{ padding: "8px 0", color: "#0f172a", fontWeight: 700 }}>
                      : {receiptPayment.namaSiswa}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#64748b" }}>Nomor Induk Siswa (NIS)</td>
                    <td style={{ padding: "8px 0", color: "#0f172a" }}>: {receiptPayment.nis}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#64748b" }}>Kelas</td>
                    <td style={{ padding: "8px 0", color: "#0f172a" }}>: {receiptPayment.kelas}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#64748b" }}>Untuk Pembayaran</td>
                    <td style={{ padding: "8px 0", color: "#0f172a", fontWeight: 600 }}>
                      : {receiptPayment.jenisPembayaran} ({receiptPayment.bulan})
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#64748b" }}>Tahun Ajaran</td>
                    <td style={{ padding: "8px 0", color: "#0f172a" }}>: {receiptPayment.tahunAjaran}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#64748b" }}>Metode Pembayaran</td>
                    <td style={{ padding: "8px 0", color: "#0f172a" }}>
                      : {receiptPayment.metodePembayaran || "Tunai di Kasir TU"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Nominal Box */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "2px solid #86efac",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", color: "#166534", fontWeight: 700 }}>
                    JUMLAH DITERIMA:
                  </span>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#15803d" }}>
                    {formatRupiah(receiptPayment.nominal)}
                  </div>
                </div>
                <div
                  style={{
                    padding: "6px 14px",
                    background: "#dcfce7",
                    borderRadius: "20px",
                    fontWeight: 800,
                    color: "#166534",
                    fontSize: "12px",
                  }}
                >
                  ✓ LUNAS
                </div>
              </div>

              {receiptPayment.keterangan && (
                <div style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                  Catatan: {receiptPayment.keterangan}
                </div>
              )}

              {/* Tanda Tangan Kasir */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  paddingTop: "14px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: "12px",
                  color: "#475569",
                }}
              >
                <div>
                  <span>Penyetor / Wali Murid,</span>
                  <div style={{ height: "45px" }} />
                  <b>( .............................. )</b>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span>Semarang, {receiptPayment.tanggalBayar || "Hari ini"}</span>
                  <div style={{ height: "15px" }} />
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>[TERVERIFIKASI]</span>
                  <div style={{ height: "15px" }} />
                  <b>{receiptPayment.petugas || "Tata Usaha Maranatha"}</b>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                background: "#f8fafc",
                padding: "16px 28px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "9px 18px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setReceiptPayment(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                style={{
                  padding: "9px 20px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onClick={() => window.print()}
              >
                🖨 Cetak Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

