import {
  listRecords,
  type AcademicResource,
} from "./academic-data";
import { getStudents, getTeachers } from "./db";

const weekdays = new Set(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
const attendanceStatuses = new Set([
  "Hadir",
  "Izin",
  "Sakit",
  "Alpa",
  "Alpha",
]);

function stringValue(input: Record<string, string | number>, key: string) {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function validateAcademicRecord(
  resource: AcademicResource,
  input: Record<string, string | number>,
  currentId?: string,
): Promise<string | null> {
  if (resource === "subjects") {
    for (const field of ["nama", "kode", "guru"]) {
      if (!stringValue(input, field)) {
        return `Kolom ${field} wajib diisi.`;
      }
    }
    const [subjects, teachers] = await Promise.all([
      listRecords("subjects"),
      getTeachers(),
    ]);
    const code = stringValue(input, "kode").toLocaleLowerCase("id-ID");
    const name = stringValue(input, "nama").toLocaleLowerCase("id-ID");
    const duplicateCode = subjects.some(
      (record) =>
        record.id !== currentId &&
        stringValue(record, "kode").toLocaleLowerCase("id-ID") === code,
    );
    if (duplicateCode) return "Kode mata pelajaran sudah digunakan.";
    const duplicateName = subjects.some(
      (record) =>
        record.id !== currentId &&
        stringValue(record, "nama").toLocaleLowerCase("id-ID") === name,
    );
    if (duplicateName) return "Nama mata pelajaran sudah digunakan.";
    return teachers.some(
      (teacher) =>
        teacher.status === "Aktif" &&
        teacher.name.toLocaleLowerCase("id-ID") ===
          stringValue(input, "guru").toLocaleLowerCase("id-ID"),
    )
      ? null
      : "Guru pengampu harus dipilih dari data guru yang aktif.";
  }

  if (resource === "classes") {
    for (const field of ["nama", "jenjang", "wali"]) {
      if (!stringValue(input, field)) {
        return `Kolom ${field} wajib diisi.`;
      }
    }
    if (!["SD", "SMP"].includes(stringValue(input, "jenjang"))) {
      return "Jenjang kelas harus SD atau SMP.";
    }
    const count = input.jumlah;
    if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
      return "Jumlah siswa harus berupa bilangan bulat minimal 0.";
    }
    const className = stringValue(input, "nama").toLocaleLowerCase("id-ID");
    const level = stringValue(input, "jenjang").toLocaleLowerCase("id-ID");
    const duplicate = (await listRecords("classes")).some(
      (record) =>
        record.id !== currentId &&
        stringValue(record, "nama").toLocaleLowerCase("id-ID") === className &&
        stringValue(record, "jenjang").toLocaleLowerCase("id-ID") === level,
    );
    return duplicate ? "Kelas dengan jenjang tersebut sudah terdaftar." : null;
  }

  if (resource === "schedules") {
    for (const field of ["hari", "jam", "kelas", "mapel", "guru"]) {
      if (!stringValue(input, field)) {
        return `Kolom ${field} wajib diisi.`;
      }
    }
    if (!weekdays.has(stringValue(input, "hari"))) {
      return "Hari jadwal tidak valid.";
    }
    const level = input.jenjang;
    if (level !== undefined && level !== "SD" && level !== "SMP") {
      return "Jenjang jadwal harus SD atau SMP.";
    }
    const [classes, subjects, teachers] = await Promise.all([
      listRecords("classes"),
      listRecords("subjects"),
      getTeachers(),
    ]);
    const classRecord = classes.find(
      (record) =>
        stringValue(record, "nama").toLocaleLowerCase("id-ID") ===
          stringValue(input, "kelas").toLocaleLowerCase("id-ID") &&
        (level === undefined || stringValue(record, "jenjang") === level),
    );
    if (!classRecord) {
      return "Kelas jadwal harus dipilih dari data kelas yang terdaftar.";
    }
    const subject = subjects.find(
      (record) =>
        stringValue(record, "nama").toLocaleLowerCase("id-ID") ===
        stringValue(input, "mapel").toLocaleLowerCase("id-ID"),
    );
    if (!subject) {
      return "Mata pelajaran jadwal harus dipilih dari data yang terdaftar.";
    }
    const assignedTeacher = stringValue(subject, "guru");
    const requestedTeacher = stringValue(input, "guru");
    if (
      assignedTeacher.toLocaleLowerCase("id-ID") !==
        requestedTeacher.toLocaleLowerCase("id-ID") ||
      !teachers.some(
        (teacher) =>
          teacher.status === "Aktif" &&
          teacher.name.toLocaleLowerCase("id-ID") ===
            requestedTeacher.toLocaleLowerCase("id-ID"),
      )
    ) {
      return "Guru jadwal harus sesuai dengan guru aktif pengampu mata pelajaran.";
    }
    const existingSchedules = await listRecords("schedules");
    const sameSlot = existingSchedules.some((record) => {
      const recordClass = classes.find(
        (item) =>
          stringValue(item, "nama").toLocaleLowerCase("id-ID") ===
          stringValue(record, "kelas").toLocaleLowerCase("id-ID"),
      );
      const recordLevel =
        stringValue(record, "jenjang") || stringValue(recordClass || {}, "jenjang");
      return (
        record.id !== currentId &&
        (level === undefined || !recordLevel || recordLevel === level) &&
        ["hari", "jam", "kelas"].every(
          (field) =>
            stringValue(record, field).toLocaleLowerCase("id-ID") ===
            stringValue(input, field).toLocaleLowerCase("id-ID"),
        )
      );
    });
    return sameSlot
      ? "Jadwal untuk kelas, hari, dan jam tersebut sudah terisi."
      : null;
  }

  if (resource === "grades") {
    if (!stringValue(input, "nama") || !stringValue(input, "mapel")) {
      return "Nama siswa dan mata pelajaran wajib diisi.";
    }
    if (
      typeof input.nilai !== "number" ||
      !Number.isFinite(input.nilai) ||
      input.nilai < 0 ||
      input.nilai > 100
    ) {
      return "Nilai harus berupa angka antara 0 dan 100.";
    }
    const studentId = input.studentId;
    if (studentId === undefined && !currentId) {
      return "Pilih siswa yang terdaftar sebelum memasukkan nilai.";
    }
    if (studentId !== undefined) {
      const student = (await getStudents()).find(
        (item) => item.id === studentId,
      );
      if (
        typeof studentId !== "string" ||
        !student ||
        student.name.toLocaleLowerCase("id-ID") !==
          stringValue(input, "nama").toLocaleLowerCase("id-ID")
      ) {
        return "Pilih siswa yang sesuai dengan data induk siswa.";
      }
    }
    const duplicate = (await listRecords("grades")).some(
      (record) =>
        record.id !== currentId &&
        stringValue(record, "mapel").toLocaleLowerCase("id-ID") ===
          stringValue(input, "mapel").toLocaleLowerCase("id-ID") &&
        (studentId
          ? record.studentId === studentId ||
            (!record.studentId &&
              stringValue(record, "nama").toLocaleLowerCase("id-ID") ===
                stringValue(input, "nama").toLocaleLowerCase("id-ID"))
          : stringValue(record, "nama").toLocaleLowerCase("id-ID") ===
            stringValue(input, "nama").toLocaleLowerCase("id-ID")),
    );
    return duplicate
      ? "Nilai siswa untuk mata pelajaran ini sudah tercatat; edit nilai yang ada."
      : null;
  }

  if (
    !stringValue(input, "nama") ||
    !stringValue(input, "kelas") ||
    !stringValue(input, "tanggal")
  ) {
    return "Nama siswa, kelas, dan tanggal wajib diisi.";
  }
  if (input.studentId === undefined) {
    return "Pilih siswa yang terdaftar sebelum mencatat kehadiran.";
  }
  if (input.studentId !== undefined) {
    const student = (await getStudents()).find(
      (item) => item.id === input.studentId,
    );
    if (
      typeof input.studentId !== "string" ||
      !student ||
      student.name.toLocaleLowerCase("id-ID") !==
        stringValue(input, "nama").toLocaleLowerCase("id-ID") ||
      student.className.toLocaleLowerCase("id-ID") !==
        stringValue(input, "kelas").toLocaleLowerCase("id-ID")
    ) {
      return "Pilih siswa yang sesuai dengan data induk dan kelasnya.";
    }
  }
  const date = stringValue(input, "tanggal");
  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return "Tanggal kehadiran tidak valid.";
  }
  if (!attendanceStatuses.has(stringValue(input, "status"))) {
    return "Status kehadiran tidak valid.";
  }
  const duplicate = (await listRecords("attendance")).some(
    (record) =>
      record.id !== currentId &&
      stringValue(record, "tanggal") === stringValue(input, "tanggal") &&
      stringValue(record, "kelas").toLocaleLowerCase("id-ID") ===
        stringValue(input, "kelas").toLocaleLowerCase("id-ID") &&
      stringValue(record, "mapel").toLocaleLowerCase("id-ID") ===
        stringValue(input, "mapel").toLocaleLowerCase("id-ID") &&
      (record.studentId === input.studentId ||
        (!record.studentId &&
          stringValue(record, "nama").toLocaleLowerCase("id-ID") ===
            stringValue(input, "nama").toLocaleLowerCase("id-ID"))),
  );
  return duplicate ? "Kehadiran siswa untuk kelas/mapel/tanggal ini sudah dicatat." : null;
}
