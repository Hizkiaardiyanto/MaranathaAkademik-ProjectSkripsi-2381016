import { SchoolShell } from "@/components/school-shell";
import { TeacherManager } from "@/components/teacher-manager";
import styles from "../page.module.css";

export default function GuruPage() {
  return (
    <SchoolShell title="Data Guru" activeItem="Data Guru">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>PERSONALIA</p>
            <h1>Data Guru</h1>
          </div>
        </div>

        <TeacherManager />
      </section>
    </SchoolShell>
  );
}
