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
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  ssl: {
    ca: env.MYSQL_SSL_CA || fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  },
});

try {
  const [counts] = await connection.query(
    "SELECT resource, count(*) as count FROM app_records GROUP BY resource"
  );
  console.log("Counts by resource:", counts);

  const [schedules] = await connection.query(
    "SELECT id, payload FROM app_records WHERE resource = 'schedules'"
  );
  const parse = (p) => typeof p === 'string' ? JSON.parse(p) : p;
  console.log("Existing schedules count:", schedules.length);
  console.log("Existing schedules:", schedules.map(s => parse(s.payload)));

  const [teachers] = await connection.query("SELECT * FROM teachers");
  console.log("Teachers in db:", teachers);

  const [classes] = await connection.query(
    "SELECT id, payload FROM app_records WHERE resource = 'classes'"
  );
  console.log("Classes in db:", classes.map(c => parse(c.payload)));

  const [grades] = await connection.query(
    "SELECT id, payload FROM app_records WHERE resource = 'grades'"
  );
  console.log("Grades in db:", grades.map(g => parse(g.payload)));
} finally {
  await connection.end();
}
