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
  console.log("Connected to database successfully!");

  // Check columns of portal_accounts
  const [cols] = await connection.query("DESCRIBE portal_accounts");
  console.log("portal_accounts columns:", cols.map(c => c.Field + " (" + c.Type + ")"));

  // Check if teacher_id exists
  const hasTeacherId = cols.some(c => c.Field === "teacher_id");
  if (!hasTeacherId) {
    console.log("Adding teacher_id to portal_accounts...");
    await connection.query("ALTER TABLE portal_accounts ADD COLUMN teacher_id VARCHAR(40) NULL AFTER student_id");
  }

  // Ensure approval_status includes 'inactive'
  console.log("Updating approval_status enum if needed...");
  await connection.query(
    "ALTER TABLE portal_accounts MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'inactive') NOT NULL DEFAULT 'approved'"
  );

  console.log("Database schema for Account Management is ready!");
} catch (err) {
  console.error("Migration error:", err);
} finally {
  await connection.end();
}

