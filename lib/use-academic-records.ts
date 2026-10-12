"use client";

import { useEffect, useState } from "react";
import type { AcademicRecord, AcademicResource } from "./academic-data";
import { getApiErrorMessage } from "./api-error";

export function useAcademicRecords<T extends AcademicRecord>(
  resource: AcademicResource,
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        const response = await fetch(`/api/academic/${resource}`);
        if (!response.ok) {
          const message = await getApiErrorMessage(
            response,
            "Data tidak dapat dimuat.",
          );
          throw new Error(message);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Format data dari server tidak valid.");
        }
        if (active) {
          setRows(data as T[]);
          setError("");
        }
      } catch (loadError) {
        console.error(`Failed to load ${resource}:`, loadError);
        if (active) {
          setRows([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Koneksi gagal. Silakan coba lagi.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRecords();

    return () => {
      active = false;
    };
  }, [resource]);

  async function saveRecord(
    input: Omit<T, "id">,
    id?: string,
  ): Promise<T | null> {
    setError("");
    try {
      const response = await fetch(
        id ? `/api/academic/${resource}/${id}` : `/api/academic/${resource}`,
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Data tidak dapat disimpan."),
        );
      }

      const saved = (await response.json()) as T;
      setRows((current) =>
        id
          ? current.map((row) => (row.id === id ? saved : row))
          : [...current, saved],
      );
      return saved;
    } catch (saveError) {
      console.error(`Failed to save ${resource}:`, saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Koneksi gagal. Data tidak dapat disimpan.",
      );
      return null;
    }
  }

  async function removeRecord(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/academic/${resource}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Data tidak dapat dihapus."),
        );
      }

      setRows((current) => current.filter((row) => row.id !== id));
      return true;
    } catch (deleteError) {
      console.error(`Failed to delete ${resource} record ${id}:`, deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Koneksi gagal. Data tidak dapat dihapus.",
      );
      return false;
    }
  }

  function clearError() {
    setError("");
  }

  return { rows, loading, error, clearError, saveRecord, removeRecord };
}
