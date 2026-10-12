import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const projectDirectory = process.cwd();

function readEnvironment() {
  const file = path.join(projectDirectory, ".env.local");
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value.replace(/\\n/g, "\n");
  }
  return values;
}

const environment = readEnvironment();
const caPath = environment.MYSQL_SSL_CA_PATH
  ? path.resolve(projectDirectory, environment.MYSQL_SSL_CA_PATH)
  : path.join(projectDirectory, "ca.pem");
const ca = environment.MYSQL_SSL_CA || fs.readFileSync(caPath, "utf8");

const students = [
  ["Ahmad Fauzan", "10001", "0067829145", "Kelas 9", "L"],
  ["Siti Nurhaliza", "10002", "0067829146", "Kelas 9", "P"],
  ["Bima Pratama", "10003", "0067829147", "Kelas 8", "L"],
  ["Nadia Putri", "10004", "0067829148", "Kelas 7", "P"],
  ["Rizky Ramadhan", "10005", "0067829149", "Kelas 6", "L"],
];

const teachers = [
  ["Rina Kurniawati, S.Pd.", "197805122005012001", "Matematika", "0812-3456-7890"],
  ["Andi Saputra, S.Pd.", "198211032006041002", "Bahasa Inggris", "0813-5567-8821"],
  ["Deni Pratama, S.Pd.", "197912212008011003", "Fisika", "0852-1104-9022"],
  ["Maya Sari, S.Pd.", "198507142010012004", "Biologi", "0812-7778-6391"],
];

async function storeRecord(connection, resource, record, matches) {
  const [rows] = await connection.execute(
    "SELECT id, payload FROM app_records WHERE area = 'academic' AND resource = ?",
    [resource],
  );
  const exists = rows.some((row) => {
    const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    return matches(payload);
  });
  if (exists) return false;
  const id = randomUUID();
  await connection.execute(
    "INSERT INTO app_records (area, resource, id, payload) VALUES ('academic', ?, ?, ?)",
    [resource, id, JSON.stringify({ ...record, id })],
  );
  return true;
}

const connection = await mysql.createConnection({
  host: environment.MYSQL_HOST,
  port: Number(environment.MYSQL_PORT),
  user: environment.MYSQL_USER,
  password: environment.MYSQL_PASSWORD,
  database: environment.MYSQL_DATABASE,
  ssl: { ca, rejectUnauthorized: true },
});

try {
  const schema = fs.readFileSync(
    path.join(projectDirectory, "database", "schema.sql"),
    "utf8",
  );
  for (const statement of schema.split(/;\s*(?:\r?\n|$)/)) {
    if (statement.trim()) await connection.query(statement);
  }

  await connection.beginTransaction();
  const studentIds = new Map();
  let addedStudents = 0;
  for (const [name, nis, nisn, className, gender] of students) {
    const [existing] = await connection.execute(
      "SELECT id FROM students WHERE nis = ? LIMIT 1",
      [nis],
    );
    const id = existing[0]?.id || randomUUID();
    if (!existing.length) {
      await connection.execute(
        "INSERT INTO students (id, name, nis, nisn, class_name, gender, status) VALUES (?, ?, ?, ?, ?, ?, 'Aktif')",
        [id, name, nis, nisn, className, gender],
      );
      addedStudents += 1;
    }
    studentIds.set(name, id);
  }

  let addedTeachers = 0;
  for (const [name, nip, subject, phone] of teachers) {
    const [existing] = await connection.execute(
      "SELECT id FROM teachers WHERE nip = ? LIMIT 1",
      [nip],
    );
    if (!existing.length) {
      await connection.execute(
        "INSERT INTO teachers (id, name, nip, subject, phone, status) VALUES (?, ?, ?, ?, ?, 'Aktif')",
        [randomUUID(), name, nip, subject, phone],
      );
      addedTeachers += 1;
    }
  }

  const classes = [
    { nama: "Kelas 9", jenjang: "SMP", wali: "Rina Kurniawati, S.Pd.", jumlah: 2, ruang: "Ruang 201" },
    { nama: "Kelas 8", jenjang: "SMP", wali: "Deni Pratama, S.Pd.", jumlah: 1, ruang: "Ruang 103" },
    { nama: "Kelas 6", jenjang: "SD", wali: "Andi Saputra, S.Pd.", jumlah: 1, ruang: "Ruang 105" },
  ];
  const subjects = [
    { nama: "Matematika", kode: "MTK-09", guru: "Rina Kurniawati, S.Pd." },
    { nama: "Bahasa Indonesia", kode: "BIN-06", guru: "Andi Saputra, S.Pd." },
    { nama: "IPA Terpadu", kode: "IPA-08", guru: "Deni Pratama, S.Pd." },
  ];
  const schedules = [
    { hari: "Senin", jam: "07.00 - 07.40", kelas: "Kelas 9", jenjang: "SMP", mapel: "Matematika", guru: "Rina Kurniawati, S.Pd.", ruang: "Ruang 201" },
    { hari: "Selasa", jam: "07.40 - 08.20", kelas: "Kelas 6", jenjang: "SD", mapel: "Bahasa Indonesia", guru: "Andi Saputra, S.Pd.", ruang: "Ruang 105" },
    { hari: "Rabu", jam: "08.20 - 09.00", kelas: "Kelas 8", jenjang: "SMP", mapel: "IPA Terpadu", guru: "Deni Pratama, S.Pd.", ruang: "Ruang 103" },
  ];
  const grades = [
    { nama: "Ahmad Fauzan", kelas: "Kelas 9", mapel: "Matematika", nilai: 87 },
    { nama: "Siti Nurhaliza", kelas: "Kelas 9", mapel: "Matematika", nilai: 84 },
    { nama: "Bima Pratama", kelas: "Kelas 8", mapel: "IPA Terpadu", nilai: 79 },
  ];
  const attendance = students.map(([nama, , , kelas]) => ({
    nama,
    kelas,
    mapel: kelas === "Kelas 6" ? "Bahasa Indonesia" : kelas === "Kelas 8" ? "IPA Terpadu" : "Matematika",
    tanggal: "2026-10-12",
    status: "Hadir",
    studentId: studentIds.get(nama),
  }));

  let addedRecords = 0;
  for (const item of classes) {
    addedRecords += Number(await storeRecord(connection, "classes", item, (row) => row.nama === item.nama && row.jenjang === item.jenjang));
  }
  for (const item of subjects) {
    addedRecords += Number(await storeRecord(connection, "subjects", item, (row) => row.kode === item.kode));
  }
  for (const item of schedules) {
    addedRecords += Number(await storeRecord(connection, "schedules", item, (row) => row.hari === item.hari && row.jam === item.jam && row.kelas === item.kelas));
  }
  for (const item of grades) {
    const record = { ...item, studentId: studentIds.get(item.nama) };
    addedRecords += Number(await storeRecord(connection, "grades", record, (row) => row.studentId === record.studentId && row.mapel === record.mapel));
  }
  for (const item of attendance) {
    addedRecords += Number(await storeRecord(connection, "attendance", item, (row) => row.studentId === item.studentId && row.tanggal === item.tanggal && row.mapel === item.mapel));
  }

  await connection.commit();
  console.log(JSON.stringify({ addedStudents, addedTeachers, addedAcademicRecords: addedRecords }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
