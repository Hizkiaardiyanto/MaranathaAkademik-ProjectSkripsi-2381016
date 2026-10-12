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

const officialTeachers = [
  { code: "A", name: "Drs. Tugiya, S.Pd, M.Si", nip: "196803151994031004", subject: "Bahasa Indonesia", phone: "0812-3456-7001" },
  { code: "B", name: "Suwardi, S.Pd", nip: "197205101998021002", subject: "Bahasa Jawa", phone: "0812-3456-7002" },
  { code: "C", name: "Yohanes Nicolas S, S.Kom", nip: "198801202012011005", subject: "TIK", phone: "0812-3456-7003" },
  { code: "D", name: "Windarti, SE", nip: "197509182003012003", subject: "IPS", phone: "0812-3456-7004" },
  { code: "E", name: "Suharmi, S.Pd", nip: "197904222006042006", subject: "Pendidikan Pancasila", phone: "0812-3456-7005" },
  { code: "F", name: "Dra. Rohininingsih", nip: "196611081992032001", subject: "Seni Budaya", phone: "0812-3456-7006" },
  { code: "G", name: "Tri Laksono, S.E", nip: "198007142008011008", subject: "IPA Terpadu", phone: "0812-3456-7007" },
  { code: "H", name: "Ninik Sumarni, S.Pd", nip: "198302192009022004", subject: "Bahasa Inggris", phone: "0812-3456-7008" },
  { code: "I", name: "Drs. Markus Sumardiyono", nip: "196712051993031003", subject: "PJOK", phone: "0812-3456-7009" },
  { code: "J", name: "Andi Prayetno, A.Md", nip: "198506252011011007", subject: "Seni Budaya", phone: "0812-3456-7010" },
  { code: "K", name: "Difa Kusuma, S.Pd", nip: "199008122015021003", subject: "Matematika", phone: "0812-3456-7011" },
  { code: "L", name: "Suhartini, A.Md", nip: "198703112010012005", subject: "Bahasa Inggris", phone: "0812-3456-7012" },
];

const connection = await mysql.createConnection({
  host: environment.MYSQL_HOST,
  port: Number(environment.MYSQL_PORT),
  user: environment.MYSQL_USER,
  password: environment.MYSQL_PASSWORD,
  database: environment.MYSQL_DATABASE,
  ssl: { ca, rejectUnauthorized: true },
});

