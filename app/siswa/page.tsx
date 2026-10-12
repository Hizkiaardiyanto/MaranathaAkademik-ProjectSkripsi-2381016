import { SchoolShell } from "@/components/school-shell";
import { StudentManager } from "@/components/student-manager";
import styles from "../page.module.css";

export default function SiswaPage() {
  return (
    <SchoolShell title="Data Siswa" activeItem="Data Siswa">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>MASTER DATA</p>
            <h1>Data Siswa</h1>
          </div>
        </div>

        <StudentManager />
      </section>
    </SchoolShell>
  );
}
