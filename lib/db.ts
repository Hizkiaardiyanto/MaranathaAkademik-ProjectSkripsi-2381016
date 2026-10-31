import { randomUUID } from "node:crypto";
import mysql, { RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

const caCertificatePath = process.env.MYSQL_SSL_CA_PATH
  ? path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      process.env.MYSQL_SSL_CA_PATH,
    )
  : path.join(process.cwd(), "ca.pem");
const caCertificate = process.env.MYSQL_SSL_CA
  ? process.env.MYSQL_SSL_CA.replace(/\\n/g, "\n")
  : fs.readFileSync(caCertificatePath, "utf8");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: {
    ca: caCertificate,
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 5_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export default pool;

export type Student = {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  className: string;
  gender: "L" | "P";
  status: string;
  // Data tambahan siswa
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  agama?: string;
  waliMurid?: string;
  teleponWali?: string;
  hubunganWali?: string;
  pekerjaanWali?: string;
  fotoUrl?: string;
};

export type Teacher = {
  id: string;
  name: string;
  nip: string;
  subject: string;
  phone: string;
  status: string;
  // Extended fields
  alamat?: string;
  pendidikanTerakhir?: string;
  jurusan?: string;
  gelar?: string;
  gender?: "L" | "P";
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  email?: string;
  statusKepegawaian?: string;
};

type StudentRow = RowDataPacket & {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  class_name: string;
  gender: "L" | "P";
  status: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  agama: string | null;
  wali_murid: string | null;
  telepon_wali: string | null;
  hubungan_wali: string | null;
  pekerjaan_wali: string | null;
  foto_url: string | null;
};

type TeacherRow = RowDataPacket & {
  id: string;
  name: string;
  nip: string;
  subject: string;
  phone: string;
  status: string;
  alamat: string | null;
  pendidikan_terakhir: string | null;
  jurusan: string | null;
  gelar: string | null;
  gender: "L" | "P" | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  agama: string | null;
  email: string | null;
  status_kepegawaian: string | null;
};

async function ensurePool() {
  const requiredSettings = [
    "MYSQL_HOST",
    "MYSQL_PORT",
    "MYSQL_USER",
    "MYSQL_DATABASE",
  ] as const;
  const missing = requiredSettings.filter(
    (setting) => !process.env[setting]?.trim(),
  );
  if (missing.length) {
    throw new Error(`Konfigurasi database belum lengkap: ${missing.join(", ")}`);
  }

  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
  return pool;
}

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    nis: row.nis,
    nisn: row.nisn,
    className: row.class_name,
    gender: row.gender,
    status: row.status,
    tempatLahir: row.tempat_lahir ?? undefined,
    tanggalLahir: row.tanggal_lahir ?? undefined,
    alamat: row.alamat ?? undefined,
    agama: row.agama ?? undefined,
    waliMurid: row.wali_murid ?? undefined,
    teleponWali: row.telepon_wali ?? undefined,
    hubunganWali: row.hubungan_wali ?? undefined,
    pekerjaanWali: row.pekerjaan_wali ?? undefined,
    fotoUrl: row.foto_url ?? undefined,
  };
}

function mapTeacher(row: TeacherRow): Teacher {
  return {
    id: row.id,
    name: row.name,
    nip: row.nip,
    subject: row.subject,
    phone: row.phone,
    status: row.status,
    alamat: row.alamat ?? undefined,
    pendidikanTerakhir: row.pendidikan_terakhir ?? undefined,
    jurusan: row.jurusan ?? undefined,
    gelar: row.gelar ?? undefined,
    gender: (row.gender as "L" | "P") ?? undefined,
    tempatLahir: row.tempat_lahir ?? undefined,
    tanggalLahir: row.tanggal_lahir ?? undefined,
    agama: row.agama ?? undefined,
    email: row.email ?? undefined,
    statusKepegawaian: row.status_kepegawaian ?? undefined,
  };
}

export async function getStudents(): Promise<Student[]> {
  const connection = await ensurePool();
  const [rows] = await connection.query<StudentRow[]>(
    "SELECT * FROM students ORDER BY created_at DESC",
  );
  return rows.map(mapStudent);
}

export async function createStudent(input: Partial<Student>) {
  const student: Student = {
    id: randomUUID(),
    name: input.name?.trim() || "",
    nis: input.nis?.trim() || "",
    nisn: input.nisn?.trim() || "",
    className: input.className?.trim() || "",
    gender: input.gender || "L",
    status: input.status?.trim() || "Aktif",
  };
  const connection = await ensurePool();
  await connection.execute(
    "INSERT INTO students (id, name, nis, nisn, class_name, gender, status, tempat_lahir, tanggal_lahir, alamat, agama, wali_murid, telepon_wali, hubungan_wali, pekerjaan_wali, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      student.id,
      student.name,
      student.nis,
      student.nisn,
      student.className,
      student.gender,
      student.status,
      input.tempatLahir?.trim() || null,
      input.tanggalLahir || null,
      input.alamat?.trim() || null,
      input.agama?.trim() || null,
      input.waliMurid?.trim() || null,
      input.teleponWali?.trim() || null,
      input.hubunganWali?.trim() || null,
      input.pekerjaanWali?.trim() || null,
      input.fotoUrl?.trim() || null,
    ],
  );
  return student;
}