try {
  await connection.beginTransaction();

  // 1. Insert/Update Teachers
  for (const t of officialTeachers) {
    const [existing] = await connection.execute(
      "SELECT id FROM teachers WHERE name = ? LIMIT 1",
      [t.name],
    );
    if (!existing.length) {
      await connection.execute(
        "INSERT INTO teachers (id, name, nip, subject, phone, status) VALUES (?, ?, ?, ?, ?, 'Aktif')",
        [randomUUID(), t.name, t.nip, t.subject, t.phone],
      );
    }
  }

  // 2. Ensure Kelas 7, Kelas 8, Kelas 9 in classes app_records
  const targetClasses = [
    { nama: "Kelas 7", jenjang: "SMP", wali: "Windarti, SE", ruang: "Ruang VII", jumlah: 24 },
    { nama: "Kelas 8", jenjang: "SMP", wali: "Suwardi, S.Pd", ruang: "Ruang VIII", jumlah: 25 },
    { nama: "Kelas 9", jenjang: "SMP", wali: "Suharmi, S.Pd", ruang: "Ruang IX", jumlah: 26 },
  ];

  for (const cls of targetClasses) {
    const [rows] = await connection.execute(
      "SELECT id, payload FROM app_records WHERE area = 'academic' AND resource = 'classes'",
    );
    const found = rows.some((r) => {
      const p = typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload;
      return p.nama === cls.nama && p.jenjang === cls.jenjang;
    });
    if (!found) {
      const id = randomUUID();
      await connection.execute(
        "INSERT INTO app_records (area, resource, id, payload) VALUES ('academic', 'classes', ?, ?)",
        [id, JSON.stringify({ ...cls, id })],
      );
    }
  }

  // 3. Ensure subjects in app_records
  const targetSubjects = [
    { nama: "Bahasa Indonesia", kode: "BIN-01", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { nama: "Bahasa Jawa", kode: "BJW-02", guru: "Suwardi, S.Pd" },
    { nama: "TIK", kode: "TIK-03", guru: "Yohanes Nicolas S, S.Kom" },
    { nama: "IPS", kode: "IPS-04", guru: "Windarti, SE" },
    { nama: "Pendidikan Pancasila", kode: "PKN-05", guru: "Suharmi, S.Pd" },
    { nama: "Seni Budaya", kode: "SBK-06", guru: "Dra. Rohininingsih" },
    { nama: "IPA Terpadu", kode: "IPA-07", guru: "Tri Laksono, S.E" },
    { nama: "Bahasa Inggris", kode: "BIG-08", guru: "Ninik Sumarni, S.Pd" },
    { nama: "PJOK", kode: "PJK-09", guru: "Drs. Markus Sumardiyono" },
    { nama: "Pendidikan Agama Kristen", kode: "PAK-10", guru: "Drs. Markus Sumardiyono" },
    { nama: "Matematika", kode: "MTK-11", guru: "Difa Kusuma, S.Pd" },
  ];

  for (const sub of targetSubjects) {
    const [rows] = await connection.execute(
      "SELECT id, payload FROM app_records WHERE area = 'academic' AND resource = 'subjects'",
    );
    const found = rows.some((r) => {
      const p = typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload;
      return p.nama === sub.nama;
    });
    if (!found) {
      const id = randomUUID();
      await connection.execute(
        "INSERT INTO app_records (area, resource, id, payload) VALUES ('academic', 'subjects', ?, ?)",
        [id, JSON.stringify({ ...sub, id })],
      );
    }
  }

  // 4. Seed official SMP schedules
  const rawSchedules = [
    // SENIN
    { hari: "Senin", jam: "07.00 - 07.40", kelas: "Kelas 7", mapel: "Upacara", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Senin", jam: "07.00 - 07.40", kelas: "Kelas 8", mapel: "Upacara", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Senin", jam: "07.00 - 07.40", kelas: "Kelas 9", mapel: "Upacara", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Senin", jam: "07.40 - 08.20", kelas: "Kelas 7", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Senin", jam: "07.40 - 08.20", kelas: "Kelas 8", mapel: "IPS", guru: "Tri Laksono, S.E" },
    { hari: "Senin", jam: "07.40 - 08.20", kelas: "Kelas 9", mapel: "Bahasa Inggris", guru: "Ninik Sumarni, S.Pd" },
    { hari: "Senin", jam: "08.20 - 09.00", kelas: "Kelas 7", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Senin", jam: "08.20 - 09.00", kelas: "Kelas 8", mapel: "IPS", guru: "Tri Laksono, S.E" },
    { hari: "Senin", jam: "08.20 - 09.00", kelas: "Kelas 9", mapel: "Bahasa Inggris", guru: "Ninik Sumarni, S.Pd" },
    { hari: "Senin", jam: "09.15 - 09.55", kelas: "Kelas 7", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Senin", jam: "09.15 - 09.55", kelas: "Kelas 8", mapel: "Bahasa Jawa", guru: "Suwardi, S.Pd" },
    { hari: "Senin", jam: "09.15 - 09.55", kelas: "Kelas 9", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Senin", jam: "09.55 - 10.35", kelas: "Kelas 7", mapel: "IPS", guru: "Windarti, SE" },
    { hari: "Senin", jam: "09.55 - 10.35", kelas: "Kelas 8", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Senin", jam: "09.55 - 10.35", kelas: "Kelas 9", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Senin", jam: "10.35 - 11.15", kelas: "Kelas 7", mapel: "IPS", guru: "Windarti, SE" },
    { hari: "Senin", jam: "10.35 - 11.15", kelas: "Kelas 8", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Senin", jam: "10.35 - 11.15", kelas: "Kelas 9", mapel: "Bahasa Jawa", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Senin", jam: "11.30 - 12.10", kelas: "Kelas 7", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Senin", jam: "11.30 - 12.10", kelas: "Kelas 8", mapel: "Bahasa Jawa", guru: "Suwardi, S.Pd" },
    { hari: "Senin", jam: "11.30 - 12.10", kelas: "Kelas 9", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Senin", jam: "12.10 - 12.50", kelas: "Kelas 7", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Senin", jam: "12.10 - 12.50", kelas: "Kelas 8", mapel: "TIK", guru: "Yohanes Nicolas S, S.Kom" },
    { hari: "Senin", jam: "12.10 - 12.50", kelas: "Kelas 9", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Senin", jam: "12.50 - 13.30", kelas: "Kelas 7", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Senin", jam: "12.50 - 13.30", kelas: "Kelas 8", mapel: "TIK", guru: "Yohanes Nicolas S, S.Kom" },
    { hari: "Senin", jam: "12.50 - 13.30", kelas: "Kelas 9", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },

    // SELASA
    { hari: "Selasa", jam: "07.00 - 07.40", kelas: "Kelas 7", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "07.00 - 07.40", kelas: "Kelas 8", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "07.00 - 07.40", kelas: "Kelas 9", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "07.40 - 08.20", kelas: "Kelas 7", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "07.40 - 08.20", kelas: "Kelas 8", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "07.40 - 08.20", kelas: "Kelas 9", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "08.20 - 09.00", kelas: "Kelas 7", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "08.20 - 09.00", kelas: "Kelas 8", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "08.20 - 09.00", kelas: "Kelas 9", mapel: "PJOK", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "09.15 - 09.55", kelas: "Kelas 7", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Selasa", jam: "09.15 - 09.55", kelas: "Kelas 8", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Selasa", jam: "09.15 - 09.55", kelas: "Kelas 9", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "09.55 - 10.35", kelas: "Kelas 7", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Selasa", jam: "09.55 - 10.35", kelas: "Kelas 8", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Selasa", jam: "09.55 - 10.35", kelas: "Kelas 9", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "10.35 - 11.15", kelas: "Kelas 7", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Selasa", jam: "10.35 - 11.15", kelas: "Kelas 8", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Selasa", jam: "10.35 - 11.15", kelas: "Kelas 9", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Selasa", jam: "11.30 - 12.10", kelas: "Kelas 7", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Selasa", jam: "11.30 - 12.10", kelas: "Kelas 8", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Selasa", jam: "11.30 - 12.10", kelas: "Kelas 9", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Selasa", jam: "12.10 - 12.50", kelas: "Kelas 7", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Selasa", jam: "12.10 - 12.50", kelas: "Kelas 8", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Selasa", jam: "12.10 - 12.50", kelas: "Kelas 9", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Selasa", jam: "12.50 - 13.30", kelas: "Kelas 7", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Selasa", jam: "12.50 - 13.30", kelas: "Kelas 8", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Selasa", jam: "12.50 - 13.30", kelas: "Kelas 9", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },

    // RABU
    { hari: "Rabu", jam: "07.00 - 07.40", kelas: "Kelas 7", mapel: "CHAPEL", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "07.00 - 07.40", kelas: "Kelas 8", mapel: "CHAPEL", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "07.00 - 07.40", kelas: "Kelas 9", mapel: "CHAPEL", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "07.40 - 08.20", kelas: "Kelas 7", mapel: "Bahasa Inggris", guru: "Andi Prayetno, A.Md" },
    { hari: "Rabu", jam: "07.40 - 08.20", kelas: "Kelas 8", mapel: "Bahasa Inggris", guru: "Suhartini, A.Md" },
    { hari: "Rabu", jam: "07.40 - 08.20", kelas: "Kelas 9", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Rabu", jam: "08.20 - 09.00", kelas: "Kelas 7", mapel: "Bahasa Inggris", guru: "Andi Prayetno, A.Md" },
    { hari: "Rabu", jam: "08.20 - 09.00", kelas: "Kelas 8", mapel: "Bahasa Inggris", guru: "Suhartini, A.Md" },
    { hari: "Rabu", jam: "08.20 - 09.00", kelas: "Kelas 9", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Rabu", jam: "09.15 - 09.55", kelas: "Kelas 7", mapel: "Bahasa Inggris", guru: "Andi Prayetno, A.Md" },
    { hari: "Rabu", jam: "09.15 - 09.55", kelas: "Kelas 8", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "09.15 - 09.55", kelas: "Kelas 9", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Rabu", jam: "09.55 - 10.35", kelas: "Kelas 7", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Rabu", jam: "09.55 - 10.35", kelas: "Kelas 8", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "09.55 - 10.35", kelas: "Kelas 9", mapel: "Bahasa Jawa", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Rabu", jam: "10.35 - 11.15", kelas: "Kelas 7", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Rabu", jam: "10.35 - 11.15", kelas: "Kelas 8", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "10.35 - 11.15", kelas: "Kelas 9", mapel: "Bahasa Inggris", guru: "Ninik Sumarni, S.Pd" },
    { hari: "Rabu", jam: "11.30 - 12.10", kelas: "Kelas 7", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "11.30 - 12.10", kelas: "Kelas 8", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Rabu", jam: "11.30 - 12.10", kelas: "Kelas 9", mapel: "Bahasa Inggris", guru: "Ninik Sumarni, S.Pd" },
    { hari: "Rabu", jam: "12.10 - 12.50", kelas: "Kelas 7", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "12.10 - 12.50", kelas: "Kelas 8", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Rabu", jam: "12.10 - 12.50", kelas: "Kelas 9", mapel: "IPS", guru: "Tri Laksono, S.E" },
    { hari: "Rabu", jam: "12.50 - 13.30", kelas: "Kelas 7", mapel: "Pendidikan Agama Kristen", guru: "Drs. Markus Sumardiyono" },
    { hari: "Rabu", jam: "12.50 - 13.30", kelas: "Kelas 8", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Rabu", jam: "12.50 - 13.30", kelas: "Kelas 9", mapel: "IPS", guru: "Tri Laksono, S.E" },

    // KAMIS
    { hari: "Kamis", jam: "07.00 - 07.40", kelas: "Kelas 7", mapel: "IPS", guru: "Windarti, SE" },
    { hari: "Kamis", jam: "07.00 - 07.40", kelas: "Kelas 8", mapel: "Seni Budaya", guru: "Suwardi, S.Pd" },
    { hari: "Kamis", jam: "07.00 - 07.40", kelas: "Kelas 9", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Kamis", jam: "07.40 - 08.20", kelas: "Kelas 7", mapel: "IPS", guru: "Windarti, SE" },
    { hari: "Kamis", jam: "07.40 - 08.20", kelas: "Kelas 8", mapel: "Seni Budaya", guru: "Suwardi, S.Pd" },
    { hari: "Kamis", jam: "07.40 - 08.20", kelas: "Kelas 9", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Kamis", jam: "08.20 - 09.00", kelas: "Kelas 7", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Kamis", jam: "08.20 - 09.00", kelas: "Kelas 8", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Kamis", jam: "08.20 - 09.00", kelas: "Kelas 9", mapel: "IPS", guru: "Tri Laksono, S.E" },
    { hari: "Kamis", jam: "09.15 - 09.55", kelas: "Kelas 7", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Kamis", jam: "09.15 - 09.55", kelas: "Kelas 8", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Kamis", jam: "09.15 - 09.55", kelas: "Kelas 9", mapel: "IPS", guru: "Tri Laksono, S.E" },
    { hari: "Kamis", jam: "09.55 - 10.35", kelas: "Kelas 7", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Kamis", jam: "09.55 - 10.35", kelas: "Kelas 8", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Kamis", jam: "09.55 - 10.35", kelas: "Kelas 9", mapel: "Seni Budaya", guru: "Andi Prayetno, A.Md" },
    { hari: "Kamis", jam: "10.35 - 11.15", kelas: "Kelas 7", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Kamis", jam: "10.35 - 11.15", kelas: "Kelas 8", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Kamis", jam: "10.35 - 11.15", kelas: "Kelas 9", mapel: "Seni Budaya", guru: "Andi Prayetno, A.Md" },
    { hari: "Kamis", jam: "11.30 - 12.10", kelas: "Kelas 7", mapel: "Matematika", guru: "Difa Kusuma, S.Pd" },
    { hari: "Kamis", jam: "11.30 - 12.10", kelas: "Kelas 8", mapel: "IPA Terpadu", guru: "Tri Laksono, S.E" },
    { hari: "Kamis", jam: "11.30 - 12.10", kelas: "Kelas 9", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Kamis", jam: "12.10 - 12.50", kelas: "Kelas 7", mapel: "Seni Budaya", guru: "Dra. Rohininingsih" },
    { hari: "Kamis", jam: "12.10 - 12.50", kelas: "Kelas 8", mapel: "IPS", guru: "Tri Laksono, S.E" },
    { hari: "Kamis", jam: "12.10 - 12.50", kelas: "Kelas 9", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Kamis", jam: "12.50 - 13.30", kelas: "Kelas 7", mapel: "Seni Budaya", guru: "Dra. Rohininingsih" },
    { hari: "Kamis", jam: "12.50 - 13.30", kelas: "Kelas 8", mapel: "IPS", guru: "Tri Laksono, S.E" },
    { hari: "Kamis", jam: "12.50 - 13.30", kelas: "Kelas 9", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },

    // JUMAT
    { hari: "Jumat", jam: "07.00 - 07.40", kelas: "Kelas 7", mapel: "JUMAT SEHAT", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "07.00 - 07.40", kelas: "Kelas 8", mapel: "JUMAT SEHAT", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "07.00 - 07.40", kelas: "Kelas 9", mapel: "JUMAT SEHAT", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "07.40 - 08.20", kelas: "Kelas 7", mapel: "Bahasa Inggris", guru: "Andi Prayetno, A.Md" },
    { hari: "Jumat", jam: "07.40 - 08.20", kelas: "Kelas 8", mapel: "Bahasa Inggris", guru: "Suhartini, A.Md" },
    { hari: "Jumat", jam: "07.40 - 08.20", kelas: "Kelas 9", mapel: "TIK", guru: "Yohanes Nicolas S, S.Kom" },
    { hari: "Jumat", jam: "08.20 - 09.00", kelas: "Kelas 7", mapel: "Bahasa Jawa", guru: "Suwardi, S.Pd" },
    { hari: "Jumat", jam: "08.20 - 09.00", kelas: "Kelas 8", mapel: "Bahasa Inggris", guru: "Suhartini, A.Md" },
    { hari: "Jumat", jam: "08.20 - 09.00", kelas: "Kelas 9", mapel: "TIK", guru: "Yohanes Nicolas S, S.Kom" },
    { hari: "Jumat", jam: "09.15 - 09.55", kelas: "Kelas 7", mapel: "Bahasa Jawa", guru: "Suwardi, S.Pd" },
    { hari: "Jumat", jam: "09.15 - 09.55", kelas: "Kelas 8", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Jumat", jam: "09.15 - 09.55", kelas: "Kelas 9", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Jumat", jam: "09.55 - 10.35", kelas: "Kelas 7", mapel: "TIK", guru: "Yohanes Nicolas S, S.Kom" },
    { hari: "Jumat", jam: "09.55 - 10.35", kelas: "Kelas 8", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Jumat", jam: "09.55 - 10.35", kelas: "Kelas 9", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Jumat", jam: "10.35 - 11.15", kelas: "Kelas 7", mapel: "TIK", guru: "Yohanes Nicolas S, S.Kom" },
    { hari: "Jumat", jam: "10.35 - 11.15", kelas: "Kelas 8", mapel: "Pendidikan Pancasila", guru: "Suharmi, S.Pd" },
    { hari: "Jumat", jam: "10.35 - 11.15", kelas: "Kelas 9", mapel: "Bahasa Indonesia", guru: "Drs. Tugiya, S.Pd, M.Si" },
    { hari: "Jumat", jam: "11.30 - 12.10", kelas: "Kelas 7", mapel: "PRAMUKA", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "11.30 - 12.10", kelas: "Kelas 8", mapel: "PRAMUKA", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "11.30 - 12.10", kelas: "Kelas 9", mapel: "PRAMUKA", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "12.10 - 12.50", kelas: "Kelas 7", mapel: "KP", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "12.10 - 12.50", kelas: "Kelas 8", mapel: "KP", guru: "Drs. Markus Sumardiyono" },
    { hari: "Jumat", jam: "12.10 - 12.50", kelas: "Kelas 9", mapel: "KP", guru: "Drs. Markus Sumardiyono" },

    // SABTU
    { hari: "Sabtu", jam: "07.00 - 07.40", kelas: "Kelas 7", mapel: "PGM Minggu - I", guru: "Drs. Markus Sumardiyono" },
    { hari: "Sabtu", jam: "07.40 - 08.20", kelas: "Kelas 7", mapel: "PGM Minggu - I", guru: "Drs. Markus Sumardiyono" },
    { hari: "Sabtu", jam: "08.20 - 09.00", kelas: "Kelas 7", mapel: "PGM Minggu - I", guru: "Drs. Markus Sumardiyono" },
    { hari: "Sabtu", jam: "09.15 - 09.55", kelas: "Kelas 7", mapel: "PGM Minggu - I", guru: "Drs. Markus Sumardiyono" },
    { hari: "Sabtu", jam: "09.55 - 10.35", kelas: "Kelas 7", mapel: "PGM Minggu - I", guru: "Drs. Markus Sumardiyono" },
    { hari: "Sabtu", jam: "10.35 - 11.15", kelas: "Kelas 7", mapel: "PGM Minggu - I", guru: "Drs. Markus Sumardiyono" },
  ];

  // Insert schedules if not exists
  let addedSchedules = 0;
  const [existingSchedRows] = await connection.execute(
    "SELECT id, payload FROM app_records WHERE area = 'academic' AND resource = 'schedules'",
  );
  const existingList = existingSchedRows.map((r) =>
    typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload,
  );

  for (const s of rawSchedules) {
    const found = existingList.some(
      (e) => e.hari === s.hari && e.jam === s.jam && e.kelas === s.kelas,
    );
    if (!found) {
      const id = randomUUID();
      const payload = {
        ...s,
        jenjang: "SMP",
        ruang: s.kelas === "Kelas 7" ? "Ruang VII" : s.kelas === "Kelas 8" ? "Ruang VIII" : "Ruang IX",
        id,
      };
      await connection.execute(
        "INSERT INTO app_records (area, resource, id, payload) VALUES ('academic', 'schedules', ?, ?)",
        [id, JSON.stringify(payload)],
      );
      addedSchedules += 1;
    }
  }

  await connection.commit();
  console.log(`Sinkronisasi guru, mapel, dan ${addedSchedules} jadwal resmi SMP Maranatha berhasil.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
