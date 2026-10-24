import type { ImportantAnnouncement } from "./types";
import styles from "../../app/page.module.css";

type ImportantAnnouncementsProps = {
  announcements: ImportantAnnouncement[];
  loading?: boolean;
};

export function ImportantAnnouncements({ announcements, loading = false }: ImportantAnnouncementsProps) {
  return (
    <section className={styles.importantAnnouncements} aria-labelledby="important-announcements-heading">
      <div className={styles.importantAnnouncementsHeading}>
        <div>
          <span aria-hidden="true">!</span>
          <div><p>PUSAT INFORMASI</p><h1 id="important-announcements-heading">Pengumuman Penting</h1></div>
        </div>
      </div>
      {loading ? <p className={styles.announcementEmpty}>Memuat pengumuman...</p> : null}
      {!loading && announcements.length === 0 ? <p className={styles.announcementEmpty}>Belum ada pengumuman penting saat ini.</p> : null}
      {!loading && announcements.length > 0 ? (
        <div className={styles.announcementList}>
          {announcements.map((announcement) => (
            <article key={announcement.id} className={styles.importantAnnouncement}>
              <span className={announcement.priority === "urgent" ? styles.announcementUrgentIcon : styles.announcementIcon} aria-hidden="true">!</span>
              <div><h2>{announcement.title}</h2><p>{announcement.message}</p><time>{announcement.publishedAt}</time></div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