export async function updateStudent(
  id: string,
  input: Partial<Student>,
): Promise<Student | null> {
  const connection = await ensurePool();
  const [rows] = await connection.execute<StudentRow[]>(
    "SELECT * FROM students WHERE id = ? LIMIT 1",
    [id],
  );
  const current = rows[0];
  if (!current) return null;

  const student = {
    ...mapStudent(current),
    ...input,
    id,
  };
  await connection.execute(
    "UPDATE students SET name = ?, nis = ?, nisn = ?, class_name = ?, gender = ?, status = ?, tempat_lahir = ?, tanggal_lahir = ?, alamat = ?, agama = ?, wali_murid = ?, telepon_wali = ?, hubungan_wali = ?, pekerjaan_wali = ?, foto_url = ? WHERE id = ?",
    [
      student.name,
      student.nis,
      student.nisn,
      student.className,
      student.gender,
      student.status,
      input.tempatLahir?.trim() ?? current.tempat_lahir ?? null,
      input.tanggalLahir ?? current.tanggal_lahir ?? null,
      input.alamat?.trim() ?? current.alamat ?? null,
      input.agama?.trim() ?? current.agama ?? null,
      input.waliMurid?.trim() ?? current.wali_murid ?? null,
      input.teleponWali?.trim() ?? current.telepon_wali ?? null,
      input.hubunganWali?.trim() ?? current.hubungan_wali ?? null,
      input.pekerjaanWali?.trim() ?? current.pekerjaan_wali ?? null,
      input.fotoUrl?.trim() ?? current.foto_url ?? null,
      id,
    ],
  );
  return student;
}

export async function deleteStudent(id: string) {
  const connection = await ensurePool();
  const transaction = await connection.getConnection();
  try {
    await transaction.beginTransaction();
    await transaction.execute(
      "UPDATE portal_accounts SET student_id = NULL, approval_status = 'pending' WHERE student_id = ?",
      [id],
    );
    const [result] = await transaction.execute<ResultSetHeader>(
      "DELETE FROM students WHERE id = ?",
      [id],
    );
    await transaction.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.release();
  }
}

export async function getTeachers(): Promise<Teacher[]> {
  const connection = await ensurePool();
  const [rows] = await connection.query<TeacherRow[]>(
    "SELECT * FROM teachers ORDER BY created_at DESC",
  );
  return rows.map(mapTeacher);
}

export async function createTeacher(input: Partial<Teacher>) {
  const teacher: Teacher = {
    id: randomUUID(),
    name: input.name?.trim() || "",
    nip: input.nip?.trim() || "",
    subject: input.subject?.trim() || "",
    phone: input.phone?.trim() || "",
    status: input.status?.trim() || "Aktif",
    alamat: input.alamat?.trim() || undefined,
    pendidikanTerakhir: input.pendidikanTerakhir?.trim() || undefined,
    jurusan: input.jurusan?.trim() || undefined,
    gelar: input.gelar?.trim() || undefined,
    gender: input.gender || undefined,
    tempatLahir: input.tempatLahir?.trim() || undefined,
    tanggalLahir: input.tanggalLahir || undefined,
    agama: input.agama?.trim() || undefined,
    email: input.email?.trim() || undefined,
    statusKepegawaian: input.statusKepegawaian?.trim() || "GTY",
  };
  const connection = await ensurePool();
  await connection.execute(
    `INSERT INTO teachers (id, name, nip, subject, phone, status, alamat, pendidikan_terakhir, jurusan, gelar, gender, tempat_lahir, tanggal_lahir, agama, email, status_kepegawaian)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      teacher.id,
      teacher.name,
      teacher.nip,
      teacher.subject,
      teacher.phone,
      teacher.status,
      teacher.alamat ?? null,
      teacher.pendidikanTerakhir ?? null,
      teacher.jurusan ?? null,
      teacher.gelar ?? null,
      teacher.gender ?? null,
      teacher.tempatLahir ?? null,
      teacher.tanggalLahir ?? null,
      teacher.agama ?? null,
      teacher.email ?? null,
      teacher.statusKepegawaian ?? "GTY",
    ],
  );
  return teacher;
}

export async function updateTeacher(
  id: string,
  input: Partial<Teacher>,
): Promise<Teacher | null> {
  const connection = await ensurePool();
  const [rows] = await connection.execute<TeacherRow[]>(
    "SELECT * FROM teachers WHERE id = ? LIMIT 1",
    [id],
  );
  const current = rows[0];
  if (!current) return null;

  const teacher = {
    ...mapTeacher(current),
    ...input,
    id,
  };
  await connection.execute(
    `UPDATE teachers SET 
      name = ?, nip = ?, subject = ?, phone = ?, status = ?,
      alamat = ?, pendidikan_terakhir = ?, jurusan = ?, gelar = ?,
      gender = ?, tempat_lahir = ?, tanggal_lahir = ?, agama = ?,
      email = ?, status_kepegawaian = ?
     WHERE id = ?`,
    [
      teacher.name,
      teacher.nip,
      teacher.subject,
      teacher.phone,
      teacher.status,
      input.alamat?.trim() ?? current.alamat ?? null,
      input.pendidikanTerakhir?.trim() ?? current.pendidikan_terakhir ?? null,
      input.jurusan?.trim() ?? current.jurusan ?? null,
      input.gelar?.trim() ?? current.gelar ?? null,
      input.gender ?? current.gender ?? null,
      input.tempatLahir?.trim() ?? current.tempat_lahir ?? null,
      input.tanggalLahir ?? current.tanggal_lahir ?? null,
      input.agama?.trim() ?? current.agama ?? null,
      input.email?.trim() ?? current.email ?? null,
      input.statusKepegawaian?.trim() ?? current.status_kepegawaian ?? "GTY",
      id,
    ],
  );
  return teacher;
}

export async function deleteTeacher(id: string) {
  const connection = await ensurePool();
  const [result] = await connection.execute<ResultSetHeader>(
    "DELETE FROM teachers WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}
