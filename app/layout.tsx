import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduNusa Akademik",
  description: "Dashboard sekolah modern berbasis Next.js",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
