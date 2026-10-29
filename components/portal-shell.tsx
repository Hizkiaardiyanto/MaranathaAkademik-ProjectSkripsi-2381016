"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { sessionMarkerKey } from "../lib/browser-session";
import styles from "../app/page.module.css";
import { useSidebarCollapse } from "../lib/use-sidebar-collapse";
import { SUBJECTS_CURRICULUM } from "./student-nilai-view";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type PortalSessionData = {
  name?: string;
  email?: string;
  role?: string;
  grade?: string;
  subject?: string;
};

export function PortalShell({
  role,
  title,
  subtitle,
  activeItem,
  activeHref,
  navItems,
  session: propSession,
  children,
}: {
  role: "Siswa" | "Guru";
  title: string;
  subtitle?: string;
  activeItem?: string;
  activeHref?: string;
  navItems: readonly PortalNavItem[] | PortalNavItem[];
  session?: PortalSessionData | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const isTeacher = role === "Guru";
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobile } =
    useSidebarCollapse(
      isTeacher
        ? "maranatha_teacher_sidebar_collapsed"
        : "maranatha_student_sidebar_collapsed",
    );
  const [menuSearch, setMenuSearch] = useState("");
  const [session, setSession] = useState<PortalSessionData | null>(
    propSession ?? null,
  );
  const [isNilaiExpanded, setIsNilaiExpanded] = useState(
    Boolean(activeHref?.includes("nilai") || activeItem === "Nilai Siswa")
  );

  useEffect(() => {
    if (propSession) {
      setSession(propSession);
      return;
    }
    let active = true;
    async function fetchSession() {
      try {
        const res = await fetch("/api/session");
        if (res.ok && active) {
          const data = (await res.json()) as PortalSessionData;
          setSession(data);
        }
      } catch {
        // Abaikan jika offline
      }
    }
    void fetchSession();
    return () => {
      active = false;
    };
  }, [propSession]);

  async function handleLogout() {
    window.sessionStorage.removeItem(sessionMarkerKey);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.push(isTeacher ? "/login/guru" : "/login/siswa");
      router.refresh();
    }
  }

  const userName = session?.name || (isTeacher ? "Guru Pengajar" : "Siswa");
  const userSub = isTeacher
    ? session?.subject
      ? `Guru ${session.subject}`
      : "Tenaga Pendidik"
    : session?.grade
      ? `Kelas ${session.grade}`
      : "Siswa Maranatha";

  const initials = userName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || (isTeacher ? "GU" : "SI");

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(menuSearch.trim().toLowerCase()),
  );

  return (
    <div className={styles.appShell}>
      {/* 1. TOPBAR ALWAYS STANDBY AT THE TOP (FULL WIDTH) */}
      <header className={styles.topbar}>
        <div className={styles.headerBrandBlock}>
          <span className={styles.headerBrandLogo}>M</span>
          <span className={styles.headerBrandTitle}>SD - SMP Maranatha</span>
          <button
            type="button"
            className={styles.headerHamburgerBtn}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Buka menu sidebar" : "Ciutkan menu sidebar"}
            title={
              isCollapsed
                ? "Buka menu sidebar (Expand)"
                : "Ciutkan menu sidebar (Collapse)"
            }
          >
            ☰
          </button>
        </div>

        <div className={styles.breadcrumb}>
          <span>{title}</span>
          <small>
            {subtitle ??
              (isTeacher
                ? "Portal Akademik Guru"
                : "Portal Informasi Akademik Siswa")}
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
          <div
            className={styles.avatar}
            style={{
              background: isTeacher
                ? "linear-gradient(135deg, #10b981, #047857)"
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            }}
          >
            {initials}
          </div>
          <div className={styles.profile}>
            <b>{userName}</b>
            <small>{userSub}</small>
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

      {/* 2. BODY CONTAINER: SIDEBAR (LEFT) + MAIN CONTENT (RIGHT) */}
      <div className={styles.shellBody}>
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
          {/* Mobile drawer header (visible only on mobile) */}
          <div className={styles.mobileDrawerHeader}>
            <div className={styles.brand}>
              <span className={styles.brandMark}>M</span>
              <span>SD - SMP Maranatha</span>
            </div>
            <button
              type="button"
              className={styles.mobileCloseDrawerBtn}
              onClick={closeMobile}
              title="Tutup menu"
              aria-label="Tutup menu"
            >
              ×
            </button>
          </div>

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

          <p className={styles.menuLabel}>
            {isTeacher ? "MENU GURU" : "MENU SISWA"}
          </p>

          <nav className={styles.navMenu}>
            {filteredNavItems.map(({ label, href, icon }) => {
              const isNilaiItem = !isTeacher && label === "Nilai Siswa";
              const isActive =
                activeHref === href ||
                activeItem === label ||
                (activeHref && href !== "/portal-siswa" && href !== "/portal-guru" && activeHref.startsWith(href));

              return (
                <div key={href} style={{ display: "flex", flexDirection: "column" }}>
                  <Link
                    href={href}
                    className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    data-tooltip={label}
                    title={label}
                    onClick={(e) => {
                      if (isNilaiItem) {
                        setIsNilaiExpanded((prev) => !prev);
                      }
                      if (isMobileOpen && !isNilaiItem) closeMobile();
                    }}
                  >
                    <i>{icon}</i>
                    <span className={styles.navLabel}>{label}</span>
                    <span
                      className={`${styles.navArrow} ${isNilaiItem && isNilaiExpanded ? styles.studentNavArrowExpanded : ""}`}
                      aria-hidden="true"
                    >
                      {isNilaiItem && isNilaiExpanded ? "⌄" : "›"}
                    </span>
                  </Link>

                  {/* Submenu Mata Pelajaran (Gambar 2) */}
                  {isNilaiItem && isNilaiExpanded && (!isCollapsed || isMobileOpen) && (
                    <div className={styles.portalSubmenuList}>
                      {SUBJECTS_CURRICULUM.map((s) => (
                        <Link
                          key={s.id}
                          href={`/portal-siswa/nilai?mapel=${encodeURIComponent(s.name)}`}
                          className={styles.portalSubmenuItem}
                          onClick={() => {
                            if (isMobileOpen) closeMobile();
                          }}
                        >
                          <span style={{ fontSize: "14px", width: "18px", display: "inline-flex", justifyContent: "center" }}>
                            {s.icon}
                          </span>
                          <span>{s.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredNavItems.length === 0 && (
              <p className={styles.menuEmptyNotice}>Menu tidak ditemukan</p>
            )}
          </nav>

          <div className={styles.sidebarBottom}>
            <div className={styles.supportIcon} title="Butuh bantuan?">
              ?
            </div>
            <div>
              <b>Butuh bantuan?</b>
              <small>
                {isTeacher
                  ? "Hubungi admin sekolah"
                  : "Hubungi wali kelas atau sekolah"}
              </small>
            </div>
          </div>
        </aside>

        <main
          className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

