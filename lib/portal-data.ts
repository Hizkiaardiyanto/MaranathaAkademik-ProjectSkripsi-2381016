import { getStudents } from "./db";
import {
  createRecord,
  isAcademicResource,
  listRecords,
  type AcademicRecord,
} from "./academic-data";
import { validateAcademicRecord } from "./academic-validation";
import type { SessionClaims } from "./session";

export type PortalResource =
  | "classes"
  | "schedules"
  | "subjects"
  | "students"
  | "attendance"
  | "grades";

export type PortalRecord = AcademicRecord;

const portalResources: PortalResource[] = [
  "classes",
  "schedules",
  "subjects",
  "students",
  "attendance",
  "grades",
];

const text = (record: Record<string, unknown>, field: string) =>
  String(record[field] ?? "").trim();
const normalized = (value: string) => value.trim().toLocaleLowerCase("id-ID");
const isTeacher = (session: SessionClaims) => session.role === "Guru";

function findPortalStudent(
  students: Awaited<ReturnType<typeof getStudents>>,
  session: SessionClaims,
) {
  return students.find((student) =>
    session.studentId
      ? student.id === session.studentId
      : normalized(student.name) === normalized(session.name || ""),
  );
}

export function isPortalResource(value: string): value is PortalResource {
  return portalResources.includes(value as PortalResource);
}

function teacherScheduleMatches(
  schedule: AcademicRecord,
  session: SessionClaims,
) {
  const scheduleTeacher = text(schedule, "guru");
  const scheduleSubject = text(schedule, "mapel");
  return (
    normalized(scheduleTeacher) === normalized(session.name || "") &&
    (!session.subject ||
      normalized(scheduleSubject) === normalized(session.subject))
  );
}

function studentClassMatches(
  className: string,
  session: SessionClaims,
  studentClassName: string,
) {
  const requestedClass = studentClassName || session.grade || "";
  return normalized(className) === normalized(requestedClass);
}

export async function listPortalRecords(
  resource: PortalResource,
  session: SessionClaims,
): Promise<PortalRecord[]> {
  if (resource === "students") {
    const students = await getStudents();
    if (isTeacher(session)) {
      const schedules = await listRecords("schedules");
      const assignedClasses = new Set(
        schedules
          .filter((schedule) => teacherScheduleMatches(schedule, session))
          .map((schedule) => normalized(text(schedule, "kelas"))),
      );
      return students
        .filter((student) => assignedClasses.has(normalized(student.className)))
        .map((student) => ({
          id: student.id,
          nama: student.name,
          nis: student.nis,
          kelas: student.className,
          jenjang: "",
        }));
    }
    const student = findPortalStudent(students, session);
    return student
      ? [
          {
            id: student.id,
            nama: student.name,
            nis: student.nis,
            kelas: student.className,
            jenjang: "",
          },
        ]
      : [];
  }

  if (!isAcademicResource(resource)) return [];
  const records = await listRecords(resource);

  if (resource === "classes") {
    const schedules = await listRecords("schedules");
    const assignedSchedules = isTeacher(session)
      ? schedules.filter((schedule) => teacherScheduleMatches(schedule, session))
      : [];
    const assignedClassNames = new Set(
      assignedSchedules.map((schedule) => normalized(text(schedule, "kelas"))),
    );
    const student = isTeacher(session)
      ? null
      : findPortalStudent(await getStudents(), session);
    return records
      .filter((record) => {
        const className = text(record, "nama");
        return isTeacher(session)
          ? assignedClassNames.has(normalized(className))
          : studentClassMatches(className, session, student?.className || "");
      })
      .map((record) => {
        const kelas = text(record, "nama");
        const schedule = assignedSchedules.find(
          (item) => normalized(text(item, "kelas")) === normalized(kelas),
        );
        return {
          ...record,
          kelas,
          jenjang: text(record, "jenjang"),
          mapel: schedule ? text(schedule, "mapel") : text(record, "mapel"),
        };
      });
  }

  if (resource === "schedules") {
    if (isTeacher(session)) {
      return records.filter((record) => teacherScheduleMatches(record, session));
    }
    const student = findPortalStudent(await getStudents(), session);
    return records.filter((record) =>
      studentClassMatches(text(record, "kelas"), session, student?.className || ""),
    );
  }

  if (resource === "subjects") {
    const schedules = await listRecords("schedules");
    const assignedSubjectNames = new Set(
      schedules
        .filter((schedule) =>
          isTeacher(session)
            ? teacherScheduleMatches(schedule, session)
            : true,
        )
        .map((schedule) => normalized(text(schedule, "mapel"))),
    );
    return records
      .filter((record) =>
        isTeacher(session)
          ? normalized(text(record, "nama")) ===
              normalized(session.subject || "") ||
            normalized(text(record, "guru")) === normalized(session.name || "")
          : assignedSubjectNames.has(normalized(text(record, "nama"))),
      )
      .map((record) => ({
        ...record,
        mapel: text(record, "nama"),
        jenjang: text(record, "jenjang"),
      }));
  }

  if (isTeacher(session)) {
    const assignedLessons = (await listRecords("schedules")).filter((schedule) =>
      teacherScheduleMatches(schedule, session),
    );
    return records.filter((record) =>
      assignedLessons.some(
        (schedule) =>
          normalized(text(schedule, "kelas")) ===
            normalized(text(record, "kelas")) &&
          normalized(text(schedule, "mapel")) ===
            normalized(text(record, "mapel")),
      ),
    );
  }
  return records.filter(
    (record) =>
      (session.studentId && record.studentId
        ? record.studentId === session.studentId
        : normalized(text(record, "nama")) === normalized(session.name || "")),
  );
}

export async function createPortalRecord(
  resource: "attendance" | "grades",
  session: SessionClaims,
  input: Record<string, unknown>,
): Promise<{ record: PortalRecord } | { error: string }> {
  const subject = String(session.subject || "").trim();
  const className = String(input.kelas || "").trim();
  const studentName = String(input.nama || "").trim();
  const date = String(input.tanggal || new Date().toISOString().slice(0, 10));
  const students = await getStudents();
  const student = students.find(
    (item) =>
      normalized(item.name) === normalized(studentName) &&
      normalized(item.className) === normalized(className),
  );
  const schedules = await listRecords("schedules");
  const assignedSchedule = schedules.find(
    (item) =>
      teacherScheduleMatches(item, session) &&
      normalized(text(item, "kelas")) === normalized(className),
  );
  if (!subject || !assignedSchedule) {
    return { error: "Tidak ditemukan jadwal mengajar untuk kelas dan mata pelajaran ini." };
  }
  if (!student) {
    return { error: "Siswa tidak terdaftar pada kelas yang dipilih." };
  }

  const record: Record<string, string | number> = {
    studentId: student.id,
    nama: student.name,
    kelas: student.className,
    mapel: text(assignedSchedule, "mapel"),
    guru: session.name || "Guru",
    tanggal: date,
  };

  if (resource === "grades") {
    const grade = Number(input.nilai);
    if (!Number.isFinite(grade) || grade < 0 || grade > 100) {
      return { error: "Nilai harus berupa angka antara 0 dan 100." };
    }
    record.nilai = grade;
  } else {
    const status = String(input.status || "");
    if (!["Hadir", "Izin", "Sakit", "Alpa"].includes(status)) {
      return { error: "Status kehadiran tidak valid." };
    }
    record.status = status;
  }

  const validationError = await validateAcademicRecord(resource, record);
  if (validationError) return { error: validationError };

  return { record: await createRecord(resource, record) };
}
