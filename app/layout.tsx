import type { Metadata, Viewport } from "next";
import { SessionGuard } from "../components/session-guard";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#198caf",
};

export const metadata: Metadata = {
  title: "SD - SMP Kristen Maranatha",
  description: "Sistem informasi akademik SD - SMP Kristen Maranatha",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <SessionGuard>{children}</SessionGuard>
      </body>
    </html>
  );
}
