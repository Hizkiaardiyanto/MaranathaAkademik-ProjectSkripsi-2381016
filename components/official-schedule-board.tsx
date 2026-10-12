"use client";

import { useMemo, useState } from "react";
import styles from "./official-schedule-board.module.css";

export type CellInfo = {
  subject: string;
  code?: string;
  teacher?: string;
  bg?: string;
  color?: string;
  colSpan?: number;
  rowSpan?: number;
  covered?: boolean; // if covered by earlier rowspan/colspan
};

export type DaySchedule = {
  day: string;
  classes: ("VII" | "VIII" | "IX")[];
};

export type LegendItem = {
  code: string;
  name: string;
  subjects: string;
  bg?: string;
  color?: string;
};

// Teacher & Subject Legend from the image
export const legendLeft: LegendItem[] = [
  { code: "A", name: "Drs. Tugiya, S.Pd, M.Si", subjects: "B.Ind (7, 8, 9), B.Jawa (9)", bg: "#ff9800", color: "#000000" },
  { code: "B", name: "Suwardi, S.Pd", subjects: "B.Jawa (7, 8), SBK (8)", bg: "#93c5fd", color: "#000000" },
  { code: "C", name: "Yohanes Nicolas S, S.Kom", subjects: "TIK (7, 8, 9)", bg: "#86efac", color: "#000000" },
  { code: "D", name: "Windarti, SE", subjects: "IPS (7)", bg: "#d6c4b2", color: "#000000" },
  { code: "E", name: "Suharmi, S.Pd", subjects: "P.Pancasila (7, 8, 9)", bg: "#38bdf8", color: "#000000" },
  { code: "F", name: "Dra. Rohininingsih", subjects: "SBK (7)", bg: "#5eead4", color: "#000000" },
];

export const legendRight: LegendItem[] = [
  { code: "G", name: "Tri Laksono, S.E", subjects: "IPA (7, 8, 9), IPS (8, 9)", bg: "#c084fc", color: "#000000" },
  { code: "H", name: "Ninik Sumarni, S.Pd", subjects: "B.Inggris (9)", bg: "#f472b6", color: "#000000" },
  { code: "I", name: "Drs. Markus Sumardiyono", subjects: "PJOK (7, 8, 9), PAK (7, 8, 9)", bg: "#fde047", color: "#000000" },
  { code: "J", name: "Andi Prayetno, A.Md", subjects: "SBK (9), B.Inggris (7)", bg: "#22c55e", color: "#000000" },
  { code: "K", name: "Difa Kusuma, S.Pd", subjects: "MAT (7, 8, 9)", bg: "#a89f78", color: "#000000" },
  { code: "L", name: "Suhartini, A.Md", subjects: "B.Inggris (8)", bg: "#0284c7", color: "#ffffff" },
];

export type SlotDefinition = {
  period: string; // "1", "2", ...
  time: string;   // "07.00 - 07.40", ...
  isBreak?: boolean;
  breakLabel?: string;
  // Day -> Class -> CellInfo
  cells: {
    senin: { VII: CellInfo; VIII: CellInfo; IX: CellInfo };
    selasa: { VII: CellInfo; VIII: CellInfo; IX: CellInfo };
    rabu: { VII: CellInfo; VIII: CellInfo; IX: CellInfo };
    kamis: { VII: CellInfo; VIII: CellInfo; IX: CellInfo };
    jumat: { VII: CellInfo; VIII: CellInfo; IX: CellInfo };
    sabtu: { VII: CellInfo };
  };
};

