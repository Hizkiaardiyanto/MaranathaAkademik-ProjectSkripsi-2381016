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


export type StudentPayment = {
  id: string;
  studentId?: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  jenisPembayaran: string;
  posPembayaran?: string;
  bulan: string;
  tahunAjaran: string;
  nominal: number;
  status: "Lunas" | "Belum Lunas";
  tanggalBayar?: string;
  metodePembayaran?: string;
  nomorKwitansi?: string;
  keterangan?: string;
  petugas?: string;
  createdAt?: string;
  updatedAt?: string;
};

type PaymentRow = RowDataPacket & {
  id: string;
  student_id: string | null;
  nis: string;
  nama_siswa: string;
  kelas: string;
  jenis_pembayaran: string;
  pos_pembayaran: string | null;
  bulan: string;
  tahun_ajaran: string;
  nominal: number | string;
  status: "Lunas" | "Belum Lunas";
  tanggal_bayar: Date | string | null;
  metode_pembayaran: string | null;
  nomor_kwitansi: string | null;
  keterangan: string | null;
  petugas: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapPayment(row: PaymentRow): StudentPayment {
  return {
    id: row.id,
    studentId: row.student_id ?? undefined,
    nis: row.nis,
    namaSiswa: row.nama_siswa,
    kelas: row.kelas,
    jenisPembayaran: row.jenis_pembayaran,
    posPembayaran: row.pos_pembayaran ?? undefined,
    bulan: row.bulan,
    tahunAjaran: row.tahun_ajaran,
    nominal: Number(row.nominal) || 0,
    status: row.status,
    tanggalBayar: row.tanggal_bayar
      ? typeof row.tanggal_bayar === "string"
        ? row.tanggal_bayar.slice(0, 10)
        : row.tanggal_bayar.toISOString().slice(0, 10)
      : undefined,
    metodePembayaran: row.metode_pembayaran ?? undefined,
    nomorKwitansi: row.nomor_kwitansi ?? undefined,
    keterangan: row.keterangan ?? undefined,
    petugas: row.petugas ?? undefined,
    createdAt: row.created_at
      ? typeof row.created_at === "string"
        ? row.created_at
        : row.created_at.toISOString()
      : undefined,
    updatedAt: row.updated_at
      ? typeof row.updated_at === "string"
        ? row.updated_at
        : row.updated_at.toISOString()
      : undefined,
  };
}

export async function getPayments(filters?: {
  studentId?: string;
  nis?: string;
  kelas?: string;
  bulan?: string;
  status?: string;
  jenisPembayaran?: string;
  search?: string;
}): Promise<StudentPayment[]> {
  const connection = await ensurePool();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.studentId) {
    conditions.push("student_id = ?");
    params.push(filters.studentId);
  }
  if (filters?.nis) {
    conditions.push("nis = ?");
    params.push(filters.nis);
  }
  if (filters?.kelas && filters.kelas !== "Semua") {
    conditions.push("kelas = ?");
    params.push(filters.kelas);
  }
  if (filters?.bulan && filters.bulan !== "Semua") {
    conditions.push("bulan = ?");
    params.push(filters.bulan);
  }
  if (filters?.status && filters.status !== "Semua") {
    conditions.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.jenisPembayaran && filters.jenisPembayaran !== "Semua") {
    conditions.push("jenis_pembayaran = ?");
    params.push(filters.jenisPembayaran);
  }
  if (filters?.search?.trim()) {
    conditions.push("(nama_siswa LIKE ? OR nis LIKE ? OR nomor_kwitansi LIKE ?)");
    const searchTerm = `%${filters.search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM student_payments ${whereClause} ORDER BY created_at DESC`;

  const [rows] = await connection.query<PaymentRow[]>(query, params);
  return rows.map(mapPayment);
}

export async function getPaymentById(id: string): Promise<StudentPayment | null> {
  const connection = await ensurePool();
  const [rows] = await connection.execute<PaymentRow[]>(
    "SELECT * FROM student_payments WHERE id = ? LIMIT 1",
    [id],
  );
  if (!rows[0]) return null;
  return mapPayment(rows[0]);
}

export async function createPayment(input: Partial<StudentPayment>): Promise<StudentPayment> {
  const id = input.id || randomUUID();
  const connection = await ensurePool();

  const isLunas = input.status === "Lunas";
  const now = new Date();
  const defaultKwitansi = isLunas
    ? (input.nomorKwitansi || `KW-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`)
    : null;

  const payment: StudentPayment = {
    id,
    studentId: input.studentId || undefined,
    nis: input.nis?.trim() || "",
    namaSiswa: input.namaSiswa?.trim() || "",
    kelas: input.kelas?.trim() || "",
    jenisPembayaran: input.jenisPembayaran?.trim() || "SPP Bulanan",
    posPembayaran: input.posPembayaran?.trim() || "SPP",
    bulan: input.bulan?.trim() || `${now.toLocaleString("id-ID", { month: "long" })} ${now.getFullYear()}`,
    tahunAjaran: input.tahunAjaran?.trim() || "2026/2027",
    nominal: Number(input.nominal) || 250000,
    status: (input.status as "Lunas" | "Belum Lunas") || "Belum Lunas",
    tanggalBayar: isLunas ? (input.tanggalBayar || now.toISOString().slice(0, 10)) : undefined,
    metodePembayaran: isLunas ? (input.metodePembayaran || "Tunai (Kasir TU)") : undefined,
    nomorKwitansi: defaultKwitansi || undefined,
    keterangan: input.keterangan?.trim() || undefined,
    petugas: input.petugas?.trim() || "Admin TU",
  };

  await connection.execute(
    `INSERT INTO student_payments (
      id, student_id, nis, nama_siswa, kelas, jenis_pembayaran, pos_pembayaran,
      bulan, tahun_ajaran, nominal, status, tanggal_bayar, metode_pembayaran,
      nomor_kwitansi, keterangan, petugas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payment.id,
      payment.studentId || null,
      payment.nis,
      payment.namaSiswa,
      payment.kelas,
      payment.jenisPembayaran,
      payment.posPembayaran || null,
      payment.bulan,
      payment.tahunAjaran,
      payment.nominal,
      payment.status,
      payment.tanggalBayar || null,
      payment.metodePembayaran || null,
      payment.nomorKwitansi || null,
      payment.keterangan || null,
      payment.petugas || "Admin TU",
    ],
  );

  return payment;
}

export async function updatePayment(
  id: string,
  input: Partial<StudentPayment>,
): Promise<StudentPayment | null> {
  const connection = await ensurePool();
  const current = await getPaymentById(id);
  if (!current) return null;

  const willBeLunas = (input.status ?? current.status) === "Lunas";
  const now = new Date();

  let kwitansi = input.nomorKwitansi ?? current.nomorKwitansi;
  let tanggalBayar = input.tanggalBayar ?? current.tanggalBayar;
  let metodePembayaran = input.metodePembayaran ?? current.metodePembayaran;

  if (willBeLunas) {
    if (!kwitansi) {
      kwitansi = `KW-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!tanggalBayar) {
      tanggalBayar = now.toISOString().slice(0, 10);
    }
    if (!metodePembayaran) {
      metodePembayaran = "Tunai (Kasir TU)";
    }
  } else {
    if (input.status === "Belum Lunas") {
      kwitansi = undefined;
      tanggalBayar = undefined;
      metodePembayaran = undefined;
    }
  }

  const updated: StudentPayment = {
    ...current,
    ...input,
    status: (input.status ?? current.status) as "Lunas" | "Belum Lunas",
    nomorKwitansi: kwitansi,
    tanggalBayar,
    metodePembayaran,
    id,
  };

  await connection.execute(
    `UPDATE student_payments SET
      student_id = ?, nis = ?, nama_siswa = ?, kelas = ?, jenis_pembayaran = ?,
      pos_pembayaran = ?, bulan = ?, tahun_ajaran = ?, nominal = ?, status = ?,
      tanggal_bayar = ?, metode_pembayaran = ?, nomor_kwitansi = ?, keterangan = ?, petugas = ?
    WHERE id = ?`,
    [
      updated.studentId || null,
      updated.nis,
      updated.namaSiswa,
      updated.kelas,
      updated.jenisPembayaran,
      updated.posPembayaran || null,
      updated.bulan,
      updated.tahunAjaran,
      updated.nominal,
      updated.status,
      updated.tanggalBayar || null,
      updated.metodePembayaran || null,
      updated.nomorKwitansi || null,
      updated.keterangan || null,
      updated.petugas || "Admin TU",
      id,
    ],
  );

  return updated;
}

