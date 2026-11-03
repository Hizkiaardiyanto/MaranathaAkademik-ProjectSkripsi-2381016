import { SchoolShell } from "@/components/school-shell";
import { PaymentManager } from "@/components/payment-manager";
import styles from "../page.module.css";

export const metadata = {
  title: "Administrasi & SPP - SD - SMP Maranatha",
  description: "Pengelolaan keuangan, SPP, dan administrasi sekolah SD - SMP Maranatha",
};

export default function AdministrasiPage() {
  return (
    <SchoolShell title="Administrasi & SPP" activeItem="Administrasi & SPP">
      <section className={styles.page}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>KEUANGAN & ADMINISTRASI</p>
            <h1>Administrasi & SPP Sekolah</h1>
          </div>
        </div>

        <PaymentManager />
      </section>
    </SchoolShell>
  );
}

