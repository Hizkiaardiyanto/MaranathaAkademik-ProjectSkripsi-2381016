import { RowDataPacket } from "mysql2/promise";
import pool from "./db";
import { hashPassword } from "./password";

export type AuthAccount = {
  email: string;
  aliases?: string[];
  password?: string;
  passwordHash?: string;
  role: string;
  name?: string;
  grade?: string;
  subject?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  studentId?: string;
};

type RegisteredAccountRow = RowDataPacket & {
  email: string;
  password_hash: string;
  role: "Siswa" | "Guru";
  name: string;
  grade: string | null;
  subject: string | null;
  approval_status: "pending" | "approved" | "rejected";
  student_id: string | null;
};

export type NewRegisteredAccount = {
  email: string;
  password: string;
  role: "Siswa" | "Guru";
  name: string;
  grade?: string;
  subject?: string;
  parentName?: string;
  phone?: string;
  nis?: string;
  nisn?: string;
  gender?: "L" | "P";
  registrationId?: string;
};

function builtInAccounts(): AuthAccount[] {
  return [
    {
      email: process.env.ADMIN_EMAIL || "Admin@gmail.com",
      password: process.env.ADMIN_PASSWORD || "12345",
      role: "Administrator",
    },
    {
      email: process.env.HEADMASTER_EMAIL || "kepalasekolah@gmail.com",
      password: process.env.HEADMASTER_PASSWORD || "12345",
      role: "Kepala Sekolah",
    },
    {
      email: process.env.TEACHER_EMAIL || "guru@maranatha.sch.id",
      aliases: ["guru@edunusa.com"],
      password: process.env.TEACHER_PASSWORD || "12345",
      role: "Guru",
      name: process.env.TEACHER_NAME || "Guru Maranatha",
      subject: process.env.TEACHER_SUBJECT || "Matematika",
    },
  ];
}

export async function getAuthAccounts(): Promise<AuthAccount[]> {
  return builtInAccounts();
}

export async function getRegisteredAuthAccount(
  email: string,
): Promise<AuthAccount | undefined> {
  const [rows] = await pool.execute<RegisteredAccountRow[]>(
    "SELECT email, password_hash, role, name, grade, subject, approval_status, student_id FROM portal_accounts WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
  );
  const row = rows[0];
  if (!row) return undefined;
  return {
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    name: row.name,
    grade: row.grade || undefined,
    subject: row.subject || undefined,
    approvalStatus: row.approval_status,
    studentId: row.student_id || undefined,
  };
}

export async function registerAccount(account: NewRegisteredAccount) {
  const email = account.email.trim().toLowerCase();
  const reservedAccount = builtInAccounts().some((item) =>
    [item.email, ...(item.aliases || [])].some(
      (reservedEmail) => reservedEmail.toLowerCase() === email,
    ),
  );
  if (reservedAccount) return false;

  const passwordHash = await hashPassword(account.password);
  await pool.execute(
    "INSERT INTO portal_accounts (email, password_hash, role, name, grade, subject, parent_name, phone, nis, nisn, gender, registration_id, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      email,
      passwordHash,
      account.role,
      account.name.trim(),
      account.grade || null,
      account.subject || null,
      account.parentName || null,
      account.phone || null,
      account.nis?.trim() || null,
      account.nisn?.trim() || null,
      account.gender || null,
      account.registrationId || null,
      account.role === "Siswa" ? "pending" : "approved",
    ],
  );
  return true;
}