export const officialScheduleMatrix: SlotDefinition[] = [
  // 1
  {
    period: "1",
    time: "07.00 - 07.40",
    cells: {
      senin: {
        VII: { subject: "Upacara", colSpan: 3, bg: "#ffffff" },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      selasa: {
        VII: { subject: "PJOK", colSpan: 3, rowSpan: 3, bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      rabu: {
        VII: { subject: "CHAPEL", colSpan: 3, bg: "#ffffff" },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      kamis: {
        VII: { subject: "IPS", bg: "#d6c4b2", code: "D", teacher: "Windarti, SE" },
        VIII: { subject: "SBK", bg: "#93c5fd", code: "B", teacher: "Suwardi, S.Pd" },
        IX: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
      },
      jumat: {
        VII: { subject: "JUMAT SEHAT", colSpan: 3, bg: "#ffffff" },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      sabtu: {
        VII: { subject: "PGM Minggu - I", rowSpan: 6, bg: "#ffffff" },
      },
    },
  },
  // 2
  {
    period: "2",
    time: "07.40 - 08.20",
    cells: {
      senin: {
        VII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        VIII: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "B.ING", bg: "#f472b6", code: "H", teacher: "Ninik Sumarni, S.Pd" },
      },
      selasa: {
        VII: { subject: "", covered: true },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      rabu: {
        VII: { subject: "B.ING", bg: "#22c55e", code: "J", teacher: "Andi Prayetno, A.Md" },
        VIII: { subject: "B.ING", bg: "#0284c7", color: "#ffffff", code: "L", teacher: "Suhartini, A.Md" },
        IX: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
      },
      kamis: {
        VII: { subject: "IPS", bg: "#d6c4b2", code: "D", teacher: "Windarti, SE" },
        VIII: { subject: "SBK", bg: "#93c5fd", code: "B", teacher: "Suwardi, S.Pd" },
        IX: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
      },
      jumat: {
        VII: { subject: "B.ING", bg: "#22c55e", code: "J", teacher: "Andi Prayetno, A.Md" },
        VIII: { subject: "B.ING", bg: "#0284c7", color: "#ffffff", code: "L", teacher: "Suhartini, A.Md" },
        IX: { subject: "TIK", bg: "#86efac", code: "C", teacher: "Yohanes Nicolas S, S.Kom" },
      },
      sabtu: {
        VII: { subject: "", covered: true },
      },
    },
  },
  // 3
  {
    period: "3",
    time: "08.20 - 09.00",
    cells: {
      senin: {
        VII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        VIII: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "B.ING", bg: "#f472b6", code: "H", teacher: "Ninik Sumarni, S.Pd" },
      },
      selasa: {
        VII: { subject: "", covered: true },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      rabu: {
        VII: { subject: "B.ING", bg: "#22c55e", code: "J", teacher: "Andi Prayetno, A.Md" },
        VIII: { subject: "B.ING", bg: "#0284c7", color: "#ffffff", code: "L", teacher: "Suhartini, A.Md" },
        IX: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
      },
      kamis: {
        VII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        VIII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        IX: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      jumat: {
        VII: { subject: "B.JAWA", bg: "#93c5fd", code: "B", teacher: "Suwardi, S.Pd" },
        VIII: { subject: "B.ING", bg: "#0284c7", color: "#ffffff", code: "L", teacher: "Suhartini, A.Md" },
        IX: { subject: "TIK", bg: "#86efac", code: "C", teacher: "Yohanes Nicolas S, S.Kom" },
      },
      sabtu: {
        VII: { subject: "", covered: true },
      },
    },
  },
  // ISTIRAHAT 1
  {
    period: "break-1",
    time: "09.00 - 09.15",
    isBreak: true,
    breakLabel: "ISTIRAHAT",
    cells: {
      senin: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      selasa: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      rabu: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      kamis: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      jumat: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      sabtu: { VII: { subject: "" } },
    },
  },
  // 4
  {
    period: "4",
    time: "09.15 - 09.55",
    cells: {
      senin: {
        VII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        VIII: { subject: "B.JAWA", bg: "#93c5fd", code: "B", teacher: "Suwardi, S.Pd" },
        IX: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      selasa: {
        VII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        VIII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
      },
      rabu: {
        VII: { subject: "B.ING", bg: "#22c55e", code: "J", teacher: "Andi Prayetno, A.Md" },
        VIII: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
        IX: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
      },
      kamis: {
        VII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        VIII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        IX: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      jumat: {
        VII: { subject: "B.JAWA", bg: "#93c5fd", code: "B", teacher: "Suwardi, S.Pd" },
        VIII: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
        IX: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      sabtu: {
        VII: { subject: "", covered: true },
      },
    },
  },
  // 5
  {
    period: "5",
    time: "09.55 - 10.35",
    cells: {
      senin: {
        VII: { subject: "IPS", bg: "#d6c4b2", code: "D", teacher: "Windarti, SE" },
        VIII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        IX: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      selasa: {
        VII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        VIII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
      },
      rabu: {
        VII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        VIII: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
        IX: { subject: "B.JAWA", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      kamis: {
        VII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        VIII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        IX: { subject: "SBK", bg: "#22c55e", code: "J", teacher: "Andi Prayetno, A.Md" },
      },
      jumat: {
        VII: { subject: "TIK", bg: "#86efac", code: "C", teacher: "Yohanes Nicolas S, S.Kom" },
        VIII: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
        IX: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      sabtu: {
        VII: { subject: "", covered: true },
      },
    },
  },
  // 6
  {
    period: "6",
    time: "10.35 - 11.15",
    cells: {
      senin: {
        VII: { subject: "IPS", bg: "#d6c4b2", code: "D", teacher: "Windarti, SE" },
        VIII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        IX: { subject: "B.JAWA", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      selasa: {
        VII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        VIII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
      },
      rabu: {
        VII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        VIII: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
        IX: { subject: "B.ING", bg: "#f472b6", code: "H", teacher: "Ninik Sumarni, S.Pd" },
      },
      kamis: {
        VII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        VIII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "SBK", bg: "#22c55e", code: "J", teacher: "Andi Prayetno, A.Md" },
      },
      jumat: {
        VII: { subject: "TIK", bg: "#86efac", code: "C", teacher: "Yohanes Nicolas S, S.Kom" },
        VIII: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
        IX: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      sabtu: {
        VII: { subject: "", covered: true },
      },
    },
  },
  // ISTIRAHAT 2
  {
    period: "break-2",
    time: "11.15 - 11.30",
    isBreak: true,
    breakLabel: "ISTIRAHAT",
    cells: {
      senin: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      selasa: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      rabu: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      kamis: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      jumat: { VII: { subject: "" }, VIII: { subject: "" }, IX: { subject: "" } },
      sabtu: { VII: { subject: "" } },
    },
  },
  // 7
  {
    period: "7",
    time: "11.30 - 12.10",
    cells: {
      senin: {
        VII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        VIII: { subject: "B.JAWA", bg: "#93c5fd", code: "B", teacher: "Suwardi, S.Pd" },
        IX: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
      },
      selasa: {
        VII: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
        VIII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        IX: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      rabu: {
        VII: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
        VIII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        IX: { subject: "B.ING", bg: "#f472b6", code: "H", teacher: "Ninik Sumarni, S.Pd" },
      },
      kamis: {
        VII: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
        VIII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      jumat: {
        VII: { subject: "PRAMUKA", colSpan: 3, bg: "#ffffff" },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      sabtu: {
        VII: { subject: "", bg: "#ffffff" },
      },
    },
  },
  // 8
  {
    period: "8",
    time: "12.10 - 12.50",
    cells: {
      senin: {
        VII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        VIII: { subject: "TIK", bg: "#86efac", code: "C", teacher: "Yohanes Nicolas S, S.Kom" },
        IX: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
      },
      selasa: {
        VII: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
        VIII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        IX: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      rabu: {
        VII: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
        VIII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        IX: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      kamis: {
        VII: { subject: "SBK", bg: "#5eead4", code: "F", teacher: "Dra. Rohininingsih" },
        VIII: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      jumat: {
        VII: { subject: "KP", colSpan: 3, bg: "#ffffff" },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      sabtu: {
        VII: { subject: "", bg: "#ffffff" },
      },
    },
  },
  // 9
  {
    period: "9",
    time: "12.50 - 13.30",
    cells: {
      senin: {
        VII: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        VIII: { subject: "TIK", bg: "#86efac", code: "C", teacher: "Yohanes Nicolas S, S.Kom" },
        IX: { subject: "MAT", bg: "#a89f78", code: "K", teacher: "Difa Kusuma, S.Pd" },
      },
      selasa: {
        VII: { subject: "PKN", bg: "#38bdf8", code: "E", teacher: "Suharmi, S.Pd" },
        VIII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        IX: { subject: "IPA", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      rabu: {
        VII: { subject: "PAK", bg: "#fde047", code: "I", teacher: "Drs. Markus Sumardiyono" },
        VIII: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
        IX: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
      },
      kamis: {
        VII: { subject: "SBK", bg: "#5eead4", code: "F", teacher: "Dra. Rohininingsih" },
        VIII: { subject: "IPS", bg: "#c084fc", code: "G", teacher: "Tri Laksono, S.E" },
        IX: { subject: "B.IND", bg: "#ff9800", code: "A", teacher: "Drs. Tugiya, S.Pd, M.Si" },
      },
      jumat: {
        VII: { subject: "", colSpan: 3, bg: "#ffffff" },
        VIII: { subject: "", covered: true },
        IX: { subject: "", covered: true },
      },
      sabtu: {
        VII: { subject: "", bg: "#ffffff" },
      },
    },
  },
];

interface OfficialScheduleBoardProps {
  role?: "admin" | "student" | "teacher";
  userGrade?: string; // e.g. "Kelas 7" or "VII"
  userName?: string;
  defaultClassFilter?: "all" | "VII" | "VIII" | "IX";
}

export function OfficialScheduleBoard({
  role = "admin",
  userGrade,
  userName,
  defaultClassFilter = "all",
}: OfficialScheduleBoardProps) {
  // Normalize initial grade filter if student
  const initialClassFilter = useMemo<"all" | "VII" | "VIII" | "IX">(() => {
    if (defaultClassFilter !== "all") return defaultClassFilter;
    if (role === "student" && userGrade) {
      if (/7|vii/i.test(userGrade)) return "VII";
      if (/8|viii/i.test(userGrade)) return "VIII";
      if (/9|ix/i.test(userGrade)) return "IX";
    }
    return "all";
  }, [defaultClassFilter, role, userGrade]);

  const [selectedClass, setSelectedClass] = useState<"all" | "VII" | "VIII" | "IX">(initialClassFilter);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(
    role === "teacher" && userName ? userName : "",
  );
  const [hoveredCell, setHoveredCell] = useState<{
    info: CellInfo;
    day: string;
    cls: string;
    time: string;
  } | null>(null);

  const allTeachers = useMemo(() => {
    const list = [...legendLeft, ...legendRight];
    return list;
  }, []);

  function handlePrint() {
    window.print();
  }

  function isCellHighlighted(cell: CellInfo, cls: string): boolean {
    if (!cell.subject) return false;
    // If teacher selected
    if (selectedTeacher) {
      const matchTeacher =
        cell.teacher?.toLowerCase().includes(selectedTeacher.toLowerCase()) ||
        cell.code === selectedTeacher;
      return Boolean(matchTeacher);
    }
    // If class filter selected
    if (selectedClass !== "all") {
      return cls === selectedClass;
    }
    return false;
  }

  function isCellDimmed(cell: CellInfo, cls: string): boolean {
    if (!cell.subject) return false;
    if (selectedTeacher) {
      const matchTeacher =
        cell.teacher?.toLowerCase().includes(selectedTeacher.toLowerCase()) ||
        cell.code === selectedTeacher;
      return !matchTeacher;
    }
    if (selectedClass !== "all") {
      // If cell spans across all classes (e.g. Upacara, PJOK, CHAPEL, PRAMUKA, KP)
      if ((cell.colSpan ?? 1) >= 3) return false;
      return cls !== selectedClass;
    }
    return false;
  }

  return (
    <div className={styles.container}>
      {/* Interactive Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Fokus Kelas:</span>
          <button
            type="button"
            className={selectedClass === "all" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setSelectedClass("all")}
          >
            Semua Kelas (Matriks Penuh)
          </button>
          <button
            type="button"
            className={selectedClass === "VII" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setSelectedClass("VII")}
          >
            Kelas VII (7)
          </button>
          <button
            type="button"
            className={selectedClass === "VIII" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setSelectedClass("VIII")}
          >
            Kelas VIII (8)
          </button>
          <button
            type="button"
            className={selectedClass === "IX" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setSelectedClass("IX")}
          >
            Kelas IX (9)
          </button>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Highlight Guru:</span>
          <select
            className={styles.teacherSelect}
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Semua Guru --</option>
            {allTeachers.map((t) => (
              <option key={t.code} value={t.name}>
                [{t.code}] {t.name}
              </option>
            ))}
          </select>
          {selectedTeacher ? (
            <button
              type="button"
              className={styles.filterButton}
              onClick={() => setSelectedTeacher("")}
            >
              Reset
            </button>
          ) : null}
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.printButton}
            onClick={handlePrint}
            title="Cetak jadwal resmi sesuai dokumen fisik"
          >
            <span>🖨️ Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Sheet Container */}
      <div className={styles.documentSheet} id="official-schedule-print-sheet">
        {/* Header Sesuai Gambar */}
        <div className={styles.documentHeader}>
          <h1 className={styles.documentTitle}>JADWAL PELAJARAN</h1>
          <h2 className={styles.schoolTitle}>SMP KRISTEN MARANATHA TRUCUK</h2>
          <h3 className={styles.periodTitle}>TAHUN PELAJARAN 2026/2027 SEMESTER I</h3>
        </div>

        {/* Schedule Table Grid */}
        <div className={styles.tableWrap}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th rowSpan={2} className={`${styles.colJam} ${styles.headerTop}`}>
                  JAM
                  <br />
                  KE
                </th>
                <th rowSpan={2} className={`${styles.colWaktu} ${styles.headerTop}`}>
                  WAKTU
                </th>
                <th colSpan={3} className={styles.headerTop}>
                  SENIN
                </th>
                <th colSpan={3} className={styles.headerTop}>
                  SELASA
                </th>
                <th colSpan={3} className={styles.headerTop}>
                  RABU
                </th>
                <th colSpan={3} className={styles.headerTop}>
                  KAMIS
                </th>
                <th colSpan={3} className={styles.headerTop}>
                  JUMAT
                </th>
                <th colSpan={1} className={styles.headerTop}>
                  SABTU
                </th>
              </tr>
              <tr>
                {/* Senin */}
                <th className={styles.headerClass}>VII</th>
                <th className={styles.headerClass}>VIII</th>
                <th className={styles.headerClass}>IX</th>
                {/* Selasa */}
                <th className={styles.headerClass}>VII</th>
                <th className={styles.headerClass}>VIII</th>
                <th className={styles.headerClass}>IX</th>
                {/* Rabu */}
                <th className={styles.headerClass}>VII</th>
                <th className={styles.headerClass}>VIII</th>
                <th className={styles.headerClass}>IX</th>
                {/* Kamis */}
                <th className={styles.headerClass}>VII</th>
                <th className={styles.headerClass}>VIII</th>
                <th className={styles.headerClass}>IX</th>
                {/* Jumat */}
                <th className={styles.headerClass}>VII</th>
                <th className={styles.headerClass}>VIII</th>
                <th className={styles.headerClass}>IX</th>
                {/* Sabtu */}
                <th className={styles.headerClass}>VII</th>
              </tr>
            </thead>
            <tbody>
              {officialScheduleMatrix.map((slot) => {
                if (slot.isBreak) {
                  return (
                    <tr key={slot.period} className={styles.breakRow}>
                      <td colSpan={18}>
                        {slot.breakLabel} {slot.time ? `(${slot.time})` : ""}
                      </td>
                    </tr>
                  );
                }

                // Render ordinary period row
                const renderCell = (
                  cell: CellInfo,
                  dayName: string,
                  cls: string,
                  key: string,
                ) => {
                  if (cell.covered) return null;
                  const highlighted = isCellHighlighted(cell, cls);
                  const dimmed = isCellDimmed(cell, cls);

                  return (
                    <td
                      key={key}
                      rowSpan={cell.rowSpan}
                      colSpan={cell.colSpan}
                      className={`${styles.subjectCell} ${
                        highlighted ? styles.highlightedCell : ""
                      } ${dimmed ? styles.dimmedCell : ""}`}
                      style={{
                        backgroundColor: cell.bg || "#ffffff",
                        color: cell.color || "#000000",
                      }}
                      onMouseEnter={() =>
                        cell.subject
                          ? setHoveredCell({
                              info: cell,
                              day: dayName,
                              cls,
                              time: slot.time,
                            })
                          : null
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      title={
                        cell.subject
                          ? `${cell.subject}${
                              cell.teacher ? ` · Guru: ${cell.teacher}` : ""
                            }${cell.code ? ` (Kode: ${cell.code})` : ""} | ${dayName} ${slot.time}`
                          : ""
                      }
                    >
                      {cell.subject}
                    </td>
                  );
                };

                return (
                  <tr key={slot.period}>
                    <td className={styles.colJam}>{slot.period}</td>
                    <td className={styles.colWaktu}>{slot.time}</td>
                    {/* Senin */}
                    {renderCell(slot.cells.senin.VII, "Senin", "VII", "senin-vii")}
                    {renderCell(slot.cells.senin.VIII, "Senin", "VIII", "senin-viii")}
                    {renderCell(slot.cells.senin.IX, "Senin", "IX", "senin-ix")}
                    {/* Selasa */}
                    {renderCell(slot.cells.selasa.VII, "Selasa", "VII", "selasa-vii")}
                    {renderCell(slot.cells.selasa.VIII, "Selasa", "VIII", "selasa-viii")}
                    {renderCell(slot.cells.selasa.IX, "Selasa", "IX", "selasa-ix")}
                    {/* Rabu */}
                    {renderCell(slot.cells.rabu.VII, "Rabu", "VII", "rabu-vii")}
                    {renderCell(slot.cells.rabu.VIII, "Rabu", "VIII", "rabu-viii")}
                    {renderCell(slot.cells.rabu.IX, "Rabu", "IX", "rabu-ix")}
                    {/* Kamis */}
                    {renderCell(slot.cells.kamis.VII, "Kamis", "VII", "kamis-vii")}
                    {renderCell(slot.cells.kamis.VIII, "Kamis", "VIII", "kamis-viii")}
                    {renderCell(slot.cells.kamis.IX, "Kamis", "IX", "kamis-ix")}
                    {/* Jumat */}
                    {renderCell(slot.cells.jumat.VII, "Jumat", "VII", "jumat-vii")}
                    {renderCell(slot.cells.jumat.VIII, "Jumat", "VIII", "jumat-viii")}
                    {renderCell(slot.cells.jumat.IX, "Jumat", "IX", "jumat-ix")}
                    {/* Sabtu */}
                    {renderCell(slot.cells.sabtu.VII, "Sabtu", "VII", "sabtu-vii")}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend Box Section (KETERANGAN) */}
        <div className={styles.legendSection}>
          <div className={styles.legendHeader}>KETERANGAN :</div>
          <div className={styles.legendGrid}>
            {/* Table Kiri: Kode A - F */}
            <table className={styles.legendTable}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Kode</th>
                  <th style={{ width: "200px" }}>Nama Guru</th>
                  <th>Mapel</th>
                </tr>
              </thead>
              <tbody>
                {legendLeft.map((item) => (
                  <tr key={item.code}>
                    <td
                      className={styles.legendCode}
                      style={{
                        backgroundColor: item.bg || "#ffffff",
                        color: item.color || "#000000",
                      }}
                    >
                      {item.code}
                    </td>
                    <td className={styles.legendName}>{item.name}</td>
                    <td
                      className={styles.legendSubject}
                      style={{
                        backgroundColor: item.bg || "#ffffff",
                        color: item.color || "#000000",
                      }}
                    >
                      {item.subjects}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Kanan: Kode G - L */}
            <table className={styles.legendTable}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Kode</th>
                  <th style={{ width: "200px" }}>Nama Guru</th>
                  <th>Mapel</th>
                </tr>
              </thead>
              <tbody>
                {legendRight.map((item) => (
                  <tr key={item.code}>
                    <td
                      className={styles.legendCode}
                      style={{
                        backgroundColor: item.bg || "#ffffff",
                        color: item.color || "#000000",
                      }}
                    >
                      {item.code}
                    </td>
                    <td className={styles.legendName}>{item.name}</td>
                    <td
                      className={styles.legendSubject}
                      style={{
                        backgroundColor: item.bg || "#ffffff",
                        color: item.color || "#000000",
                      }}
                    >
                      {item.subjects}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures & Stamp Section */}
        <div className={styles.signatureSection}>
          {/* Kepala Sekolah + Cap Ungu */}
          <div className={styles.signatureBox}>
            <span className={styles.signRole}>Kepala Sekolah</span>
            <div className={styles.signArea}>
              {/* Cap Stempel Ungu Resmi SMP Maranatha Trucuk */}
              <svg
                className={styles.stampSvg}
                viewBox="0 0 160 160"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="80" cy="80" r="74" fill="none" stroke="#6b21a8" strokeWidth="3" opacity="0.85" />
                <circle cx="80" cy="80" r="69" fill="none" stroke="#6b21a8" strokeWidth="1.2" opacity="0.8" />
                <circle cx="80" cy="80" r="48" fill="none" stroke="#6b21a8" strokeWidth="1.2" opacity="0.8" />

                {/* Path lengkung atas untuk teks stempel */}
                <path
                  id="stampTextTop"
                  d="M 22,80 A 58,58 0 0,1 138,80"
                  fill="none"
                />
                <text fill="#6b21a8" fontSize="8.5" fontWeight="bold" letterSpacing="0.8" opacity="0.9">
                  <textPath href="#stampTextTop" startOffset="50%" textAnchor="middle">
                    GEREJA MASEHI ADVENT HARI KE TUJUH DI INDONESIA
                  </textPath>
                </text>

                {/* Path lengkung bawah untuk teks stempel */}
                <path
                  id="stampTextBottom"
                  d="M 136,80 A 56,56 0 0,1 24,80"
                  fill="none"
                />
                <text fill="#6b21a8" fontSize="8" fontWeight="bold" letterSpacing="0.8" opacity="0.9">
                  <textPath href="#stampTextBottom" startOffset="50%" textAnchor="middle">
                    ★ KALIKEBO - TRUCUK KLATEN ★
                  </textPath>
                </text>

                {/* Logo tengah: SMP + Api / Buku Advent */}
                <text x="80" y="70" textAnchor="middle" fill="#6b21a8" fontSize="12" fontWeight="bold">
                  SMP
                </text>
                <path
                  d="M 64,88 C 72,83 77,88 80,82 C 83,88 88,83 96,88 C 88,86 84,91 80,87 C 76,91 72,86 64,88 Z"
                  fill="#6b21a8"
                  opacity="0.85"
                />
                <path
                  d="M 80,72 C 83,76 82,78 80,81 C 78,78 77,76 80,72 Z"
                  fill="#6b21a8"
                  opacity="0.9"
                />
                <text x="80" y="99" textAnchor="middle" fill="#6b21a8" fontSize="7.5" fontWeight="bold">
                  MARANATHA
                </text>
              </svg>

              {/* Tanda Tangan Drs. Tugiya */}
              <svg
                className={styles.signatureSvg}
                viewBox="0 0 160 80"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 30,55 Q 45,20 60,35 T 75,50 Q 85,25 95,45 T 120,40 Q 135,30 145,55"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 40,48 Q 70,62 135,42"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="140" cy="52" r="1.5" fill="#1e293b" />
              </svg>
            </div>
            <span className={styles.signName}>Drs. Tugiya, S.Pd, M.Si</span>
          </div>

          {/* KU. Kurikulum */}
          <div className={styles.signatureBox}>
            <span className={styles.signRole}>KU. Kurikulum</span>
            <div className={styles.signArea}>
              {/* Tanda Tangan Suharmi */}
              <svg
                className={styles.signatureSvg}
                viewBox="0 0 160 80"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 40,55 Q 55,25 70,40 T 90,30 Q 110,60 130,45"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 50,45 Q 85,60 125,50"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className={styles.signName}>Suharmi, S.Pd</span>
          </div>
        </div>
      </div>
    </div>
  );
}

