import * as XLSX from "xlsx";

export type ParsedStudentRow = {
  name: string;
  nis: string;
  nisn: string;
  className: string;
  gender: "L" | "P";
  status: string;
};

export type ParsedAccountRow = {
  name: string;
  email: string;
  role: "Siswa" | "Guru" | "Administrator";
  password?: string;
  nis?: string;
  nip?: string;
  grade?: string;
  subject?: string;
  status: "approved" | "inactive";
};

// 1. Download Template Siswa (.xlsx)
export function downloadStudentTemplate() {
  const data = [
    {
      "Nama Siswa": "Budi Santoso",
      "NIS": "10021",
      "NISN": "0081234567",
      "Kelas": "VII-A",
      "Jenis Kelamin (L/P)": "L",
      "Status": "Aktif",
    },
    {
      "Nama Siswa": "Siti Nurhaliza",
      "NIS": "10022",
      "NISN": "0087654321",
      "Kelas": "VII-A",
      "Jenis Kelamin (L/P)": "P",
      "Status": "Aktif",
    },
    {
      "Nama Siswa": "Andi Wijaya",
      "NIS": "10023",
      "NISN": "0081122334",
      "Kelas": "VIII-B",
      "Jenis Kelamin (L/P)": "L",
      "Status": "Aktif",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  // Lebar kolom otomatis rapi
  worksheet["!cols"] = [
    { wch: 24 }, // Nama Siswa
    { wch: 14 }, // NIS
    { wch: 18 }, // NISN
    { wch: 12 }, // Kelas
    { wch: 20 }, // Jenis Kelamin
    { wch: 12 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
  XLSX.writeFile(workbook, "Template_Data_Siswa.xlsx");
}

// 2. Download Template Akun (.xlsx)
export function downloadAccountTemplate() {
  const data = [
    {
      "Nama Pengguna": "Budi Santoso",
      "Email Login": "budi.santoso@gmail.com",
      "Peran (Siswa/Guru)": "Siswa",
      "Password Awal": "123456",
      "NIS / NIP": "10021",
      "Kelas / Mapel": "VII-A",
      "Status (Aktif/Nonaktif)": "Aktif",
    },
    {
      "Nama Pengguna": "Siti Nurhaliza",
      "Email Login": "siti.nurhaliza@gmail.com",
      "Peran (Siswa/Guru)": "Siswa",
      "Password Awal": "123456",
      "NIS / NIP": "10022",
      "Kelas / Mapel": "VII-A",
      "Status (Aktif/Nonaktif)": "Aktif",
    },
    {
      "Nama Pengguna": "Suhartini, A.Md",
      "Email Login": "suhartini@gmail.com",
      "Peran (Siswa/Guru)": "Guru",
      "Password Awal": "198703112010012005",
      "NIS / NIP": "198703112010012005",
      "Kelas / Mapel": "Bahasa Inggris",
      "Status (Aktif/Nonaktif)": "Aktif",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 24 }, // Nama Pengguna
    { wch: 28 }, // Email Login
    { wch: 20 }, // Peran
    { wch: 20 }, // Password Awal
    { wch: 22 }, // NIS / NIP
    { wch: 18 }, // Kelas / Mapel
    { wch: 22 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Akun Pengguna");
  XLSX.writeFile(workbook, "Template_Manajemen_Akun.xlsx");
}

// 3. Parser file Excel/CSV untuk Siswa
export async function parseStudentExcel(file: File): Promise<ParsedStudentRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("File Excel kosong / tidak memiliki sheet.");

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  const result: ParsedStudentRow[] = [];

  for (const row of rows) {
    // Normalisasi kunci header
    const cleanRow: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      cleanRow[k.trim().toLowerCase()] = String(v ?? "").trim();
    }

    const name = cleanRow["nama siswa"] || cleanRow["nama"] || cleanRow["name"] || "";
    const nis = cleanRow["nis"] || cleanRow["nomor induk"] || "";
    const nisn = cleanRow["nisn"] || cleanRow["nis"] || "";
    const className = cleanRow["kelas"] || cleanRow["class"] || cleanRow["rombel"] || "";
    const rawGender = cleanRow["jenis kelamin (l/p)"] || cleanRow["jenis kelamin"] || cleanRow["jk"] || cleanRow["gender"] || "L";
    const gender: "L" | "P" = rawGender.toUpperCase().startsWith("P") ? "P" : "L";
    const status = cleanRow["status"] || "Aktif";

    if (name || nis) {
      result.push({
        name,
        nis,
        nisn,
        className,
        gender,
        status: status.toLowerCase() === "lulus" ? "Lulus" : status.toLowerCase() === "pindah" ? "Pindah" : "Aktif",
      });
    }
  }

  return result;
}

// 4. Parser file Excel/CSV untuk Akun
export async function parseAccountExcel(file: File): Promise<ParsedAccountRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("File Excel kosong / tidak memiliki sheet.");

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  const result: ParsedAccountRow[] = [];

  for (const row of rows) {
    const cleanRow: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      cleanRow[k.trim().toLowerCase()] = String(v ?? "").trim();
    }

    const name = cleanRow["nama pengguna"] || cleanRow["nama"] || cleanRow["name"] || "";
    const email = cleanRow["email login"] || cleanRow["email"] || "";
    const rawRole = cleanRow["peran (siswa/guru)"] || cleanRow["peran"] || cleanRow["role"] || "Siswa";
    const role: "Siswa" | "Guru" | "Administrator" =
      rawRole.toLowerCase().includes("guru")
        ? "Guru"
        : rawRole.toLowerCase().includes("admin")
          ? "Administrator"
          : "Siswa";

    const password = cleanRow["password awal"] || cleanRow["password"] || cleanRow["kata sandi"] || "";
    const nisOrNip = cleanRow["nis / nip"] || cleanRow["nis/nip"] || cleanRow["nis"] || cleanRow["nip"] || "";
    const gradeOrSubject = cleanRow["kelas / mapel"] || cleanRow["kelas/mapel"] || cleanRow["kelas"] || cleanRow["mapel"] || "";
    const rawStatus = cleanRow["status (aktif/nonaktif)"] || cleanRow["status"] || "Aktif";
    const status: "approved" | "inactive" =
      rawStatus.toLowerCase().includes("nonaktif") || rawStatus.toLowerCase().includes("inact")
        ? "inactive"
        : "approved";

    if (name || email) {
      result.push({
        name,
        email,
        role,
        password: password || undefined,
        nis: role === "Siswa" ? nisOrNip : undefined,
        nip: role === "Guru" ? nisOrNip : undefined,
        grade: role === "Siswa" ? gradeOrSubject : undefined,
        subject: role === "Guru" ? gradeOrSubject : undefined,
        status,
      });
    }
  }

  return result;
}

