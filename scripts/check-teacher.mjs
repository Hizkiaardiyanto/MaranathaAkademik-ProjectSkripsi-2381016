import "dotenv/config";
import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function main(){
  const conn = await pool.getConnection();
  const email = "suhartini@school.id"; // lower‑case will be trimmed in login
  const [rows] = await conn.execute(
    "SELECT id,email,role,approval_status,password_hash FROM portal_accounts WHERE email = ?",
    [email]
  );
  console.log("Rows:", rows);
  conn.release();
  await pool.end();
}

main().catch(e=>{console.error(e);});

