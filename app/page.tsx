import styles from "./page.module.css";

const navItems = [
  { label: "Dashboard", icon: "⌂", active: true },
  { label: "Data Siswa", icon: "♙" },
  { label: "Data Guru", icon: "♟" },
  { label: "Kelas", icon: "▦" },
  { label: "Mata Pelajaran", icon: "◈" },
  { label: "Jadwal Pelajaran", icon: "◷" },
  { label: "Absensi Siswa", icon: "✓" },
  { label: "Pengelolaan Nilai", icon: "▤" },
  { label: "Rapor", icon: "▧" },
  { label: "Laporan Akademik", icon: "◫" },
];

const metrics = [
  { label: "Total Siswa", value: "1.248", detail: "↑ 4,5%", meta: "dari semester lalu", tone: "blue" },
  { label: "Total Guru", value: "86", detail: "↑ 2 guru", meta: "bulan ini", tone: "orange" },
  { label: "Rombel Aktif", value: "36", detail: "3 jenjang", meta: "kelas aktif", tone: "purple" },
  { label: "Kehadiran Hari Ini", value: "96,8%", detail: "↑ 1,2%", meta: "dari kemarin", tone: "green" },
];

const schedule = [
  { time: "07.00\n08.30", name: "Matematika", teacher: "Kelas 9 · Ibu Rina Kurniawati", room: "R. 201", color: "math" },
  { time: "08.45\n10.15", name: "Bahasa Inggris", teacher: "Kelas 6 · Bapak Andi Saputra", room: "R. 105", color: "eng" },
  { time: "10.30\n12.00", name: "Fisika", teacher: "Kelas 8 · Bapak Deni Pratama", room: "R. 103", color: "sci" },
];

const announcements = [
  { icon: "📢", title: "Persiapan Penilaian Tengah Semester", text: "Mohon seluruh guru untuk menginput nilai PTS paling lambat 15 Oktober 2025.", time: "2 jam yang lalu", tone: "yellow" },
  { icon: "◉", title: "Rapat Koordinasi Guru", text: "Rapat rutin akan dilaksanakan pada Jumat, 10 Oktober 2025 pukul 13.00 WIB.", time: "Kemarin", tone: "pink" },
];

export default function Home() {
  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <a href="#" className={styles.brand}>
          <span className={styles.brandMark}>E</span>
          <span>
            edu<span>Nusa</span>
          </span>
        </a>

        <p className={styles.menuLabel}>MENU UTAMA</p>

        <nav className={styles.navMenu}>
          {navItems.map(({ label, icon, active }) => (
            <button
              key={label}
              type="button"
              className={`${styles.navItem} ${active ? styles.active : ""}`}
            >
              <i>{icon}</i>
              {label}
            </button>
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
          <button type="button" className={styles.hamburger} aria-label="Toggle menu">
            ☰
          </button>

          <div className={styles.breadcrumb}>
            <span>Dashboard</span>
            <small>Tahun Ajaran 2025/2026 · Semester Ganjil</small>
          </div>

          <div className={styles.topActions}>
            <button type="button" className={styles.iconBtn} aria-label="Pencarian">
              ⌕
            </button>
            <button type="button" className={styles.iconBtn} aria-label="Notifikasi">
              ♧
              <em />
            </button>
            <div className={styles.avatar}>AR</div>
            <div className={styles.profile}>
              <b>Admin Sekolah</b>
              <small>Administrator</small>
            </div>
            <span className={styles.chevron}>⌄</span>
            <button type="button" className={styles.logoutButton}>
              Keluar
            </button>
          </div>
        </header>

        <section className={styles.page}>
          <div className={styles.pageHeading}>
            <div>
              <p className={styles.eyebrow}>SELAMAT DATANG KEMBALI</p>
              <h1>
                Halo, Admin! <span>👋</span>
              </h1>
              <p className={styles.subtitle}>Berikut ringkasan aktivitas sekolah hari ini.</p>
            </div>
            <button type="button" className={styles.dateButton}>
              ▣ &nbsp; Senin, 6 Oktober 2025
            </button>
          </div>

          <div className={styles.statsGrid}>
            {metrics.map(({ label, value, detail, meta, tone }) => (
              <article key={label} className={`${styles.statCard} ${styles[tone]}`}>
                <div className={styles.statIcon}>{tone === "blue" ? "♙" : tone === "orange" ? "♟" : tone === "purple" ? "▦" : "✓"}</div>
                <div>
                  <p>{label}</p>
                  <h2>{value}</h2>
                  <span>
                    {detail} <small>{meta}</small>
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.dashboardGrid}>
            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Statistik Kehadiran</h3>
                  <p>Rekap kehadiran siswa minggu ini</p>
                </div>
                <select defaultValue="Minggu ini" aria-label="Pilih periode">
                  <option>Minggu ini</option>
                </select>
              </div>

              <div className={styles.chartWrap}>
                <div className={styles.chartY}>
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                <div className={styles.barChart}>
                  {[
                    { day: "Sen", one: "76%", two: "89%" },
                    { day: "Sel", one: "83%", two: "94%" },
                    { day: "Rab", one: "75%", two: "88%" },
                    { day: "Kam", one: "81%", two: "96%" },
                    { day: "Jum", one: "78%", two: "93%" },
                  ].map((item) => (
                    <div key={item.day} className={styles.barSet}>
                      <i style={{ height: item.one }} />
                      <i style={{ height: item.two }} />
                      <b>{item.day}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.legend}>
                <span>
                  <i className={styles.present} /> Hadir
                </span>
                <span>
                  <i className={styles.absent} /> Tidak Hadir
                </span>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Jadwal Hari Ini</h3>
                  <p>Senin, 6 Oktober 2025</p>
                </div>
                <button type="button" className={styles.linkButton}>
                  Lihat semua →
                </button>
              </div>

              <div className={styles.scheduleList}>
                {schedule.map((lesson) => (
                  <div key={lesson.name} className={styles.lesson}>
                    <time>{lesson.time}</time>
                    <span className={`${styles.lessonDot} ${styles[lesson.color]}`} />
                    <div>
                      <b>{lesson.name}</b>
                      <p>{lesson.teacher}</p>
                    </div>
                    <label>{lesson.room}</label>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className={`${styles.dashboardGrid} ${styles.lower}`}>
            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Pengumuman Terbaru</h3>
                  <p>Informasi penting untuk sekolah</p>
                </div>
                <button type="button" className={styles.linkButton}>
                  Lihat semua →
                </button>
              </div>

              {announcements.map((item) => (
                <div key={item.title} className={styles.announcement}>
                  <div className={`${styles.announceIcon} ${styles[item.tone]}`}>{item.icon}</div>
                  <div>
                    <b>{item.title}</b>
                    <p>{item.text}</p>
                    <small>{item.time}</small>
                  </div>
                </div>
              ))}
            </article>

            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <div>
                  <h3>Akses Cepat</h3>
                  <p>Kelola data sekolah dengan mudah</p>
                </div>
              </div>

              <div className={styles.quickGrid}>
                <button type="button">＋ Tambah Siswa</button>
                <button type="button">✓ Input Absensi</button>
                <button type="button">▤ Input Nilai</button>
                <button type="button">↓ Cetak Rapor</button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
