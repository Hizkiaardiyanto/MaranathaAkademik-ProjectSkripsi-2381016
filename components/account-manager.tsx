"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "@/app/page.module.css";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  downloadAccountTemplate,
  parseAccountExcel,
  type ParsedAccountRow,
} from "@/lib/excel-helper";

type Account = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "approved" | "inactive" | "pending" | "rejected";
  grade?: string;
  subject?: string;
  phone?: string;
  nis?: string;
  nisn?: string;
  studentId?: string;
  studentName?: string;
  isBuiltIn: boolean;
  createdAt: string;
};

type MasterStudent = {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  className: string;
  status: string;
};

type MasterTeacher = {
  id: string;
  name: string;
  nip: string;
  subject: string;
  phone: string;
  status: string;
};

export function AccountManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [students, setStudents] = useState<MasterStudent[]>([]);
  const [teachers, setTeachers] = useState<MasterTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  // Modal Tambah / Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("Siswa");
  const [formStatus, setFormStatus] = useState<"approved" | "inactive">("approved");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modal Reset Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetAccount, setResetTargetAccount] = useState<Account | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState("");

  // Modal Impor Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedRows, setImportedRows] = useState<ParsedAccountRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [importError, setImportError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [accRes, studRes, teachRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/students"),
        fetch("/api/teachers"),
      ]);

      if (!accRes.ok) throw new Error(await getApiErrorMessage(accRes, "Gagal memuat akun pengguna."));
      if (!studRes.ok) throw new Error(await getApiErrorMessage(studRes, "Gagal memuat data siswa."));
      if (!teachRes.ok) throw new Error(await getApiErrorMessage(teachRes, "Gagal memuat data guru."));

      const accData = await accRes.json();
      const studData = await studRes.json();
      const teachData = await teachRes.json();

      setAccounts(Array.isArray(accData.accounts) ? accData.accounts : []);
      setStudents(Array.isArray(studData) ? studData : []);
      setTeachers(Array.isArray(teachData) ? teachData : []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Koneksi database gagal.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        acc.name.toLowerCase().includes(term) ||
        acc.email.toLowerCase().includes(term) ||
        (acc.nis && acc.nis.toLowerCase().includes(term)) ||
        (acc.studentName && acc.studentName.toLowerCase().includes(term));

      const matchRole = roleFilter === "Semua" || acc.role === roleFilter;
      const matchStatus =
        statusFilter === "Semua" ||
        (statusFilter === "Aktif" && acc.status === "approved") ||
        (statusFilter === "Nonaktif" && acc.status === "inactive") ||
        (statusFilter === "Pending" && acc.status === "pending");

      return matchSearch && matchRole && matchStatus;
    });
  }, [accounts, searchTerm, roleFilter, statusFilter]);

  // Statistik
  const stats = useMemo(() => {
    const total = accounts.length;
    const siswaCount = accounts.filter((a) => a.role === "Siswa" && a.status === "approved").length;
    const guruCount = accounts.filter((a) => a.role === "Guru" && a.status === "approved").length;
    const nonaktifCount = accounts.filter((a) => a.status === "inactive" || a.status === "pending").length;
    return { total, siswaCount, guruCount, nonaktifCount };
  }, [accounts]);

  // Siswa yang belum memiliki akun
  const studentsWithoutAccount = useMemo(() => {
    const linkedIds = new Set(accounts.filter((a) => a.studentId).map((a) => a.studentId));
    return students.map((s) => ({
      ...s,
      hasAccount: linkedIds.has(s.id),
    }));
  }, [students, accounts]);

  // Handle pilih siswa di dropdown
  function handleStudentSelect(studentId: string) {
    setSelectedStudentId(studentId);
    if (!studentId) return;
    const s = students.find((item) => item.id === studentId);
    if (s) {
      setFormName(s.name);
      // Buat rekomendasi email otomatis jika belum ada email
      if (!formEmail || formEmail.includes("@")) {
        const cleanName = s.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        setFormEmail(`${cleanName}${s.nis ? s.nis.slice(-3) : ""}@gmail.com`);
      }
      if (!formPassword) {
        setFormPassword(s.nis || "123456");
      }
    }
  }

  // Handle pilih guru di dropdown
  function handleTeacherSelect(teacherId: string) {
    setSelectedTeacherId(teacherId);
    if (!teacherId) return;
    const t = teachers.find((item) => item.id === teacherId);
    if (t) {
      setFormName(t.name);
      if (!formEmail || formEmail.includes("@")) {
        const cleanName = t.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        setFormEmail(`${cleanName}@gmail.com`);
      }
      if (!formPassword) {
        setFormPassword(t.nip || "123456");
      }
    }
  }

  // Generate password acak
  function generateRandomPassword() {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  // Buka Modal Tambah Akun
  function openCreateModal() {
    setEditingAccount(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("123456");
    setFormRole("Siswa");
    setFormStatus("approved");
    setSelectedStudentId("");
    setSelectedTeacherId("");
    setFormError("");
    setShowPassword(false);
    setShowFormModal(true);
  }

  // Buka Modal Edit Akun
  function openEditModal(account: Account) {
    setEditingAccount(account);
    setFormName(account.name);
    setFormEmail(account.email);
    setFormPassword(""); // Kosongkan, jika ingin ganti baru diisi
    setFormRole(account.role);
    setFormStatus(account.status === "inactive" ? "inactive" : "approved");
    setSelectedStudentId(account.studentId || "");
    setSelectedTeacherId("");
    setFormError("");
    setShowPassword(false);
    setShowFormModal(true);
  }

  // Simpan Tambah / Edit Akun
  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    setFormSaving(true);
    setFormError("");
    try {
      if (editingAccount) {
        // Edit akun
        const payload: Record<string, unknown> = {
          name: formName,
          role: formRole,
          status: formStatus,
          studentId: formRole === "Siswa" ? selectedStudentId || null : null,
        };
        if (formPassword.trim()) {
          payload.password = formPassword.trim();
        }

        const res = await fetch(`/api/accounts/${editingAccount.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "Gagal memperbarui akun."));

        setSuccessMessage(`Akun ${formName} berhasil diperbarui.`);
        setShowFormModal(false);
        await loadData();
      } else {
        // Tambah akun baru
        const s = students.find((item) => item.id === selectedStudentId);
        const t = teachers.find((item) => item.id === selectedTeacherId);

        const payload = {
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          status: formStatus,
          studentId: formRole === "Siswa" ? selectedStudentId || null : null,
          nis: formRole === "Siswa" && s ? s.nis : null,
          nisn: formRole === "Siswa" && s ? s.nisn : null,
          grade: formRole === "Siswa" && s ? s.className : null,
          subject: formRole === "Guru" && t ? t.subject : null,
          phone: formRole === "Guru" && t ? t.phone : null,
        };

        const res = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "Gagal membuat akun."));

        setSuccessMessage(`Akun ${formName} (${formEmail}) berhasil dibuat.`);
        setShowFormModal(false);
        await loadData();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan akun.");
    } finally {
      setFormSaving(false);
    }
  }

  // Toggle status Aktif / Nonaktif
  async function toggleStatus(account: Account) {
    if (account.isBuiltIn) return;
    const nextStatus = account.status === "approved" ? "inactive" : "approved";
    const label = nextStatus === "approved" ? "diaktifkan" : "dinonaktifkan";

    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, "Gagal mengubah status akun."));

      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, status: nextStatus } : a))
      );
      setSuccessMessage(`Akun ${account.name} berhasil ${label}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status akun.");
    }
  }

  // Buka modal Reset Password
  function openResetModal(account: Account) {
    setResetTargetAccount(account);
    setNewPassword(generateRandomPassword());
    setResetError("");
    setShowResetModal(true);
  }

  // Simpan Reset Password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTargetAccount) return;
    setResetSaving(true);
    setResetError("");
    try {
      const res = await fetch(`/api/accounts/${resetTargetAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, "Gagal mereset kata sandi."));

      setSuccessMessage(`Kata sandi akun ${resetTargetAccount.email} berhasil direset menjadi: ${newPassword}`);
      setShowResetModal(false);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Gagal mereset kata sandi.");
    } finally {
      setResetSaving(false);
    }
  }

  // Hapus akun
  async function handleDeleteAccount(account: Account) {
    if (account.isBuiltIn) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${account.name} (${account.email})?`)) return;

    try {
      const res = await fetch(`/api/accounts/${account.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, "Gagal menghapus akun."));

      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      setSuccessMessage(`Akun ${account.name} berhasil dihapus.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus akun.");
    }
  }

  // Handle Upload Excel Akun
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportLoading(true);
    setImportError("");
    try {
      const parsed = await parseAccountExcel(file);
      if (parsed.length === 0) {
        throw new Error("Tidak ada data akun yang ditemukan dalam file Excel tersebut.");
      }
      setImportedRows(parsed);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Gagal membaca file Excel.");
      setImportedRows([]);
    } finally {
      setImportLoading(false);
    }
  }

  // Simpan Batch Impor Akun
  async function handleConfirmImport() {
    if (importedRows.length === 0) return;
    setImportSaving(true);
    setImportError("");
    try {
      const res = await fetch("/api/accounts/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: importedRows }),
      });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, "Gagal mengimpor batch akun."));

      const result = await res.json();
      setSuccessMessage(result.message || `Berhasil mengimpor ${result.importedCount} akun.`);
      setShowImportModal(false);
      setImportedRows([]);
      setImportFileName("");
      await loadData();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Gagal menyimpan akun.");
    } finally {
      setImportSaving(false);
    }
  }

  return (
    <>
      {/* 1. STATS METRICS */}
      <div className={styles.statsGrid}>
        <article className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statIcon}>👥</div>
          <div>
            <p>Total Akun Pengguna</p>
            <h2>{stats.total}</h2>
            <span>Akun terdaftar dalam sistem</span>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.statIcon}>♙</div>
          <div>
            <p>Akun Siswa Aktif</p>
            <h2>{stats.siswaCount}</h2>
            <span>Siswa dapat login ke portal</span>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statIcon}>♟</div>
          <div>
            <p>Akun Guru Aktif</p>
            <h2>{stats.guruCount}</h2>
            <span>Guru dapat mengelola nilai/kelas</span>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.yellow}`}>
          <div className={styles.statIcon}>🔒</div>
          <div>
            <p>Akun Nonaktif / Pending</p>
            <h2>{stats.nonaktifCount}</h2>
            <span>Akses login terkunci</span>
          </div>
        </article>
      </div>

      {/* 2. ALERT NOTIFIKASI */}
      {successMessage && (
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
          <span>✓ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#065f46", fontWeight: "bold" }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 18px",
            marginBottom: "18px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠ {error}</span>
          <button
            onClick={() => setError("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontWeight: "bold" }}
          >
            ×
          </button>
        </div>
      )}

      {/* 3. TOOLBAR & DAFTAR AKUN */}
      <div className={styles.panel}>
        <div
          className={styles.panelTitle}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Daftar Akun Pengguna</h3>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
              Kelola akses login siswa, guru, dan admin sekolah secara terpusat.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button
              type="button"
              onClick={downloadAccountTemplate}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#334155",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Unduh template Excel untuk impor akun massal"
            >
              📥 Template Excel
            </button>

            <button
              type="button"
              onClick={() => {
                setImportedRows([]);
                setImportFileName("");
                setImportError("");
                setShowImportModal(true);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              📂 Impor Akun Excel
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
              }}
            >
              + Tambah Akun
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginTop: "16px",
            marginBottom: "18px",
            background: "#f8fafc",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#475569" }}>
            Pencarian
            <input
              type="text"
              placeholder="Cari nama, email, NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#fff",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#475569" }}>
            Filter Peran
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#fff",
              }}
            >
              <option value="Semua">Semua Peran</option>
              <option value="Siswa">Siswa</option>
              <option value="Guru">Guru</option>
              <option value="Administrator">Administrator</option>
              <option value="Kepala Sekolah">Kepala Sekolah</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#475569" }}>
            Filter Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                background: "#fff",
              }}
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Pending">Menunggu Verifikasi</option>
            </select>
          </label>
        </div>

        {/* Tabel Data Akun */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className={styles.dataTable} style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Pengguna & Akun</th>
                <th>Peran</th>
                <th>Data Terhubung (Akademik)</th>
                <th>Status Akses</th>
                <th>Tindakan / Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px" }}>
                    Memuat data akun...
                  </td>
                </tr>
              )}

              {!loading && filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    Tidak ada akun yang sesuai dengan filter atau pencarian.
                  </td>
                </tr>
              )}

              {filteredAccounts.map((account) => {
                const isStudent = account.role === "Siswa";
                const isTeacher = account.role === "Guru";
                const isApproved = account.status === "approved";
                const isPending = account.status === "pending";

                return (
                  <tr key={account.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: isStudent ? "#e0f2fe" : isTeacher ? "#dcfce7" : "#f3e8ff",
                            color: isStudent ? "#0284c7" : isTeacher ? "#16a34a" : "#9333ea",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          {account.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <b style={{ fontSize: "14px", color: "#1e293b" }}>{account.name}</b>
                          <br />
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{account.email}</span>
                          {account.isBuiltIn && (
                            <span
                              style={{
                                marginLeft: "6px",
                                fontSize: "10px",
                                padding: "2px 6px",
                                background: "#f1f5f9",
                                color: "#475569",
                                borderRadius: "4px",
                                fontWeight: 700,
                              }}
                            >
                              Sistem
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: isStudent
                            ? "#e0f2fe"
                            : isTeacher
                              ? "#dcfce7"
                              : account.role === "Administrator"
                                ? "#f3e8ff"
                                : "#ffedd5",
                          color: isStudent
                            ? "#0369a1"
                            : isTeacher
                              ? "#15803d"
                              : account.role === "Administrator"
                                ? "#7e22ce"
                                : "#c2410c",
                        }}
                      >
                        {account.role}
                      </span>
                    </td>

                    <td>
                      {isStudent && (
                        <div style={{ fontSize: "12px", color: "#334155" }}>
                          {account.studentName ? (
                            <>
                              <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ Terhubung:</span>{" "}
                              <b>{account.studentName}</b>
                              <br />
                              <span style={{ color: "#64748b" }}>
                                NIS: {account.nis || "—"} · Kelas: {account.grade || "—"}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>
                              {account.nis ? `NIS: ${account.nis}` : "Belum ditautkan ke data siswa"}
                            </span>
                          )}
                        </div>
                      )}

                      {isTeacher && (
                        <div style={{ fontSize: "12px", color: "#334155" }}>
                          <b>{account.subject || "Semua Mapel"}</b>
                          <br />
                          <span style={{ color: "#64748b" }}>{account.phone || "No HP belum diatur"}</span>
                        </div>
                      )}

                      {!isStudent && !isTeacher && (
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Akses Penuh Administrasi</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: isApproved ? "#dcfce7" : isPending ? "#fef9c3" : "#fee2e2",
                            color: isApproved ? "#15803d" : isPending ? "#854d0e" : "#b91c1c",
                          }}
                        >
                          {isApproved ? "● Aktif" : isPending ? "⏳ Pending" : "✕ Nonaktif"}
                        </span>

                        {!account.isBuiltIn && (
                          <button
                            type="button"
                            onClick={() => toggleStatus(account)}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: "1px solid #cbd5e1",
                              background: isApproved ? "#fff1f2" : "#f0fdf4",
                              color: isApproved ? "#be123c" : "#15803d",
                            }}
                            title={isApproved ? "Klik untuk Nonaktifkan akun" : "Klik untuk Aktifkan akun"}
                          >
                            {isApproved ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {!account.isBuiltIn && (
                          <>
                            <button
                              type="button"
                              onClick={() => openResetModal(account)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                background: "#fff",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                              title="Reset Kata Sandi Akun"
                            >
                              🔑 Reset Pass
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(account)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                background: "#fff",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                              title="Edit Data Akun"
                            >
                              ✏ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(account)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid #fecaca",
                                background: "#fff1f2",
                                color: "#b91c1c",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                              title="Hapus Akun Pengguna"
                            >
                              🗑
                            </button>
                          </>
                        )}

                        {account.isBuiltIn && (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Akun Utama</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL TAMBAH / EDIT AKUN */}
      {showFormModal && (
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
              maxWidth: "520px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                {editingAccount ? `Edit Akun: ${editingAccount.name}` : "Tambah Akun Pengguna Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            {formError && (
              <p style={{ color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: "6px", fontSize: "13px" }}>
                {formError}
              </p>
            )}

            <form onSubmit={handleSaveAccount} style={{ display: "grid", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                Peran Akun
                <select
                  value={formRole}
                  onChange={(e) => {
                    setFormRole(e.target.value);
                    setSelectedStudentId("");
                    setSelectedTeacherId("");
                  }}
                  style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="Siswa">Siswa</option>
                  <option value="Guru">Guru</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                </select>
              </label>

              {/* Tautkan ke Siswa */}
              {formRole === "Siswa" && (
                <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                  Pilih dari Data Siswa Master (Otomatis Isi Data)
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="">-- Pilih Siswa Terdaftar (Opsional) --</option>
                    {studentsWithoutAccount.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · NIS: {s.nis} ({s.className}) {s.hasAccount ? " [Sudah Ada Akun]" : " [Belum Ada Akun]"}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "#64748b", fontWeight: 400 }}>
                    Memilih siswa akan otomatis menyinkronkan nama, NIS, dan kelas dengan data akademik.
                  </small>
                </label>
              )}

              {/* Tautkan ke Guru */}
              {formRole === "Guru" && (
                <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                  Pilih dari Data Guru Master (Otomatis Isi Data)
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => handleTeacherSelect(e.target.value)}
                    style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="">-- Pilih Guru Terdaftar (Opsional) --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} · NIP: {t.nip} ({t.subject})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                Nama Pengguna
                <input
                  type="text"
                  required
                  placeholder="Misal: Budi Santoso"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                Email Login (Username)
                <input
                  type="email"
                  required
                  disabled={Boolean(editingAccount)}
                  placeholder="Misal: budi@gmail.com atau budi@school.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: editingAccount ? "#f1f5f9" : "#fff",
                  }}
                />
                {editingAccount && <small style={{ color: "#64748b" }}>Email login tidak dapat diubah setelah dibuat.</small>}
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                {editingAccount ? "Kata Sandi Baru (Kosongkan jika tidak ingin ganti)" : "Kata Sandi Awal"}
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingAccount}
                    placeholder={editingAccount ? "Minimal 5 karakter..." : "Minimal 5 karakter..."}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: "12px" }}
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPassword(generateRandomPassword())}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                  >
                    Acak
                  </button>
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                Status Akses Akun
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "approved" | "inactive")}
                  style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="approved">Aktif (Dapat Login)</option>
                  <option value="inactive">Nonaktif (Login Terkunci)</option>
                </select>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  style={{ padding: "8px 20px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  {formSaving ? "Menyimpan..." : editingAccount ? "Perbarui Akun" : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL RESET PASSWORD */}
      {showResetModal && resetTargetAccount && (
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
              maxWidth: "420px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800 }}>Reset Kata Sandi</h3>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
              Atur ulang kata sandi untuk akun <b>{resetTargetAccount.name}</b> ({resetTargetAccount.email}).
            </p>

            {resetError && (
              <p style={{ color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: "6px", fontSize: "13px" }}>
                {resetError}
              </p>
            )}

            <form onSubmit={handleResetPassword} style={{ display: "grid", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700 }}>
                Kata Sandi Baru
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontFamily: "monospace", fontSize: "14px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                  >
                    Acak
                  </button>
                </div>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetSaving}
                  style={{ padding: "8px 20px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  {resetSaving ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL IMPOR EXCEL AKUN */}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Impor Akun Pengguna via Excel / CSV</h3>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Unggah file Excel berisi data akun siswa dan guru untuk dibuat secara massal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            {importError && (
              <p style={{ color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: "6px", fontSize: "13px" }}>
                {importError}
              </p>
            )}

            {/* Box Upload */}
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
                id="excelAccountInput"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label
                htmlFor="excelAccountInput"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Pilih File Excel / CSV
              </label>
              <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "12px" }}>
                Format yang didukung: .xlsx, .xls, .csv {importFileName ? `(Terpilih: ${importFileName})` : ""}
              </p>
              <button
                type="button"
                onClick={downloadAccountTemplate}
                style={{
                  marginTop: "8px",
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "12px",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Belum punya template? Unduh Template Excel di sini
              </button>
            </div>

            {/* Preview Tabel Hasil Impor */}
            {importLoading && <p style={{ textAlign: "center", color: "#64748b" }}>Membaca data file...</p>}

            {!importLoading && importedRows.length > 0 && (
              <div>
                <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700 }}>
                  Pratinjau Data yang Akan Diimpor ({importedRows.length} akun):
                </h4>
                <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                  <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                        <th style={{ padding: "8px 10px" }}>Nama</th>
                        <th style={{ padding: "8px 10px" }}>Email</th>
                        <th style={{ padding: "8px 10px" }}>Peran</th>
                        <th style={{ padding: "8px 10px" }}>NIS/NIP</th>
                        <th style={{ padding: "8px 10px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "6px 10px" }}><b>{row.name}</b></td>
                          <td style={{ padding: "6px 10px", color: "#2563eb" }}>{row.email}</td>
                          <td style={{ padding: "6px 10px" }}>{row.role}</td>
                          <td style={{ padding: "6px 10px" }}>{row.nis || row.nip || "—"}</td>
                          <td style={{ padding: "6px 10px" }}>
                            <span style={{ color: row.status === "approved" ? "#16a34a" : "#b91c1c", fontWeight: 700 }}>
                              {row.status === "approved" ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importedRows.length === 0 || importSaving}
                onClick={handleConfirmImport}
                style={{
                  padding: "8px 22px",
                  borderRadius: "6px",
                  border: "none",
                  background: importedRows.length === 0 ? "#cbd5e1" : "#16a34a",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: importedRows.length === 0 || importSaving ? "not-allowed" : "pointer",
                }}
              >
                {importSaving ? "Menyimpan ke Database..." : `Konfirmasi & Buat ${importedRows.length} Akun`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

