"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { sessionMarkerKey } from "../lib/browser-session";

function getLoginPath(pathname: string) {
  if (pathname.startsWith("/portal-siswa")) return "/login/siswa";
  if (pathname.startsWith("/portal-guru")) return "/login/guru";
  return "/login";
}

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname === "/portal-siswa/register" ||
    pathname === "/portal-guru/register"
  );
}

export function SessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const body = document.body;
    if (isPublicPath(pathname)) {
      body.style.visibility = "";
      return;
    }

    body.style.visibility = "hidden";
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    const isReload = navigation?.type === "reload";
    let hasSessionMarker = false;
    try {
      hasSessionMarker =
        window.sessionStorage.getItem(sessionMarkerKey) === "active";
    } catch (error) {
      console.error("Unable to read the browser session marker:", error);
    }

    if (!isReload && hasSessionMarker) {
      body.style.visibility = "";
      return;
    }

    try {
      window.sessionStorage.removeItem(sessionMarkerKey);
    } catch (error) {
      console.error("Unable to clear the browser session marker:", error);
    }

    void (async () => {
      try {
        const response = await fetch("/api/logout", {
          method: "POST",
          cache: "no-store",
        });
        if (!response.ok) {
          console.error("Unable to end the previous session.");
        }
      } catch (error) {
        console.error("Unable to end the previous session:", error);
      } finally {
        window.location.replace(getLoginPath(pathname));
      }
    })();
  }, [pathname]);

  return children;
}
