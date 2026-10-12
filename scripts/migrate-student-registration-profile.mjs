import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const projectDirectory = process.cwd();
const environment = {};
for (const line of fs
  .readFileSync(path.join(projectDirectory, ".env.local"), "utf8")
  .split(/\r?\n/)) {
  const separator = line.indexOf("=");
  if (separator < 1 || line.trimStart().startsWith("#")) continue;
  const key = line.slice(0, separator).trim();
  let value = line.slice(separator + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  environment[key] = value.replace(/\\n/g, "\n");
}

const caPath = environment.MYSQL_SSL_CA_PATH
  ? path.resolve(projectDirectory, environment.MYSQL_SSL_CA_PATH)
  : path.join(projectDirectory, "ca.pem");
const connection = await mysql.createConnection({
  host: environment.MYSQL_HOST,
  port: Number(environment.MYSQL_PORT),
  user: environment.MYSQL_USER,
  password: environment.MYSQL_PASSWORD,
  database: environment.MYSQL_DATABASE,
  ssl: {
    ca: environment.MYSQL_SSL_CA || fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  },
  multipleStatements: true,
});

try {
  const migration = fs.readFileSync(
    path.join(
      projectDirectory,
      "database",
      "migrations",
      "002-student-registration-profile.sql",
    ),
    "utf8",
  );
  await connection.query(migration);
  console.log("Migrasi profil pendaftaran siswa berhasil diterapkan.");
} finally {
  await connection.end();
}
