"use client";

import { useEffect, useState, useCallback } from "react";

export function useSidebarCollapse(storageKey = "maranatha_sidebar_collapsed") {
  // Default TERBUKA agar sidebar tidak berkedip saat pindah halaman.
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // Pulihkan pilihan terakhir pengguna setelah paint agar hydration tetap deterministik.
    const restoreFrame = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) setIsCollapsed(saved === "true");
      } catch {
        // LocalStorage might be disabled in private mode.
      }
    });

    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth > 820) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [storageKey]);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 820) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(storageKey, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, [storageKey]);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return {
    isCollapsed,
    isMobileOpen,
    toggleSidebar,
    closeMobile,
    setIsCollapsed,
  };
}