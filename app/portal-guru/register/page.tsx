"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../../page.module.css";

export default function TeacherRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/teacher-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Pendaftaran guru gagal.");
      return;
    }

    setMessage(result.message);
    setForm({ name: "", email: "", password: "", subject: "" });
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.loginIntro}>
          <span className={styles.loginKicker}>SISTEM AKADEMIK TERPADU</span>
          <div className={styles.loginVisual} aria-hidden="true">
            <span className={styles.visualBook}>▰</span>
            <span className={styles.visualStar}>✦</span>
            <span className={styles.visualDot} />
          </div>
          <p className={styles.loginIntroText}>
            Satu ruang digital untuk mengelola sekolah, membina prestasi, dan
            menumbuhkan masa depan.
          </p>
          <div className={styles.loginStats}>
            <span>
              <b>Terpadu</b> data akademik
            </span>
            <span>
              <b>Aman</b> setiap akses
            </span>
          </div>
        </div>
        <div className={styles.loginMain}>
          <Link href="/login/guru" className={styles.loginBack}>
            ← Kembali ke login guru
          </Link>
          <div className={styles.loginBrand}>
            <span className={styles.brandMark}>M</span>
            <span>SD - SMP Kristen Maranatha</span>
          </div>
          <h1>Daftar Akun Guru</h1>
          <p>Buat akun guru terlebih dahulu untuk mengakses portal mengajar.</p>
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
              Email Guru
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Mata Pelajaran
              <input
                required
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
              />
            </label>
            <label>
              Password
              <input
                required
                minLength={5}
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </label>
            {error ? <div className={styles.loginError}>{error}</div> : null}
            {message ? (
              <div className={styles.loginSuccess}>{message}</div>
            ) : null}
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton}>
                Daftar Akun Guru
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
