// bulk-register-teachers.mjs
/**
 * Script to bulk‑register all teachers listed in the thesis table.
 * It creates an email address for each teacher (default: <first‑name>@school.id)
 * and uses the NIP as the initial password.
 *
 * Run with:
 *   node scripts/bulk-register-teachers.mjs
 *
 * The script relies on the existing `registerAccount` helper (used by the
 * `/api/teacher-register` endpoint) and on the DB configuration defined in
 * your `.env` file (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
 */

import "dotenv/config";
import { registerAccount } from "@/lib/auth-accounts.js";
import { createPool } from "mysql2/promise";

// ------------------------------------------------------------
// DB pool – same configuration as lib/db.ts
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

// ------------------------------------------------------------
// List of teachers (copied from the table you provided)
const teachers = [
  { name: "Suhartini, A.Md",        nip: "198703112010012005", subject: "Bahasa Inggris",       phone: "0812-3456-7012" },
  { name: "Andi Prayetno, A.Md",    nip: "198506252011011007", subject: "Seni Budaya",         phone: "0812-3456-7010" },
  { name: "Tri Laksono, S.E",       nip: "198007142008011008", subject: "IPA Terpadu",         phone: "0812-3456-7007" },
  { name: "Windarti, SE",           nip: "197509182003012003", subject: "IPS",                 phone: "0812-3456-7004" },
  { name: "Drs. Markus Sumardiyono",nip: "196712051993031003", subject: "PJOK",                phone: "0812-3456-7009" },
  { name: "Drs. Tugiya, S.Pd, M.Si",nip: "196803151994031004", subject: "Bahasa Indonesia",   phone: "0812-3456-7001" },
  { name: "Yohanes Nicolas S, S.Kom",nip: "198801202012011005", subject: "TIK",                 phone: "0812-3456-7003" },
  { name: "Difa Kusuma, S.Pd",      nip: "199008122015021003", subject: "Matematika",          phone: "0812-3456-7011" },
  { name: "Suharmi, S.Pd",          nip: "197904222006042006", subject: "Pendidikan Pancasila",phone: "0812-3456-7005" },
  { name: "Dra. Rohininingsih",      nip: "196611081992032001", subject: "Seni Budaya",         phone: "0812-3456-7006" },
  { name: "Ninik Sumarni, S.Pd",    nip: "198302192009022004", subject: "Bahasa Inggris",       phone: "0812-3456-7008" },
  { name: "Suwardi, S.Pd",          nip: "197205101998021002", subject: "Bahasa Jawa",          phone: "0812-3456-7002" },
  { name: "Kia",                     nip: "213213143125",        subject: "Sastra",              phone: "2131432423" },
  { name: "Deni Pratama, S.Pd.",    nip: "197912212008011003", subject: "Fisika",               phone: "0852-1104-9022" },
  { name: "Maya Sari, S.Pd.",       nip: "198507142010012004", subject: "Biologi",              phone: "0812-7778-6391" },
  { name: "Rina Kurniawati, S.Pd.", nip: "197805122005012001", subject: "Matematika",           phone: "0812-3456-7890" },
  { name: "Andi Saputra, S.Pd.",    nip: "198211032006041002", subject: "Bahasa Inggris",       phone: "0813-5567-8821" },
];

// ------------------------------------------------------------
// Helper to build an email address.
// Change this function if you prefer a different pattern (e.g. `${nip}@gmail.com`).
function emailFor(idx, name) {
  const first = name.split(",")[0].trim().toLowerCase().replace(/\s+/g, ".");
  return `${first}@school.id`;
}

// ------------------------------------------------------------
async function main() {
  console.log(`🚀 Registering ${teachers.length} teachers...`);
  let ok = 0, skipped = 0;

  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    const email = emailFor(i + 1, t.name);
    const password = t.nip; // default password = NIP
    try {
      const registered = await registerAccount({
        email,
        password,
        role: "Guru",
        name: t.name.trim(),
        subject: t.subject.trim(),
        // optional fields such as phone can be added if you extend NewRegisteredAccount
      });
      if (registered) {
        console.log(`✅ ${t.name} → ${email} (pwd = ${password})`);
        ok++;
      } else {
        console.warn(`⚠️  ${t.name} – email already used, skipped.`);
        skipped++;
      }
    } catch (e) {
      console.error(`❌  Error registering ${t.name}:`, e);
    }
  }

  console.log(`\n🔚 Done – successfully registered: ${ok}, already existed: ${skipped}`);
  await pool.end();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

