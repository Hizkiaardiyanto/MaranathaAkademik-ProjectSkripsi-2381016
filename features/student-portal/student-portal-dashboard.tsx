"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../app/page.module.css";
import { SchoolVisionMission } from "../../components/school-vision-mission";
import { sessionMarkerKey } from "../../lib/browser-session";
import { useSidebarCollapse } from "../../lib/use-sidebar-collapse";
import { ImportantAnnouncements } from "./important-announcements";
import { studentPortalMenu } from "./student-portal-menu";
import type { ImportantAnnouncement, StudentSession } from "./types";

function formatDate() {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
}

export function StudentPortalDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // The announcements component is intentionally data-ready. Connect this state
  // to an announcements API once the school publishing source is available.
  const [announcements] = useState<ImportantAnnouncement[]>([]);
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobile } = useSidebarCollapse("maranatha_student_sidebar_collapsed");
  const dateLabel = formatDate();
  const filteredMenus = studentPortalMenu.filter((menu) => menu.label.toLowerCase().includes(search.trim().toLowerCase()));
  const initials = (student?.name || "Siswa").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    let active = true;
    async function loadSession() {
      try {
        const response = await fetch("/api/session");
        if (response.ok && active) setStudent((await response.json()) as StudentSession);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSession();
    return () => { active = false; };
  }, []);

  async function logout() {
    window.sessionStorage.removeItem(sessionMarkerKey);
    try { await fetch("/api/logout", { method: "POST" }); }
    finally { router.replace("/login/siswa"); router.refresh(); }
  }

  return (
    <div className={styles.studentDashboard} id="overview">
      {/* TOPBAR: always full-width at the top */}
      <header className={styles.studentTopbar}>
        <div className={styles.headerBrandBlock}>
          <span className={styles.headerBrandLogo}>M</span>
          <span className={styles.headerBrandTitle}>SD - SMP Maranatha</span>
          <button
            type="button"
            className={styles.headerHamburgerBtn}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Buka menu sidebar" : "Ciutkan menu sidebar"}
            title={isCollapsed ? "Buka menu sidebar (Expand)" : "Ciutkan menu sidebar (Collapse)"}
          >
            ☰
          </button>
        </div>
        <div className={styles.studentTopbarActions}>
          <span className={styles.studentDate}>{dateLabel}</span>
          <div className={styles.studentProfile}>
            <span className={styles.studentAvatar}>{initials}</span>
            <span>
              <b>{student?.name || "Siswa"}</b>
              <small>{student?.grade || "SD - SMP Kristen Maranatha"}</small>
            </span>
          </div>
          <button
            type="button"
            className={styles.studentLogoutTopbar}
            onClick={logout}
          >
            Keluar
          </button>
        </div>
      </header>

      {/* BODY: sidebar (left) + main content (right) */}
      <div className={styles.shellBody}>
        {isMobileOpen ? (
          <div
            className={styles.sidebarBackdrop}
            onClick={closeMobile}
            aria-hidden="true"
          />
        ) : null}

        <aside
          className={`${styles.studentSidebar} ${isCollapsed ? styles.studentSidebarCollapsed : ""} ${isMobileOpen ? styles.studentSidebarMobileOpen : ""}`}
        >
          <div className={styles.brandRow}>
            <Link href="/portal-siswa" className={styles.studentBrand} title="SD - SMP Maranatha">
              <span className={styles.studentBrandMark}>M</span>
              {!isCollapsed || isMobileOpen ? <span>SD - SMP <b>Maranatha</b></span> : null}
            </Link>
            {isMobileOpen ? (
              <button
                type="button"
                className={styles.mobileCloseDrawerBtn}
                onClick={closeMobile}
                aria-label="Tutup menu"
              >
                ×
              </button>
            ) : !isCollapsed ? (
              <button
                type="button"
                className={styles.sidebarCollapseBtn}
                onClick={toggleSidebar}
                aria-label="Ciutkan menu sidebar"
              >
                «
              </button>
            ) : null}
          </div>
          {!isCollapsed || isMobileOpen ? (
            <label className={styles.studentSearch}>
              <span aria-hidden="true">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari menu..."
                aria-label="Cari menu"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={styles.searchClearBtn}
                  aria-label="Hapus pencarian"
                >
                  ×
                </button>
              ) : null}
            </label>
          ) : null}
          {!isCollapsed || isMobileOpen ? <p className={styles.studentMenuLabel}>MENU SISWA</p> : null}
          <nav className={styles.studentNav} aria-label="Navigasi portal siswa">
            {filteredMenus.map((menu) => (
              <Link
                key={menu.label}
                href={menu.href}
                className={`${styles.studentNavItem} ${menu.href === "/portal-siswa" ? styles.studentNavActive : ""}`}
                title={isCollapsed && !isMobileOpen ? menu.label : undefined}
                onClick={() => isMobileOpen && closeMobile()}
              >
                <span aria-hidden="true">{menu.icon}</span>
                {!isCollapsed || isMobileOpen ? (
                  <>
                    <span className={styles.studentNavLabel}>{menu.label}</span>
                    {menu.href.startsWith("/") ? (
                      <span className={styles.studentNavArrow} aria-hidden="true">›</span>
                    ) : null}
                  </>
                ) : null}
              </Link>
            ))}
            {filteredMenus.length === 0 && (!isCollapsed || isMobileOpen) ? (
              <p className={styles.menuEmptyNotice}>Menu tidak ditemukan</p>
            ) : null}
          </nav>
          <div className={styles.studentSidebarBottom}>
            <span className={styles.studentHelpIcon}>?</span>
            {!isCollapsed || isMobileOpen ? (
              <span>
                <b>Butuh bantuan?</b>
                <small>Hubungi wali kelas atau sekolah</small>
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.studentLogout}
            onClick={logout}
            title={isCollapsed && !isMobileOpen ? "Keluar" : undefined}
          >
            <span aria-hidden="true">↪</span>
            {!isCollapsed || isMobileOpen ? " Keluar" : null}
          </button>
        </aside>

        <main
          className={`${styles.studentMain} ${isCollapsed ? styles.studentMainCollapsed : ""}`}
        >
          <div className={styles.studentContent}>
            <section className={styles.studentSemester}>
              <div>
                <span aria-hidden="true">▦</span>
                <b>SEMESTER AKTIF:</b>
                <strong>Tahun ajaran belum diatur</strong>
              </div>
              <div>
                <span aria-hidden="true">♙</span>
                <b>SISWA:</b>
                <strong>{student?.name || student?.email || "Memuat akun..."}</strong>
              </div>
              <time>{dateLabel}</time>
            </section>
            <ImportantAnnouncements announcements={announcements} loading={loading} />
            <div id="informasi-sekolah"><SchoolVisionMission /></div>
            <footer className={styles.studentFooter}>
              Portal Siswa · SD - SMP Kristen Maranatha · {student?.name || "Siswa"}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
