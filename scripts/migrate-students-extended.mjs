// Migration: Tambah kolom data lengkap siswa ke tabel students (compatible)
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

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
  host: env.MYSQL_HOST, port: Number(env.MYSQL_PORT),
  user: env.MYSQL_USER, password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  ssl: { ca: env.MYSQL_SSL_CA?.replace(/\\n/g, '\n') || fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true }
});

// Columns to add: [field_name, sql_definition]
const toAdd = [
  ["tempat_lahir", "VARCHAR(80) NULL DEFAULT NULL"],
  ["tanggal_lahir", "DATE NULL DEFAULT NULL"],
  ["alamat", "TEXT NULL DEFAULT NULL"],
  ["agama", "VARCHAR(30) NULL DEFAULT NULL"],
  ["wali_murid", "VARCHAR(120) NULL DEFAULT NULL"],
  ["telepon_wali", "VARCHAR(30) NULL DEFAULT NULL"],
  ["hubungan_wali", "VARCHAR(40) NULL DEFAULT NULL"],
  ["pekerjaan_wali", "VARCHAR(80) NULL DEFAULT NULL"],
  ["foto_url", "VARCHAR(255) NULL DEFAULT NULL"],
];

try {
  const [existingCols] = await connection.query("DESCRIBE students");
  const existingFields = existingCols.map(r => r.Field);

  for (const [field, definition] of toAdd) {
    if (existingFields.includes(field)) {
      console.log("⚠ Sudah ada:", field);
    } else {
      await connection.query(`ALTER TABLE students ADD COLUMN ${field} ${definition}`);
      console.log("✓ Ditambah:", field);
    }
  }

  const [rows] = await connection.query("DESCRIBE students");
  console.log("\n✅ Final students schema:");
  rows.forEach(r => console.log(`  ${r.Field} (${r.Type}) default=${r.Default}`));
} finally {
  await connection.end();
}
