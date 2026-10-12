import { NextResponse } from "next/server";

const schoolProfile = {
  nama: "SD - SMP Kristen Maranatha",
  jenjang: ["SD", "SMP"],
  visi: "Berkarakter Seperti Yesus Kristus, Berprestasi dalam Ilmu Pengetahuan dan Teknologi Serta Mandiri",
  misi: [
    "Mewujudkan Pendidikan Advent, yang Beriman dan suka Melayani.",
    "Mengembangkan Kemampuan Peserta Didik Agar Terampil dalam Ilmu Pengetahuan dan Teknologi.",
    "Memotivasi Peserta Didik Agar Kreatif, Berprestasi dan Mandiri.",
  ],
};

export async function GET() {
  return NextResponse.json(schoolProfile);
}
