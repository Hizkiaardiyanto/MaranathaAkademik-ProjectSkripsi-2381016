"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { sessionMarkerKey } from "../lib/browser-session";
import styles from "../app/page.module.css";
import { SchoolVisionMission } from "./school-vision-mission";
import { useSidebarCollapse } from "../lib/use-sidebar-collapse";

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
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobile } =
    useSidebarCollapse("maranatha_admin_sidebar_collapsed");
  const [menuSearch, setMenuSearch] = useState("");

  async function handleLogout() {
    window.sessionStorage.removeItem(sessionMarkerKey);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(menuSearch.trim().toLowerCase()),
  );

  return (
    <div className={styles.appShell}>
      {isMobileOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${isMobileOpen ? styles.sidebarMobileOpen : ""}`}
      >
        <div className={styles.brandRow}>
          <Link href="/" className={styles.brand} title="SD - SMP Kristen Maranatha">
            <span className={styles.brandMark}>M</span>
            {!isCollapsed && <span>SD - SMP Kristen Maranatha</span>}
          </Link>
          {!isCollapsed && (
            <button
              type="button"
              className={styles.sidebarCollapseBtn}
              onClick={toggleSidebar}
              title="Ciutkan menu sidebar (Collapse)"
              aria-label="Ciutkan menu sidebar"
            >
              «
            </button>
          )}
        </div>

        {!isCollapsed && (
          <label className={styles.adminMenuSearch}>
            <span aria-hidden="true">⌕</span>
            <input
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Cari menu (min. 2 karakter)..."
              aria-label="Cari menu"
            />
            {menuSearch && (
              <button
                type="button"
                onClick={() => setMenuSearch("")}
                className={styles.searchClearBtn}
                title="Hapus pencarian"
              >
                ×
              </button>
            )}
          </label>
        )}

        {!isCollapsed && <p className={styles.menuLabel}>MENU UTAMA</p>}

        <nav className={styles.navMenu}>
          {filteredNavItems.map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              className={`${styles.navItem} ${activeItem === label ? styles.active : ""}`}
              aria-current={activeItem === label ? "page" : undefined}
              data-tooltip={label}
              title={isCollapsed ? label : undefined}
              onClick={() => {
                if (isMobileOpen) closeMobile();
              }}
            >
              <i>{icon}</i>
              {!isCollapsed && (
                <>
                  <span className={styles.navLabel}>{label}</span>
                  <span className={styles.navArrow} aria-hidden="true">
                    ›
                  </span>
                </>
              )}
            </Link>
          ))}
          {filteredNavItems.length === 0 && !isCollapsed && (
            <p className={styles.menuEmptyNotice}>Menu tidak ditemukan</p>
          )}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.supportIcon} title="Butuh bantuan?">
            ?
          </div>
          {!isCollapsed && (
            <div>
              <b>Butuh bantuan?</b>
              <small>Hubungi administrator</small>
            </div>
          )}
        </div>
      </aside>

      <main
        className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ""}`}
      >
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Buka menu sidebar" : "Ciutkan menu sidebar"}
            title={isCollapsed ? "Buka menu sidebar (Expand)" : "Ciutkan menu sidebar (Collapse)"}
          >
            ☰
          </button>

          <div className={styles.breadcrumb}>
            <span>{title}</span>
            <small>{subtitle ?? "Administrasi sekolah"}</small>
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
