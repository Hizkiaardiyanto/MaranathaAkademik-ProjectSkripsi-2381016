"use client";

import { useEffect, useState, useCallback } from "react";

export function useSidebarCollapse(storageKey = "maranatha_sidebar_collapsed") {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // LocalStorage might be disabled in private mode
    }
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
    isCollapsed: mounted ? isCollapsed : false,
    isMobileOpen,
    toggleSidebar,
    closeMobile,
    setIsCollapsed,
  };
}

