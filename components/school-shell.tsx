"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { sessionMarkerKey } from "../lib/browser-session";
import styles from "../app/page.module.css";
import { SchoolVisionMission } from "./school-vision-mission";

const navItems = [
  { label: "Dashboard", href: "/", icon: "⌂" },
  { label: "Data Siswa", href: "/siswa", icon: "♙" },
  { label: "Data Guru", href: "/guru", icon: "♟" },
  { label: "Kelas", href: "/kelas", icon: "▦" },
  { label: "Mata Pelajaran", href: "/mata-pelajaran", icon: "◈" },
  { label: "Jadwal Pelajaran", href: "/jadwal", icon: "◷" },
  { label: "Absensi Siswa", href: "/absensi", icon: "✓" },
  { label: "Pengelolaan Nilai", href: "/nilai", icon: "▤" },
  { label: "Rapor", href: "/rapor", icon: "▧" },
  { label: "Laporan Akademik", href: "/laporan", icon: "◫" },
];

export function SchoolShell({
  title,
  subtitle,
  activeItem,
  children,
}: {
  title: string;
  subtitle?: string;
  activeItem: string;
  children: ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    window.sessionStorage.removeItem(sessionMarkerKey);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>M</span>
          <span>SD - SMP Kristen Maranatha</span>
        </Link>

        <p className={styles.menuLabel}>MENU UTAMA</p>

        <nav className={styles.navMenu}>
          {navItems.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              className={`${styles.navItem} ${activeItem === label ? styles.active : ""}`}
              aria-current={activeItem === label ? "page" : undefined}
            >
              <i>{icon}</i>
              {label}
            </a>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.supportIcon}>?</div>
          <div>
            <b>Butuh bantuan?</b>
            <small>Hubungi administrator</small>
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.hamburger}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className={styles.breadcrumb}>
            <span>{title}</span>
            <small>
              {subtitle ?? "Administrasi sekolah"}
            </small>
          </div>

          <div className={styles.topActions}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Pencarian"
            >
              ⌕
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Notifikasi"
            >
              ♧
              <em />
            </button>
            <div className={styles.avatar}>AR</div>
            <div className={styles.profile}>
              <b>Admin Sekolah</b>
              <small>Administrator</small>
            </div>
            <span className={styles.chevron}>⌄</span>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Keluar
            </button>
          </div>
        </header>

        {children}
        <SchoolVisionMission />
      </main>
    </div>
  );
}
