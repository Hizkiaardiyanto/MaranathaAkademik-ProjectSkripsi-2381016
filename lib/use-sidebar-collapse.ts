"use client";

import { useEffect, useState, useCallback } from "react";

export function useSidebarCollapse(storageKey = "maranatha_sidebar_collapsed") {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer restoration until after paint so SSR/hydration stays deterministic.
    const restoreFrame = window.requestAnimationFrame(() => {
      setMounted(true);
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
    isCollapsed: mounted ? isCollapsed : true,
    isMobileOpen,
    toggleSidebar,
    closeMobile,
    setIsCollapsed,
  };
}

