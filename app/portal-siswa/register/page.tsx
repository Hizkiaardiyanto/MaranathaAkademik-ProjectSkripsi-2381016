"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../../page.module.css";

export default function StudentRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    parent: "",
    grade: "Kelas 1",
    phone: "",
    nis: "",
    nisn: "",
    gender: "L",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/student-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Pendaftaran gagal.");
        return;
      }

      setMessage(
        `${result.message} Nomor pendaftaran: ${result.registrationId}`,
      );
      setForm({
        name: "",
        parent: "",
        grade: "Kelas 1",
        phone: "",
        nis: "",
        nisn: "",
        gender: "L",
        email: "",
        password: "",
      });
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.loginIntro}>
          <span className={styles.loginKicker}>DAFTAR SISWA</span>
          <div className={styles.loginVisual} aria-hidden="true">
            <span className={styles.visualBook}>▰</span>
            <span className={styles.visualStar}>✦</span>
            <span className={styles.visualDot} />
          </div>
          <p className={styles.loginIntroText}>
            Buat akun siswa untuk mengakses portal dan memantau perjalanan
            belajarmu.
          </p>
        </div>

        <div className={styles.loginMain}>
          <Link href="/login/siswa" className={styles.loginBack}>
            ← Kembali ke login siswa
          </Link>
          <div className={styles.loginBrand}>
            <span className={styles.brandMark}>M</span>
            <span>SD - SMP Kristen Maranatha</span>
          </div>
          <h1>Daftar Calon Siswa</h1>
          <p>
            Isi data berikut lalu gunakan email dan password baru untuk login.
          </p>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <label>
              Nama Lengkap
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label>
              Nama Orang Tua/Wali
              <input
                required
                value={form.parent}
                onChange={(event) =>
                  setForm({ ...form, parent: event.target.value })
                }
              />
            </label>
            <label>
              Kelas Tujuan
              <select
                value={form.grade}
                onChange={(event) =>
                  setForm({ ...form, grade: event.target.value })
                }
              >
                {Array.from({ length: 9 }, (_, index) => (
                  <option key={index + 1}>Kelas {index + 1}</option>
                ))}
              </select>
            </label>
            <label>
              Nomor WhatsApp
              <input
                required
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>
            <label>
              NIS
              <input
                required
                value={form.nis}
                onChange={(event) =>
                  setForm({ ...form, nis: event.target.value })
                }
              />
            </label>
            <label>
              NISN
              <input
                required
                value={form.nisn}
                onChange={(event) =>
                  setForm({ ...form, nisn: event.target.value })
                }
              />
            </label>
            <label>
              Jenis Kelamin
              <select
                value={form.gender}
                onChange={(event) =>
                  setForm({ ...form, gender: event.target.value })
                }
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </label>
            <label>
              Email Siswa
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="nama@sekolah.sch.id"
              />
            </label>
            <label>
              Kata Sandi
              <input
                required
                minLength={5}
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="Minimal 5 karakter"
              />
            </label>

            {error ? <div className={styles.loginError}>{error}</div> : null}
            {message ? (
              <div className={styles.loginSuccess}>{message}</div>
            ) : null}

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Membuat akun..." : "Daftar Akun Siswa"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
