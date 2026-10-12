import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const projectDirectory = process.cwd();
const values = {};
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
  values[key] = value.replace(/\\n/g, "\n");
}

const caPath = values.MYSQL_SSL_CA_PATH
  ? path.resolve(projectDirectory, values.MYSQL_SSL_CA_PATH)
  : path.join(projectDirectory, "ca.pem");
const connection = await mysql.createConnection({
  host: values.MYSQL_HOST,
  port: Number(values.MYSQL_PORT),
  user: values.MYSQL_USER,
  password: values.MYSQL_PASSWORD,
  database: values.MYSQL_DATABASE,
  ssl: {
    ca: values.MYSQL_SSL_CA || fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  },
});

function normalizeClassName(value) {
  return typeof value === "string"
    ? value.replace(/^(Kelas\s+\d+)\s*[A-Za-z]$/i, "$1")
    : value;
}

function normalizeSchedule(record) {
  const next = { ...record, kelas: normalizeClassName(record.kelas) };
  const updates = [
    ["Senin", "Kelas 9", "Matematika", "07.00 - 08.30", "07.00 - 07.40"],
    ["Selasa", "Kelas 6", "Bahasa Indonesia", "08.45 - 10.15", "07.40 - 08.20"],
    ["Rabu", "Kelas 8", "IPA Terpadu", "10.30 - 12.00", "08.20 - 09.00"],
  ];
  const update = updates.find(
    ([hari, kelas, mapel, previousTime]) =>
      next.hari === hari &&
      next.kelas === kelas &&
      next.mapel === mapel &&
      next.jam === previousTime,
  );
  return update ? { ...next, jam: update[4] } : next;
}

try {
  await connection.beginTransaction();
  const [students] = await connection.query(
    "SELECT id, class_name FROM students WHERE class_name REGEXP '^Kelas[[:space:]]+[0-9]+[[:alpha:]]$'",
  );
  let changedStudents = 0;
  for (const student of students) {
    const className = normalizeClassName(student.class_name);
    if (className !== student.class_name) {
      await connection.execute("UPDATE students SET class_name = ? WHERE id = ?", [
        className,
        student.id,
      ]);
      changedStudents += 1;
    }
  }

  const [records] = await connection.query(
    "SELECT resource, id, payload FROM app_records WHERE area = 'academic'",
  );
  let changedRecords = 0;
  for (const row of records) {
    const current =
      typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    let next = { ...current };
    if (row.resource === "classes") {
      next.nama = normalizeClassName(current.nama);
    } else if (row.resource === "schedules") {
      next = normalizeSchedule(current);
    } else if (["grades", "attendance"].includes(row.resource)) {
      next.kelas = normalizeClassName(current.kelas);
    }
    if (JSON.stringify(next) !== JSON.stringify(current)) {
      await connection.execute(
        "UPDATE app_records SET payload = ? WHERE area = 'academic' AND resource = ? AND id = ?",
        [JSON.stringify(next), row.resource, row.id],
      );
      changedRecords += 1;
    }
  }
  await connection.commit();
  console.log(JSON.stringify({ changedStudents, changedAcademicRecords: changedRecords }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
