import styles from "../app/page.module.css";

const mission = [
  "Mewujudkan Pendidikan Advent, yang Beriman dan suka Melayani.",
  "Mengembangkan Kemampuan Peserta Didik Agar Terampil dalam Ilmu Pengetahuan dan Teknologi.",
  "Memotivasi Peserta Didik Agar Kreatif, Berprestasi dan Mandiri.",
];

export function SchoolVisionMission() {
  return (
    <section className={styles.studentPanel}>
      <div className={styles.studentPanelHeading}>
        <div>
          <span aria-hidden="true">✦</span>
          <h2>Visi &amp; Misi Sekolah</h2>
        </div>
      </div>
      <div className={styles.studentMissionGrid}>
        <div>
          <h3>Visi</h3>
          <p>
            Berkarakter Seperti Yesus Kristus, Berprestasi dalam Ilmu
            Pengetahuan dan Teknologi Serta Mandiri
          </p>
        </div>
        <div>
          <h3>Misi</h3>
          <ol>
            {mission.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
