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

try {
  const [rows] = await connection.query("DESCRIBE students");
  console.log("students columns:", JSON.stringify(rows, null, 2));
  const [portRows] = await connection.query("DESCRIBE portal_accounts");
  console.log("portal_accounts columns:", JSON.stringify(portRows, null, 2));
} finally {
  await connection.end();
}

