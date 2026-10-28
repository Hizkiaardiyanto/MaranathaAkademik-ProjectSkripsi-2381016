import { SchoolShell } from "@/components/school-shell";
import { AccountManager } from "@/components/account-manager";
import styles from "../page.module.css";

export default function ManajemenAkunPage() {
  return (
    <SchoolShell title="Manajemen Akun" activeItem="Manajemen Akun">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>HAK AKSES & PENGGUNA</p>
            <h1>Manajemen Akun Pengguna</h1>
            <p className={styles.pageSubtitle}>
              Kelola akun login untuk Siswa, Guru, dan Admin. Buat akun manual, impor dari Excel, dan atur status akses aktif/nonaktif.
            </p>
          </div>
        </div>

        <AccountManager />
      </section>
    </SchoolShell>
  );
}

