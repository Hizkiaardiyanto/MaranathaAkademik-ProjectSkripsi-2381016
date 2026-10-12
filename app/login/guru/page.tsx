"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sessionMarkerKey } from "../../../lib/browser-session";
import styles from "../../page.module.css";

export default function TeacherLoginPage() {
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
        body: JSON.stringify({ email, password, role: "Guru" }),
      });
      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Login guru gagal.");
        return;
      }
      window.sessionStorage.setItem(sessionMarkerKey, "active");
      router.push("/portal-guru");
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
          <span className={styles.loginKicker}>PORTAL GURU</span>
          <div className={styles.loginVisual} aria-hidden="true">
            <span className={styles.visualBook}>▰</span>
            <span className={styles.visualStar}>✦</span>
            <span className={styles.visualDot} />
          </div>
          <p className={styles.loginIntroText}>
            Hadirkan pengalaman belajar terbaik melalui informasi yang selalu
            terhubung.
          </p>
          <div className={styles.loginStats}>
            <span>
              <b>Terhubung</b> dengan kelas
            </span>
            <span>
              <b>Aman</b> setiap akses
            </span>
          </div>
        </div>
        <div className={styles.loginMain}>
          <div className={styles.loginBrand}>
            <span className={styles.brandMark}>M</span>
            <span>SD - SMP Kristen Maranatha</span>
          </div>
          <h1>Login Guru</h1>
          <p>Masuk untuk melanjutkan aktivitas mengajarmu.</p>
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
              {isSubmitting ? "Memeriksa akun..." : "Masuk ke Portal Guru"}
              <span aria-hidden="true">→</span>
            </button>
            <div className={styles.loginTrust}>
              <span aria-hidden="true">✦</span> Akses aman untuk tenaga pendidik
            </div>
            <Link href="/portal-guru/register" className={styles.loginLink}>
              Belum memiliki akun? Daftar sebagai guru
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
