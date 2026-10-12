"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sessionMarkerKey } from "../../../lib/browser-session";
import styles from "../../page.module.css";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "Siswa" }),
      });
      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Login siswa gagal.");
        return;
      }
      window.sessionStorage.setItem(sessionMarkerKey, "active");
      router.push("/portal-siswa");
      router.refresh();
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
          <span className={styles.loginKicker}>PORTAL SISWA</span>
          <div className={styles.loginVisual} aria-hidden="true">
            <span className={styles.visualBook}>▰</span>
            <span className={styles.visualStar}>✦</span>
            <span className={styles.visualDot} />
          </div>
          <p className={styles.loginIntroText}>
            Ruang belajarmu untuk memantau prestasi, kehadiran, dan setiap
            langkah berkembang.
          </p>
          <div className={styles.loginStats}>
            <span>
              <b>Aktif</b> belajar setiap hari
            </span>
            <span>
              <b>Aman</b> data akademik
            </span>
          </div>
        </div>
        <div className={styles.loginMain}>
          <div className={styles.loginBrand}>
            <span className={styles.brandMark}>M</span>
            <span>SD - SMP Kristen Maranatha</span>
          </div>
          <h1>Login Siswa</h1>
          <p>Masuk untuk melihat perjalanan belajarmu hari ini.</p>
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <label>
              <span>Alamat email</span>
              <span className={styles.inputWrap}>
                <span className={styles.inputIcon} aria-hidden="true">
                  ✉
                </span>
                <input
                  required
                  type="email"
                  placeholder="nama@sekolah.sch.id"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>
            <label>
              <span>Kata sandi</span>
              <span className={styles.inputWrap}>
                <span className={styles.inputIcon} aria-hidden="true">
                  ⌑
                </span>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  title={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
                    <circle cx="12" cy="12" r="2.5" />
                    {showPassword ? null : <path d="m4 4 16 16" />}
                  </svg>
                </button>
              </span>
            </label>
            {error ? <div className={styles.loginError}>{error}</div> : null}
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memeriksa akun..." : "Masuk ke Portal Siswa"}
              <span aria-hidden="true">→</span>
            </button>
            <div className={styles.loginTrust}>
              <span aria-hidden="true">✦</span> Data akademikmu terlindungi
            </div>
            <Link href="/portal-siswa/register" className={styles.loginLink}>
              Belum mendaftar? Daftar sebagai calon siswa
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
