import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/portal-siswa") ||
    pathname.startsWith("/portal-guru") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/student-register") ||
    pathname.startsWith("/api/teacher-register");
  const session = verifySessionToken(
    request.cookies.get("edunusa_session")?.value,
  );
  const isStudentPortal =
    pathname === "/portal-siswa" || pathname.startsWith("/portal-siswa/");
  const isTeacherPortal =
    pathname === "/portal-guru" || pathname.startsWith("/portal-guru/");
  const isAdmin =
    session?.role === "Administrator" || session?.role === "Kepala Sekolah";
  const legacyPortalRoutes: Record<
    string,
    Partial<Record<"Siswa" | "Guru", string>>
  > = {
    "/jadwal": { Siswa: "/portal-siswa/jadwal", Guru: "/portal-guru/jadwal" },
    "/kelas": { Siswa: "/portal-siswa/kelas", Guru: "/portal-guru/kelas" },
    "/absensi": {
      Siswa: "/portal-siswa/kehadiran",
      Guru: "/portal-guru/kehadiran",
    },
    "/nilai": { Siswa: "/portal-siswa/nilai", Guru: "/portal-guru/nilai" },
    "/rapor": { Siswa: "/portal-siswa/rapor" },
    "/mata-pelajaran": {
      Siswa: "/portal-siswa/mata-pelajaran",
      Guru: "/portal-guru/mata-pelajaran",
    },
    "/siswa": { Siswa: "/portal-siswa/kelas", Guru: "/portal-guru/kelas" },
  };

  if (session?.role === "Siswa" || session?.role === "Guru") {
    const destination = legacyPortalRoutes[pathname]?.[session.role];
    if (destination)
      return NextResponse.redirect(new URL(destination, request.url));
  }

  if (
    pathname.startsWith("/api/academic") ||
    pathname.startsWith("/api/students") ||
    pathname.startsWith("/api/teachers") ||
    pathname.startsWith("/api/student-registrations")
  ) {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Akses admin diperlukan." },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) return NextResponse.next();

  if (isStudentPortal && pathname !== "/portal-siswa/register") {
    if (session?.role !== "Siswa") {
      const loginUrl = new URL("/login/siswa", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isTeacherPortal && pathname !== "/portal-guru/register") {
    if (session?.role !== "Guru") {
      const loginUrl = new URL("/login/guru", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (!session && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname === "/login") {
    const destination =
      session.role === "Siswa"
        ? "/portal-siswa"
        : session.role === "Guru"
          ? "/portal-guru"
          : "/";
    const homeUrl = new URL(destination, request.url);
    return NextResponse.redirect(homeUrl);
  }

  if (!isAuthRoute && !isAdmin) {
    const loginUrl = new URL(
      session?.role === "Siswa"
        ? "/login/siswa"
        : session?.role === "Guru"
          ? "/login/guru"
          : "/login",
      request.url,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
