"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import styles from "../app/page.module.css";

export type GradeItem = {
  id: string;
  nama: string;
  materi?: string;
  tanggal: string;
  nilai: number;
  bobot?: string;
  kkm?: number;
  status: "Tuntas" | "Remedial" | "Belum Dinilai";
  catatan?: string;
};

export type SubjectGradeData = {
  id: string;
  kode: string;
  name: string;
  guru: string;
  icon: string;
  kkm: number;
  tugas: GradeItem[];
  ujianHarian: GradeItem[];
  soalHarian: GradeItem[];
};

export const SUBJECTS_CURRICULUM: SubjectGradeData[] = [
  {
    id: "bahasa-inggris",
    kode: "BIG-08",
    name: "Bahasa Inggris",
    guru: "Suhartini, A.Md",
    icon: "🇬🇧",
    kkm: 75,
    tugas: [
      {
        id: "t1",
        nama: "Tugas 1: Recount Text & Daily Experience",
        materi: "Menulis 3 paragraf pengalaman pribadi dalam Simple Past Tense",
        tanggal: "12 Okt 2026",
        nilai: 85,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tata bahasa baik, struktur teks teratur",
      },
      {
        id: "t2",
        nama: "Tugas 2: Expressing Ability & Willingness",
        materi: "Membuat dialog percakapan modal auxiliary 'can' dan 'will'",
        tanggal: "20 Okt 2026",
        nilai: 88,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Kosakata variatif dan pelafalan sesuai konteks",
      },
      {
        id: "t3",
        nama: "Tugas 3: Notice, Warning & Caution",
        materi: "Analisis teks fungsional pendek di tempat umum",
        tanggal: "26 Okt 2026",
        nilai: 90,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Sangat baik dalam mengidentifikasi makna rambu",
      },
    ],
    ujianHarian: [
      {
        id: "uh1",
        nama: "Ujian Harian 1 (UH 1): Grammar & Vocabulary Unit 1-2",
        materi: "Simple Past vs Present Continuous & Adjective Clause",
        tanggal: "16 Okt 2026",
        kkm: 75,
        nilai: 84,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "uh2",
        nama: "Ujian Harian 2 (UH 2): Reading Comprehension & Writing",
        materi: "Analisis isi teks naratif dan recount serta penulisan esai pendek",
        tanggal: "27 Okt 2026",
        kkm: 75,
        nilai: 86,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Pemahaman bacaan sangat memuaskan",
      },
    ],
    soalHarian: [
      {
        id: "sh1",
        nama: "Soal Harian 1: Pilihan Ganda Kosakata & Sinonim",
        materi: "15 Soal Pilihan Ganda Kosakata Kontekstual",
        tanggal: "09 Okt 2026",
        nilai: 82,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "sh2",
        nama: "Soal Harian 2: Kuis Isian Singkat Irregular Verbs",
        materi: "20 Soal Perubahan Kata Kerja Bentuk Lampau",
        tanggal: "18 Okt 2026",
        nilai: 85,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "sh3",
        nama: "Soal Harian 3: Latihan Menyusun Kalimat Acak (Jumbled)",
        materi: "10 Soal Rekonstruksi Kalimat Efektif",
        tanggal: "24 Okt 2026",
        nilai: 88,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "matematika",
    kode: "MTK-08",
    name: "Matematika",
    guru: "Difa Kusuma, S.Pd",
    icon: "📐",
    kkm: 75,
    tugas: [
      {
        id: "mt1",
        nama: "Tugas 1: Pola Bilangan dan Barisan Aritmatika",
        materi: "Menemukan rumus suku ke-n (Un) dan jumlah suku (Sn)",
        tanggal: "11 Okt 2026",
        nilai: 86,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Langkah penyelesaian sistematis",
      },
      {
        id: "mt2",
        nama: "Tugas 2: Sistem Koordinat Kartesius",
        materi: "Menentukan kuadran dan jarak titik terhadap sumbu X dan Y",
        tanggal: "19 Okt 2026",
        nilai: 84,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Grafik digambar dengan tepat",
      },
      {
        id: "mt3",
        nama: "Tugas 3: Relasi dan Fungsi",
        materi: "Notasi fungsi, daerah asal, daerah kawan, dan bayangan",
        tanggal: "25 Okt 2026",
        nilai: 90,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Pemahaman konsep fungsi sangat baik",
      },
    ],
    ujianHarian: [
      {
        id: "muh1",
        nama: "Ujian Harian 1 (UH 1): Pola Bilangan & Barisan Deret",
        materi: "Aritmatika, Geometri, dan Pola Khusus",
        tanggal: "15 Okt 2026",
        kkm: 75,
        nilai: 85,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "muh2",
        nama: "Ujian Harian 2 (UH 2): Koordinat Kartesius & Relasi Fungsi",
        materi: "Domain, Kodomain, Range, dan Pemetaan",
        tanggal: "28 Okt 2026",
        kkm: 75,
        nilai: 88,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Analisis grafik sangat teliti",
      },
    ],
    soalHarian: [
      {
        id: "msh1",
        nama: "Soal Harian 1: Latihan Hitung Cepat Suku ke-n",
        materi: "10 Soal Pilihan Ganda Pola Bilangan",
        tanggal: "08 Okt 2026",
        nilai: 80,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "msh2",
        nama: "Soal Harian 2: Kuis Posisi Titik terhadap Titik Asal",
        materi: "10 Soal Isian Koordinat",
        tanggal: "17 Okt 2026",
        nilai: 85,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "msh3",
        nama: "Soal Harian 3: Latihan Menghitung Nilai f(a+b)",
        materi: "8 Soal Uraian Substitusi Fungsi",
        tanggal: "23 Okt 2026",
        nilai: 90,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "bahasa-indonesia",
    kode: "BIN-08",
    name: "Bahasa Indonesia",
    guru: "Drs. Tugiya, S.Pd, M.Si",
    icon: "🇮🇩",
    kkm: 75,
    tugas: [
      {
        id: "bt1",
        nama: "Tugas 1: Analisis Struktur Teks Berita",
        materi: "Unsur 5W+1H / ADIKSIMBA pada teks peristiwa faktual",
        tanggal: "10 Okt 2026",
        nilai: 88,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Penyusunan pokok berita lengkap",
      },
      {
        id: "bt2",
        nama: "Tugas 2: Kreasi Poster dan Slogan Edukasi",
        materi: "Menulis slogan persuasif dengan bahasa komunikatif",
        tanggal: "18 Okt 2026",
        nilai: 85,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Pilihan kata menarik dan sarat pesan",
      },
      {
        id: "bt3",
        nama: "Tugas 3: Menyusun Teks Eksposisi",
        materi: "Tesis, argumen logis, dan penegasan ulang masalah lingkungan",
        tanggal: "25 Okt 2026",
        nilai: 89,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Argumen didukung data faktual",
      },
    ],
    ujianHarian: [
      {
        id: "buh1",
        nama: "Ujian Harian 1 (UH 1): Teks Berita dan Kaidah Kebahasaan",
        materi: "Kata baku, kalimat langsung, dan konjungsi temporal",
        tanggal: "14 Okt 2026",
        kkm: 75,
        nilai: 86,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "buh2",
        nama: "Ujian Harian 2 (UH 2): Iklan, Slogan, dan Eksposisi",
        materi: "Jenis iklan, fungsi persuasif, dan fakta vs opini",
        tanggal: "27 Okt 2026",
        kkm: 75,
        nilai: 89,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Penguasaan materi sangat baik",
      },
    ],
    soalHarian: [
      {
        id: "bsh1",
        nama: "Soal Harian 1: Menentukan Kalimat Fakta dan Opini",
        materi: "10 Soal Analisis Teks Berita",
        tanggal: "07 Okt 2026",
        nilai: 84,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "bsh2",
        nama: "Soal Harian 2: Kuis Kalimat Efektif dan EYD V",
        materi: "15 Soal Pilihan Ganda Tata Bahasa",
        tanggal: "16 Okt 2026",
        nilai: 86,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "bsh3",
        nama: "Soal Harian 3: Latihan Unsur Intrinsik & Kebahasaan",
        materi: "10 Soal Paragraf Eksposisi",
        tanggal: "23 Okt 2026",
        nilai: 88,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "ipa-terpadu",
    kode: "IPA-08",
    name: "IPA Terpadu",
    guru: "Tri Laksono, S.E",
    icon: "🔬",
    kkm: 75,
    tugas: [
      {
        id: "it1",
        nama: "Tugas 1: Sistem Gerak pada Manusia",
        materi: "Klasifikasi tulang, jenis persendian, dan gangguan gerak",
        tanggal: "12 Okt 2026",
        nilai: 85,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Diagram persendian sangat rapi",
      },
      {
        id: "it2",
        nama: "Tugas 2: Penerapan Hukum Newton I, II, dan III",
        materi: "Studi kasus peristiwa inersia dan aksi-reaksi dalam olahraga",
        tanggal: "21 Okt 2026",
        nilai: 82,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Analisis gaya lengkap beserta satuan",
      },
      {
        id: "it3",
        nama: "Tugas 3: Jaringan Tumbuhan dan Fotosintesis",
        materi: "Fungsi xilem, floem, dan percobaan Sachs fotosintesis",
        tanggal: "26 Okt 2026",
        nilai: 88,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Laporan praktikum komprehensif",
      },
    ],
    ujianHarian: [
      {
        id: "iuh1",
        nama: "Ujian Harian 1 (UH 1): Sistem Gerak & Hukum Gerak Newton",
        materi: "Biomekanika manusia dan hitungan rumus percepatan F=m.a",
        tanggal: "17 Okt 2026",
        kkm: 75,
        nilai: 84,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "iuh2",
        nama: "Ujian Harian 2 (UH 2): Struktur Organ & Jaringan Tumbuhan",
        materi: "Struktur daun, batang, akar, dan jaringan meristem",
        tanggal: "28 Okt 2026",
        kkm: 75,
        nilai: 87,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Hasil ujian sangat memuaskan",
      },
    ],
    soalHarian: [
      {
        id: "ish1",
        nama: "Soal Harian 1: Latihan Hitung Kecepatan dan Percepatan",
        materi: "8 Soal Hitungan GLB & GLBB",
        tanggal: "09 Okt 2026",
        nilai: 80,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "ish2",
        nama: "Soal Harian 2: Kuis Identifikasi Tulang Rangka Manusia",
        materi: "15 Soal Pilihan Gambar Rangka",
        tanggal: "18 Okt 2026",
        nilai: 85,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "ish3",
        nama: "Soal Harian 3: Latihan Jalur Reaksi Fotosintesis",
        materi: "10 Soal Kuis Reaksi Terang & Gelap",
        tanggal: "24 Okt 2026",
        nilai: 86,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "ips",
    kode: "IPS-08",
    name: "IPS",
    guru: "Tri Laksono, S.E",
    icon: "🌍",
    kkm: 75,
    tugas: [
      {
        id: "ipst1",
        nama: "Tugas 1: Peta dan Karakteristik Negara-Negara ASEAN",
        materi: "Analisis potensi sumber daya alam dan iklim negara ASEAN",
        tanggal: "11 Okt 2026",
        nilai: 88,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Peta tematik berwarna dan informatif",
      },
      {
        id: "ipst2",
        nama: "Tugas 2: Mobilitas Sosial dalam Masyarakat",
        materi: "Bentuk mobilitas vertikal naik, turun, dan horizontal",
        tanggal: "19 Okt 2026",
        nilai: 86,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Contoh kasus kontekstual dan relevan",
      },
      {
        id: "ipst3",
        nama: "Tugas 3: Pluralitas Masyarakat Indonesia",
        materi: "Keberagaman suku, agama, ras, dan mata pencaharian",
        tanggal: "26 Okt 2026",
        nilai: 89,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Sikap toleransi tercermin dalam analisis",
      },
    ],
    ujianHarian: [
      {
        id: "ipsuh1",
        nama: "Ujian Harian 1 (UH 1): Interaksi Keruangan ASEAN",
        materi: "Letak astronomis, batas wilayah, dan MEA",
        tanggal: "15 Okt 2026",
        kkm: 75,
        nilai: 87,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "ipsuh2",
        nama: "Ujian Harian 2 (UH 2): Pengaruh Interaksi Sosial & Mobilitas",
        materi: "Faktor pendorong, penghambat, dan saluran mobilitas sosial",
        tanggal: "28 Okt 2026",
        kkm: 75,
        nilai: 88,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Jawaban esai terstruktur baik",
      },
    ],
    soalHarian: [
      {
        id: "ipssh1",
        nama: "Soal Harian 1: Kuis Ibu Kota & Komoditas Ekspor ASEAN",
        materi: "10 Soal Tebak Cepat Peta",
        tanggal: "08 Okt 2026",
        nilai: 85,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "ipssh2",
        nama: "Soal Harian 2: Latihan Klasifikasi Status Sosial",
        materi: "10 Soal Analisis Kasus Mobilitas",
        tanggal: "17 Okt 2026",
        nilai: 86,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "ipssh3",
        nama: "Soal Harian 3: Kuis Dampak Positif Negatif Mobilitas",
        materi: "8 Soal Pilihan Ganda Kompleks",
        tanggal: "24 Okt 2026",
        nilai: 90,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "pendidikan-pancasila",
    kode: "PKN-08",
    name: "Pendidikan Pancasila",
    guru: "Suharmi, S.Pd",
    icon: "⚖️",
    kkm: 75,
    tugas: [
      {
        id: "pt1",
        nama: "Tugas 1: Makna Kedudukan Pancasila sebagai Dasar Negara",
        materi: "Analisis fungsi Pancasila sebagai ideologi dan pedoman hidup",
        tanggal: "13 Okt 2026",
        nilai: 90,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Penjelasan mendalam dan reflektif",
      },
      {
        id: "pt2",
        nama: "Tugas 2: Tata Urutan Peraturan Perundang-undangan RI",
        materi: "Hierarki peraturan menurut UU No. 12 Tahun 2011",
        tanggal: "20 Okt 2026",
        nilai: 88,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Bagan hierarki dibuat dengan tepat",
      },
      {
        id: "pt3",
        nama: "Tugas 3: Studi Kasus Penegakan Hukum & Norma",
        materi: "Penyelesaian konflik norma sosial di lingkungan remaja",
        tanggal: "27 Okt 2026",
        nilai: 92,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Solusi kreatif dan berkeadilan",
      },
    ],
    ujianHarian: [
      {
        id: "puh1",
        nama: "Ujian Harian 1 (UH 1): Pancasila Ideologi Terbuka",
        materi: "Dimensi idealis, normatif, dan realistis Pancasila",
        tanggal: "16 Okt 2026",
        kkm: 75,
        nilai: 88,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "puh2",
        nama: "Ujian Harian 2 (UH 2): UUD NRI Tahun 1945 & Norma Hukum",
        materi: "Pokok pikiran pembukaan UUD 1945 dan pasal-pasal penting",
        tanggal: "29 Okt 2026",
        kkm: 75,
        nilai: 90,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Memahami hak dan kewajiban warga negara",
      },
    ],
    soalHarian: [
      {
        id: "psh1",
        nama: "Soal Harian 1: Kuis Butir-Butir Pengamalan Sila 1-5",
        materi: "10 Soal Pilihan Ganda Kontekstual",
        tanggal: "09 Okt 2026",
        nilai: 88,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "psh2",
        nama: "Soal Harian 2: Latihan Menentukan Jenis Peraturan",
        materi: "10 Soal Isian Singkat Perppu & Perda",
        tanggal: "18 Okt 2026",
        nilai: 90,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "psh3",
        nama: "Soal Harian 3: Kuis Sikap Ketaatan terhadap Hukum",
        materi: "8 Soal Sikap dan Perilaku Taat Norma",
        tanggal: "25 Okt 2026",
        nilai: 92,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "pjok",
    kode: "PJK-08",
    name: "PJOK",
    guru: "Drs. Markus Sumardiyono",
    icon: "⚽",
    kkm: 75,
    tugas: [
      {
        id: "pjt1",
        nama: "Tugas 1: Makalah Variasi Gerak Bola Besar",
        materi: "Teknik passing, dribbling, dan shooting sepak bola / voli",
        tanggal: "10 Okt 2026",
        nilai: 88,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Penjelasan tahapan gerak runtut",
      },
      {
        id: "pjt2",
        nama: "Tugas 2: Rencana Latihan Kebugaran Jasmani Mandiri",
        materi: "Push up, sit up, shuttle run, dan kelenturan tubuh",
        tanggal: "24 Okt 2026",
        nilai: 90,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Jadwal terukur dan realistis",
      },
    ],
    ujianHarian: [
      {
        id: "pjuh1",
        nama: "Ujian Harian 1 (UH 1): Teori Permainan Bola Besar & Atletik",
        materi: "Peraturan pertandingan dan teknik lari jarak pendek",
        tanggal: "14 Okt 2026",
        kkm: 75,
        nilai: 86,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "pjuh2",
        nama: "Ujian Harian 2 (UH 2): Senam Lantai & Budaya Hidup Sehat",
        materi: "Guling depan, guling belakang, pola gizi seimbang",
        tanggal: "27 Okt 2026",
        kkm: 75,
        nilai: 88,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Menguasai prinsip keselamatan gerak",
      },
    ],
    soalHarian: [
      {
        id: "pjsh1",
        nama: "Soal Harian 1: Kuis Peraturan Wasit Sepak Bola & Voli",
        materi: "10 Soal Pilihan Ganda Wasit & Pelanggaran",
        tanggal: "07 Okt 2026",
        nilai: 85,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "pjsh2",
        nama: "Soal Harian 2: Latihan Manfaat Pemanasan & Pendinginan",
        materi: "8 Soal Esai Pencegahan Cedera Otot",
        tanggal: "21 Okt 2026",
        nilai: 88,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "seni-budaya",
    kode: "SBK-08",
    name: "Seni Budaya",
    guru: "Suwardi, S.Pd",
    icon: "🎨",
    kkm: 75,
    tugas: [
      {
        id: "sbt1",
        nama: "Tugas 1: Karya Gambar Model dengan Objek Alam Benda",
        materi: "Penerapan prinsip proporsi, komposisi, gelap-terang",
        tanggal: "11 Okt 2026",
        nilai: 86,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Arsiran gradasi halus dan proporsional",
      },
      {
        id: "sbt2",
        nama: "Tugas 2: Menggambar Ilustrasi Vignette & Komik Pendek",
        materi: "Menyampaikan cerita melalui ilustrasi ekspresif",
        tanggal: "22 Okt 2026",
        nilai: 88,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Karakter tokoh hidup dan konsisten",
      },
    ],
    ujianHarian: [
      {
        id: "sbuh1",
        nama: "Ujian Harian 1 (UH 1): Teori Menggambar Model & Ilustrasi",
        materi: "Alat, bahan, teknik aquarel, dussel, dan pointilis",
        tanggal: "15 Okt 2026",
        kkm: 75,
        nilai: 85,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "sbuh2",
        nama: "Ujian Harian 2 (UH 2): Ragam Lagu & Alat Musik Tradisional",
        materi: "Gaya bernyanyi unisono dan alat musik daerah",
        tanggal: "28 Okt 2026",
        kkm: 75,
        nilai: 87,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Pengetahuan seni nusantara sangat baik",
      },
    ],
    soalHarian: [
      {
        id: "sbsh1",
        nama: "Soal Harian 1: Kuis Asal Daerah Alat Musik Nusantara",
        materi: "10 Soal Identifikasi Sasando, Angklung, Kolintang",
        tanggal: "08 Okt 2026",
        nilai: 84,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "sbsh2",
        nama: "Soal Harian 2: Latihan Unsur-Unsur Rupa Gambar",
        materi: "10 Soal Garis, Bidang, Tekstur, dan Ruang",
        tanggal: "19 Okt 2026",
        nilai: 86,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "tik",
    kode: "TIK-08",
    name: "TIK",
    guru: "Yohanes Nicolas S, S.Kom",
    icon: "💻",
    kkm: 75,
    tugas: [
      {
        id: "tt1",
        nama: "Tugas 1: Praktik Analisis Data Spreadsheet (Excel)",
        materi: "Penggunaan fungsi logika IF, VLOOKUP, dan SUMIFS",
        tanggal: "12 Okt 2026",
        nilai: 92,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Formula berfungsi sempurna tanpa error",
      },
      {
        id: "tt2",
        nama: "Tugas 2: Pembuatan Infografis Keamanan Siber",
        materi: "Tips menjaga kerahasiaan kata sandi dan anti phishing",
        tanggal: "20 Okt 2026",
        nilai: 90,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Desain visual komunikatif dan estetik",
      },
      {
        id: "tt3",
        nama: "Tugas 3: Algoritma & Flowchart Pemrograman",
        materi: "Merancang alur logika sistem kasir sederhana",
        tanggal: "26 Okt 2026",
        nilai: 88,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Simbol flowchart dan logika presisi",
      },
    ],
    ujianHarian: [
      {
        id: "tuh1",
        nama: "Ujian Harian 1 (UH 1): Formula & Visualisasi Data",
        materi: "Pembuatan pivot chart dan otomatisasi laporan",
        tanggal: "16 Okt 2026",
        kkm: 75,
        nilai: 90,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "tuh2",
        nama: "Ujian Harian 2 (UH 2): Jaringan Komputer & Internet",
        materi: "Topologi jaringan (LAN/WAN), IP address, dan enkripsi SSL",
        tanggal: "27 Okt 2026",
        kkm: 75,
        nilai: 92,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Sangat memahami arsitektur internet",
      },
    ],
    soalHarian: [
      {
        id: "tsh1",
        nama: "Soal Harian 1: Latihan Menulis Rumus IF Bersarang",
        materi: "5 Studi Kasus Penilaian Siswa Otomatis",
        tanggal: "09 Okt 2026",
        nilai: 88,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "tsh2",
        nama: "Soal Harian 2: Kuis Singkatan & Istilah Jaringan",
        materi: "10 Soal TCP/IP, DNS, Modem, Router",
        tanggal: "17 Okt 2026",
        nilai: 90,
        bobot: "35%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "tsh3",
        nama: "Soal Harian 3: Kuis Logika Algoritma Percabangan",
        materi: "8 Soal Tracing Kode Algoritma",
        tanggal: "24 Okt 2026",
        nilai: 94,
        bobot: "30%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "bahasa-jawa",
    kode: "BJW-08",
    name: "Bahasa Jawa",
    guru: "Suwardi, S.Pd",
    icon: "📜",
    kkm: 75,
    tugas: [
      {
        id: "bjt1",
        nama: "Tugas 1: Nyalin Paragraf Aksara Latin ing Aksara Jawa",
        materi: "Panganggone sandhangan swara lan panyigeg wanda",
        tanggal: "10 Okt 2026",
        nilai: 84,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Seratan aksara Jawa bener lan rapi",
      },
      {
        id: "bjt2",
        nama: "Tugas 2: Nulis Teks Crita Pengalaman Basa Krama",
        materi: "Pangetraping unggah-ungguh basa krama alus marang wong tuwa",
        tanggal: "23 Okt 2026",
        nilai: 86,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Pamilihing tembung krama laras",
      },
    ],
    ujianHarian: [
      {
        id: "bjuh1",
        nama: "Ujian Harian 1 (UH 1): Wacan Crita Cekak (Cerkak)",
        materi: "Unsur intrinsik: tema, alur, pamawas, lan amanat cerkak",
        tanggal: "14 Okt 2026",
        kkm: 75,
        nilai: 85,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "bjuh2",
        nama: "Ujian Harian 2 (UH 2): Tembang Macapat Gambuh & Pocung",
        materi: "Guru gatra, guru wilangan, lan guru lagu tembang macapat",
        tanggal: "28 Okt 2026",
        kkm: 75,
        nilai: 84,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Paham aturan paugeran macapat",
      },
    ],
    soalHarian: [
      {
        id: "bjsh1",
        nama: "Soal Harian 1: Gladhen Tembung Kosok Balen lan Dasanama",
        materi: "10 Soal Makna Tembung Basa Jawa",
        tanggal: "07 Okt 2026",
        nilai: 82,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "bjsh2",
        nama: "Soal Harian 2: Kuis Maca Pasangan Aksara Jawa",
        materi: "10 Soal Wacan Pasangan Aksara",
        tanggal: "21 Okt 2026",
        nilai: 86,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
  {
    id: "pendidikan-agama-kristen",
    kode: "PAK-08",
    name: "Pendidikan Agama Kristen",
    guru: "Drs. Markus Sumardiyono",
    icon: "✝️",
    kkm: 75,
    tugas: [
      {
        id: "pakt1",
        nama: "Tugas 1: Refleksi Kasih Allah dalam Kehidupan Sehari-hari",
        materi: "Memaknai anugerah pengampunan dan hidup baru",
        tanggal: "13 Okt 2026",
        nilai: 92,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Refleksi mendalam dan aplikatif",
      },
      {
        id: "pakt2",
        nama: "Tugas 2: Karya Tulis Teladan Tokoh Alkitab",
        materi: "Keteladanan kesetiaan Daud dan ketabahan Ayub",
        tanggal: "25 Okt 2026",
        nilai: 90,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Analisis karakter Alkitabiah sangat baik",
      },
    ],
    ujianHarian: [
      {
        id: "pakuh1",
        nama: "Ujian Harian 1 (UH 1): Hidup Beriman dan Berpengharapan",
        materi: "Makna iman sejati menurut Ibrani 11 dan penerapannya",
        tanggal: "17 Okt 2026",
        kkm: 75,
        nilai: 90,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Lulus di atas KKM",
      },
      {
        id: "pakuh2",
        nama: "Ujian Harian 2 (UH 2): Hidup Rukun dalam Keberagaman",
        materi: "Prinsip kasih tanpa membedakan suku, status, dan latar belakang",
        tanggal: "29 Okt 2026",
        kkm: 75,
        nilai: 92,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Sangat memahami teladan Kristus",
      },
    ],
    soalHarian: [
      {
        id: "paksh1",
        nama: "Soal Harian 1: Kuis Hafalan dan Makna Ayat Alkitab Pilihan",
        materi: "8 Soal Pemahaman Ayat Firman Tuhan",
        tanggal: "09 Okt 2026",
        nilai: 90,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
      {
        id: "paksh2",
        nama: "Soal Harian 2: Latihan Sikap Pengampunan terhadap Sesama",
        materi: "6 Soal Studi Kasus Pergaulan Remaja Kristen",
        tanggal: "23 Okt 2026",
        nilai: 94,
        bobot: "50%",
        status: "Tuntas",
        catatan: "Tuntas",
      },
    ],
  },
];

function calcAvg(items: GradeItem[]): number {
  if (!items.length) return 0;
  const sum = items.reduce((acc, curr) => acc + curr.nilai, 0);
  return Math.round((sum / items.length) * 10) / 10;
}

export function StudentNilaiView({
  selectedSubjectName,
  onSelectSubject,
  studentName = "Hizkia Julio Ardiyanto",
  studentGrade = "Kelas 8",
  dbRecords = [],
}: {
  selectedSubjectName?: string;
  onSelectSubject?: (subjectName: string) => void;
  studentName?: string;
  studentGrade?: string;
  dbRecords?: Array<{ id: string; mapel?: string; nilai?: number; [key: string]: unknown }>;
}) {
  // Check if viewing all or specific
  const [activeSubject, setActiveSubject] = React.useState<string>(
    selectedSubjectName || "Bahasa Inggris"
  );

  React.useEffect(() => {
    if (selectedSubjectName) {
      setActiveSubject(selectedSubjectName);
    }
  }, [selectedSubjectName]);

  const handleSelect = (name: string) => {
    setActiveSubject(name);
    if (onSelectSubject) {
      onSelectSubject(name);
    }
  };

  // Find curriculum data
  const currentSubject = useMemo(() => {
    if (activeSubject === "ALL") return null;
    return (
      SUBJECTS_CURRICULUM.find(
        (s) =>
          s.name.toLowerCase() === activeSubject.toLowerCase() ||
          s.id.toLowerCase() === activeSubject.toLowerCase()
      ) || SUBJECTS_CURRICULUM[0]
    );
  }, [activeSubject]);

  // Check if database has a specific grade for this student & subject
  const dbGradeForCurrent = useMemo(() => {
    if (!currentSubject) return null;
    const match = dbRecords.find(
      (r) =>
        String(r.mapel || "").trim().toLowerCase() ===
        currentSubject.name.toLowerCase()
    );
    return match ? Number(match.nilai) : null;
  }, [currentSubject, dbRecords]);

  // Averages for current subject
  const avgTugas = useMemo(
    () => (currentSubject ? calcAvg(currentSubject.tugas) : 0),
    [currentSubject]
  );
  const avgUH = useMemo(
    () => (currentSubject ? calcAvg(currentSubject.ujianHarian) : 0),
    [currentSubject]
  );
  const avgSoalHarian = useMemo(
    () => (currentSubject ? calcAvg(currentSubject.soalHarian) : 0),
    [currentSubject]
  );

  // Final calculated score: 30% Tugas + 40% UH + 30% Soal Harian
  const finalCalculated = useMemo(() => {
    if (dbGradeForCurrent !== null) return dbGradeForCurrent;
    return Math.round((avgTugas * 0.3 + avgUH * 0.4 + avgSoalHarian * 0.3) * 10) / 10;
  }, [avgTugas, avgUH, avgSoalHarian, dbGradeForCurrent]);

  const getPredicate = (score: number) => {
    if (score >= 90) return { letter: "A", label: "Sangat Baik", color: "#16a34a", bg: "#f0fdf4" };
    if (score >= 80) return { letter: "B", label: "Baik", color: "#2563eb", bg: "#eff6ff" };
    if (score >= 75) return { letter: "C", label: "Cukup (Tuntas)", color: "#d97706", bg: "#fffbeb" };
    return { letter: "D", label: "Perlu Bimbingan", color: "#dc2626", bg: "#fef2f2" };
  };

  const pred = getPredicate(finalCalculated);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. MATA PELAJARAN SELECTOR BAR (NAVIGASI HORIZONTAL SESUAI JADWAL) */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "16px 20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              PILIH MATA PELAJARAN SESUAI JADWAL
            </span>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "2px 0 0" }}>
              Daftar Mata Pelajaran {studentGrade}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleSelect("ALL")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: activeSubject === "ALL" ? "#2563eb" : "#cbd5e1",
              background: activeSubject === "ALL" ? "#2563eb" : "#f8fafc",
              color: activeSubject === "ALL" ? "#ffffff" : "#475569",
              transition: "all 0.15s ease",
            }}
          >
            📊 Ringkasan Semua Mapel
          </button>
        </div>

        {/* Scrollable Pills */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "6px",
            scrollbarWidth: "thin",
          }}
        >
          {SUBJECTS_CURRICULUM.map((subj) => {
            const isSelected =
              activeSubject !== "ALL" &&
              currentSubject?.id === subj.id;
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => handleSelect(subj.name)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: isSelected ? 700 : 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: isSelected ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                  background: isSelected ? "#eff6ff" : "#ffffff",
                  color: isSelected ? "#1d4ed8" : "#475569",
                  boxShadow: isSelected ? "0 2px 4px rgba(37,99,235,0.12)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{subj.icon}</span>
                <span>{subj.name}</span>
                {dbRecords.some(
                  (r) =>
                    String(r.mapel || "").trim().toLowerCase() ===
                    subj.name.toLowerCase()
                ) && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#16a34a",
                    }}
                    title="Nilai resmi database tercatat"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* JIKA MEMILIH VIEW "RINGKASAN SEMUA MAPEL" */}
      {activeSubject === "ALL" ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
              Rekapitulasi Nilai Seluruh Mata Pelajaran ({studentGrade})
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Kelompok nilai tugas, ujian harian, dan soal harian per mata pelajaran siswa: <b>{studentName}</b>
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "12px" }}>Mata Pelajaran</th>
                  <th style={{ padding: "12px" }}>Guru Pengampu</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>KKM</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Rata2 Tugas</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Rata2 UH</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Rata2 Soal Harian</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Nilai Akhir</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Predikat</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECTS_CURRICULUM.map((s) => {
                  const t = calcAvg(s.tugas);
                  const uh = calcAvg(s.ujianHarian);
                  const sh = calcAvg(s.soalHarian);
                  const dbMatch = dbRecords.find(
                    (r) =>
                      String(r.mapel || "").trim().toLowerCase() ===
                      s.name.toLowerCase()
                  );
                  const final = dbMatch
                    ? Number(dbMatch.nilai)
                    : Math.round((t * 0.3 + uh * 0.4 + sh * 0.3) * 10) / 10;
                  const p = getPredicate(final);

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                        <span style={{ marginRight: "8px" }}>{s.icon}</span>
                        {s.name}
                      </td>
                      <td style={{ padding: "12px", color: "#64748b" }}>{s.guru}</td>
                      <td style={{ padding: "12px", textAlign: "center", color: "#64748b" }}>{s.kkm}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{t}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{uh}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{sh}</td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: 800,
                          fontSize: "14px",
                          color: "#1e3a8a",
                        }}
                      >
                        {final}
                        {dbMatch && (
                          <span
                            style={{
                              marginLeft: "4px",
                              fontSize: "10px",
                              color: "#16a34a",
                              fontWeight: 700,
                            }}
                            title="Nilai resmi tercatat di database"
                          >
                            ✓
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: p.bg,
                            color: p.color,
                          }}
                        >
                          {p.letter} ({p.label})
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleSelect(s.name)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          Lihat Rincian →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DETAIL KELOMPOK NILAI UNTUK 1 MATA PELAJARAN TERTENTU */
        currentSubject && (
          <>
            {/* HERO BADGE SUBJECT & SCORE SUMMARY CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "14px",
              }}
            >
              {/* Card 1: Mapel Info */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  color: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "22px" }}>{currentSubject.icon}</span>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {currentSubject.kode}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800 }}>
                    {currentSubject.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
                    Guru: <b>{currentSubject.guru}</b>
                  </p>
                </div>
                <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: "11px", display: "flex", justifyContent: "space-between" }}>
                  <span>KKM: <b>{currentSubject.kkm}</b></span>
                  <span>Jenjang: <b>SMP ({studentGrade})</b></span>
                </div>
              </div>

              {/* Card 2: Rata-rata Nilai Tugas */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>📝 RATA-RATA TUGAS</span>
                    <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 700, background: "#eff6ff", padding: "2px 6px", borderRadius: "6px" }}>
                      Bobot 30%
                    </span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>
                    {avgTugas}
                  </div>
                </div>
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#64748b" }}>
                  Dari total <b>{currentSubject.tugas.length}</b> penugasan terstruktur
                </div>
              </div>

              {/* Card 3: Rata-rata Ujian Harian */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>📋 RATA-RATA UJIAN HARIAN</span>
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700, background: "#ecfdf5", padding: "2px 6px", borderRadius: "6px" }}>
                      Bobot 40%
                    </span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>
                    {avgUH}
                  </div>
                </div>
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#64748b" }}>
                  Dari total <b>{currentSubject.ujianHarian.length}</b> sesi penilaian harian
                </div>
              </div>

              {/* Card 4: Rata-rata Soal Harian */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>✏️ SOAL HARIAN / KUIS</span>
                    <span style={{ fontSize: "11px", color: "#ea580c", fontWeight: 700, background: "#fff7ed", padding: "2px 6px", borderRadius: "6px" }}>
                      Bobot 30%
                    </span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>
                    {avgSoalHarian}
                  </div>
                </div>
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#64748b" }}>
                  Dari total <b>{currentSubject.soalHarian.length}</b> latihan harian kelas
                </div>
              </div>

              {/* Card 5: Nilai Akhir Mapel */}
              <div
                style={{
                  background: pred.bg,
                  borderRadius: "12px",
                  padding: "18px 20px",
                  border: `1.5px solid ${pred.color}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: pred.color }}>🏆 NILAI AKHIR MAPEL</span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        background: pred.color,
                        color: "#ffffff",
                        padding: "2px 8px",
                        borderRadius: "10px",
                      }}
                    >
                      {pred.letter}
                    </span>
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: 900, color: pred.color }}>
                    {finalCalculated}
                  </div>
                </div>
                <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: 700, color: pred.color }}>
                  Status: Tuntas ({pred.label})
                  {dbGradeForCurrent !== null && (
                    <span style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#166534", marginTop: "2px" }}>
                      ✓ Terdata resmi di database akademik
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3 BAGIAN PENGELOMPOKAN NILAI SESUAI PERMINTAAN USER:
                1. Nilai Tugas
                2. Nilai Ujian Harian
                3. Nilai Soal Harian
            */}

            {/* BAGIAN 1: NILAI TUGAS */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "8px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    📝
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                      1. Kelompok Nilai Tugas Siswa
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      Rekap tugas mandiri, pekerjaan rumah (PR), dan portofolio materi {currentSubject.name}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Rata-rata Tugas: <b style={{ color: "#2563eb" }}>{avgTugas}</b>
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Nama Tugas & Deskripsi</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Materi Pokok</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Tanggal</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Bobot</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Nilai (0-100)</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Catatan Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubject.tugas.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                          {t.nama}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#64748b", maxWidth: "260px" }}>
                          {t.materi}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#64748b" }}>
                          {t.tanggal}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#64748b" }}>
                          {t.bobot}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, fontSize: "14px", color: "#2563eb" }}>
                          {t.nilai}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#ecfdf5",
                              color: "#059669",
                            }}
                          >
                            ✓ {t.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#475569", fontSize: "12px", fontStyle: "italic" }}>
                          &ldquo;{t.catatan}&rdquo;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BAGIAN 2: NILAI UJIAN HARIAN (UH) */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "8px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#ecfdf5",
                      color: "#059669",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    📋
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                      2. Kelompok Nilai Ujian Harian (UH)
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      Penilaian Harian (PH/UH) per bab kompetensi dasar untuk mengukur ketuntasan belajar
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Rata-rata UH: <b style={{ color: "#059669" }}>{avgUH}</b>
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Sesi Ujian Harian</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Materi / Bab Ujian</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Tanggal</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>KKM</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Nilai (0-100)</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Status Ketuntasan</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubject.ujianHarian.map((uh) => (
                      <tr key={uh.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                          {uh.nama}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#64748b", maxWidth: "260px" }}>
                          {uh.materi}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#64748b" }}>
                          {uh.tanggal}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#64748b" }}>
                          {uh.kkm}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, fontSize: "14px", color: "#059669" }}>
                          {uh.nilai}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: uh.nilai >= (uh.kkm || 75) ? "#ecfdf5" : "#fef2f2",
                              color: uh.nilai >= (uh.kkm || 75) ? "#059669" : "#dc2626",
                            }}
                          >
                            {uh.nilai >= (uh.kkm || 75) ? "✓ Tuntas" : "⚠ Remedial"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#475569", fontSize: "12px" }}>
                          {uh.catatan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BAGIAN 3: NILAI SOAL HARIAN (LATIHAN & KUIS) */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "8px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#fff7ed",
                      color: "#ea580c",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    ✏️
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                      3. Kelompok Nilai Soal Harian (Latihan / Kuis)
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      Penilaian formatif, latihan soal harian di kelas, kuis cepat, dan lembar kerja harian
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Rata-rata Soal Harian: <b style={{ color: "#ea580c" }}>{avgSoalHarian}</b>
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Nama Sesi Soal Harian</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Bentuk Latihan / Soal</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Tanggal</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Nilai (0-100)</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubject.soalHarian.map((sh) => (
                      <tr key={sh.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                          {sh.nama}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#64748b", maxWidth: "260px" }}>
                          {sh.materi}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#64748b" }}>
                          {sh.tanggal}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, fontSize: "14px", color: "#ea580c" }}>
                          {sh.nilai}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#ecfdf5",
                              color: "#059669",
                            }}
                          >
                            ✓ {sh.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#475569", fontSize: "12px" }}>
                          {sh.catatan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RUMUS KALKULASI & CATATAN BOBOT PENILAIAN */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "16px 20px",
                border: "1px dashed #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "12px",
                color: "#475569",
              }}
            >
              <div>
                <b>💡 Rumus Penilaian Akademik SD - SMP Maranatha:</b>
                <div style={{ marginTop: "4px" }}>
                  Nilai Akhir Mata Pelajaran = <code>(30% × Rata2 Tugas) + (40% × Rata2 UH) + (30% × Rata2 Soal Harian)</code>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ padding: "4px 8px", borderRadius: "6px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  KKM Minimal: <b>75</b>
                </span>
                <span style={{ padding: "4px 8px", borderRadius: "6px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  Semester: <b>Ganjil 2026/2027</b>
                </span>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