export async function deletePayment(id: string): Promise<boolean> {
  const connection = await ensurePool();
  const [result] = await connection.execute<ResultSetHeader>(
    "DELETE FROM student_payments WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}

export async function generateBulkMonthlySPP(
  bulan: string,
  tahunAjaran: string = "2026/2027",
  nominalSD: number = 250000,
  nominalSMP: number = 300000,
): Promise<{ created: number; skipped: number }> {
  const connection = await ensurePool();
  const students = await getStudents();

  let created = 0;
  let skipped = 0;

  for (const st of students) {
    const [existing] = await connection.query<PaymentRow[]>(
      "SELECT id FROM student_payments WHERE student_id = ? AND jenis_pembayaran = 'SPP Bulanan' AND bulan = ? LIMIT 1",
      [st.id, bulan],
    );

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const isSMP =
      st.className.toLowerCase().includes("7") ||
      st.className.toLowerCase().includes("8") ||
      st.className.toLowerCase().includes("9");
    const nominal = isSMP ? nominalSMP : nominalSD;

    await createPayment({
      studentId: st.id,
      nis: st.nis,
      namaSiswa: st.name,
      kelas: st.className,
      jenisPembayaran: "SPP Bulanan",
      posPembayaran: "SPP",
      bulan,
      tahunAjaran,
      nominal,
      status: "Belum Lunas",
      keterangan: `Tagihan SPP Bulan ${bulan}`,
      petugas: "Sistem Administrasi",
    });

    created++;
  }

  return { created, skipped };
}
