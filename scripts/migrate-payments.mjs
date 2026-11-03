import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";

const projectDirectory = process.cwd();
const env = {};
fs.readFileSync(path.join(projectDirectory, ".env.local"), "utf8")
  .split(/\r?\n/)
  .forEach((line) => {
    const idx = line.indexOf("=");
    if (idx > 0 && !line.trimStart().startsWith("#")) {
      env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
  });

const caPath = env.MYSQL_SSL_CA_PATH
  ? path.resolve(projectDirectory, env.MYSQL_SSL_CA_PATH)
  : path.join(projectDirectory, "ca.pem");

const connection = await mysql.createConnection({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  ssl: {
    ca: env.MYSQL_SSL_CA?.replace(/\\n/g, "\n") || fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  },
});

try {
  console.log("Connected to MySQL. Creating student_payments table if not exists...");
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS student_payments (
      id VARCHAR(50) PRIMARY KEY,
      student_id VARCHAR(50) NULL,
      nis VARCHAR(30) NOT NULL,
      nama_siswa VARCHAR(120) NOT NULL,
      kelas VARCHAR(30) NOT NULL,
      jenis_pembayaran VARCHAR(60) NOT NULL DEFAULT 'SPP Bulanan',
      pos_pembayaran VARCHAR(50) DEFAULT 'SPP',
      bulan VARCHAR(30) NOT NULL,
      tahun_ajaran VARCHAR(20) NOT NULL DEFAULT '2026/2027',
      nominal DECIMAL(12,2) NOT NULL DEFAULT 250000.00,
      status ENUM('Lunas', 'Belum Lunas') NOT NULL DEFAULT 'Belum Lunas',
      tanggal_bayar DATE NULL,
      metode_pembayaran VARCHAR(60) NULL,
      nomor_kwitansi VARCHAR(50) NULL,
      keterangan TEXT NULL,
      petugas VARCHAR(80) DEFAULT 'Admin TU',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_payments_student_id (student_id),
      INDEX idx_payments_nis (nis),
      INDEX idx_payments_kelas (kelas),
      INDEX idx_payments_status (status),
      INDEX idx_payments_bulan (bulan)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log("student_payments table verified/created.");

  // Check existing payments
  const [existingPayments] = await connection.query("SELECT COUNT(*) as count FROM student_payments");
  console.log("Current payments count:", existingPayments[0].count);

  if (existingPayments[0].count === 0) {
    console.log("Seeding initial student payments...");
    // Fetch all students
    const [students] = await connection.query("SELECT id, name, nis, class_name FROM students");
    console.log("Found students:", students.length);

    const months = [
      { bulan: "Juli 2026", defaultStatus: "Lunas", bayarOffset: -90 },
      { bulan: "Agustus 2026", defaultStatus: "Lunas", bayarOffset: -60 },
      { bulan: "September 2026", defaultStatus: "Lunas", bayarOffset: -30 },
      { bulan: "Oktober 2026", defaultStatus: "Lunas", bayarOffset: -10 },
      { bulan: "November 2026", defaultStatus: "Lunas", bayarOffset: -2 },
      { bulan: "Desember 2026", defaultStatus: "Belum Lunas", bayarOffset: null },
    ];

    let kwitansiCounter = 1001;

    for (const student of students) {
      // Determine standard SPP nominal based on grade level
      const isSMP = student.class_name.toLowerCase().includes("7") ||
                    student.class_name.toLowerCase().includes("8") ||
                    student.class_name.toLowerCase().includes("9");
      const sppNominal = isSMP ? 300000 : 250000;

      // Seed SPP monthly fees
      for (const m of months) {
        // Hizkia Julio Ardiyanto gets Lunas for November as well, while others vary
        let status = m.defaultStatus;
        if (m.bulan === "November 2026") {
          status = (student.name.includes("Hizkia") || student.nis === "1001" || Math.random() > 0.3) ? "Lunas" : "Belum Lunas";
        }
        if (m.bulan === "Desember 2026") {
          status = "Belum Lunas";
        }

        const isLunas = status === "Lunas";
        const tanggalBayar = isLunas ? new Date(Date.now() + (m.bayarOffset || 0) * 86400000).toISOString().slice(0, 10) : null;
        const kwitansi = isLunas ? `KW-${m.bulan.slice(0, 3).toUpperCase()}-${kwitansiCounter++}` : null;
        const metode = isLunas ? (kwitansiCounter % 2 === 0 ? "Transfer Bank BRI" : "Tunai (Kasir TU)") : null;

        await connection.execute(`
          INSERT INTO student_payments (
            id, student_id, nis, nama_siswa, kelas, jenis_pembayaran, pos_pembayaran,
            bulan, tahun_ajaran, nominal, status, tanggal_bayar, metode_pembayaran, nomor_kwitansi, keterangan, petugas
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          randomUUID(),
          student.id,
          student.nis,
          student.name,
          student.class_name,
          "SPP Bulanan",
          "SPP",
          m.bulan,
          "2026/2027",
          sppNominal,
          status,
          tanggalBayar,
          metode,
          kwitansi,
          isLunas ? `Pembayaran SPP Bulan ${m.bulan} telah diverifikasi bendahara.` : `Menunggu pembayaran SPP Bulan ${m.bulan}.`,
          "Bendahara Maranatha",
        ]);
      }

      // Also seed an additional one-time fee: "Uang Kegiatan & Sarpras"
      const sarprasLunas = true;
      await connection.execute(`
        INSERT INTO student_payments (
          id, student_id, nis, nama_siswa, kelas, jenis_pembayaran, pos_pembayaran,
          bulan, tahun_ajaran, nominal, status, tanggal_bayar, metode_pembayaran, nomor_kwitansi, keterangan, petugas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        randomUUID(),
        student.id,
        student.nis,
        student.name,
        student.class_name,
        "Uang Kegiatan & Sarpras",
        "Sarpras",
        "Semester Ganjil 2026",
        "2026/2027",
        500000,
        sarprasLunas ? "Lunas" : "Belum Lunas",
        "2026-07-15",
        "Transfer Bank BRI",
        `KW-ACT-${kwitansiCounter++}`,
        "Kegiatan Pramuka, PGM, dan Pengembangan Laboratorium Komputer.",
        "Bendahara Maranatha",
      ]);
    }

    console.log("Seeding completed successfully!");
  } else {
    console.log("Table student_payments already has data.");
  }
} finally {
  await connection.end();
}

