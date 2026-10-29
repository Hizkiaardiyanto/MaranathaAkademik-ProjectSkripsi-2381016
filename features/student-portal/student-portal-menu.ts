export type StudentMenuItem = {
  label: string;
  href: string;
  icon: string;
  description: string;
};

export const studentPortalMenu: readonly StudentMenuItem[] = [
  {
    label: "Dashboard",
    href: "/portal-siswa",
    icon: "⌂",
    description: "Akses pusat informasi akademik milik siswa",
  },
  {
    label: "Jadwal Pelajaran",
    href: "/portal-siswa/jadwal",
    icon: "◷",
    description: "Melihat jadwal pelajaran kelas",
  },
  {
    label: "Absensi Siswa",
    href: "/portal-siswa/absensi",
    icon: "✓",
    description: "Melihat absensi dan kehadiran harian",
  },
  {
    label: "Nilai Siswa",
    href: "/portal-siswa/nilai",
    icon: "▤",
    description: "Melihat perolehan nilai akademik siswa",
  },
  {
    label: "Rapor Digital",
    href: "/portal-siswa/rapor",
    icon: "▧",
    description: "Melihat rapor jika sudah tersedia secara digital",
  },
  {
    label: "Informasi Sekolah",
    href: "/portal-siswa/informasi-sekolah",
    icon: "ⓘ",
    description: "Melihat informasi, visi misi, & pengumuman sekolah",
  },
] as const;

export const teacherPortalMenu = [
  { label: "Dashboard", href: "/portal-guru", icon: "⌂" },
  { label: "Jadwal Mengajar", href: "/portal-guru/jadwal", icon: "◷" },
  { label: "Absensi Siswa", href: "/portal-guru/absensi", icon: "✓" },
  { label: "Input Nilai", href: "/portal-guru/nilai", icon: "▤" },
  { label: "Kelas", href: "/portal-guru/kelas", icon: "▦" },
  { label: "Rapor Siswa", href: "/portal-guru/rapor", icon: "▧" },
  { label: "Mata Pelajaran", href: "/portal-guru/mata-pelajaran", icon: "◈" },
] as const;
