import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import pool from "./db";

export type RecordArea = "academic" | "portal";
export type StoredRecord = {
  id: string;
  [key: string]: string | number;
};

type StoredRecordRow = RowDataPacket & {
  id: string;
  payload: StoredRecord | string;
};

function parsePayload(value: StoredRecord | string, id: string): StoredRecord {
  const payload =
    typeof value === "string" ? (JSON.parse(value) as unknown) : value;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Format record pada database tidak valid.");
  }
  return { ...(payload as Omit<StoredRecord, "id">), id };
}

export async function listStoredRecords(
  area: RecordArea,
  resource: string,
): Promise<StoredRecord[]> {
  const [rows] = await pool.execute<StoredRecordRow[]>(
    "SELECT id, payload FROM app_records WHERE area = ? AND resource = ? ORDER BY created_at DESC, id DESC",
    [area, resource],
  );
  return rows.map((row) => parsePayload(row.payload, row.id));
}

export async function createStoredRecord(
  area: RecordArea,
  resource: string,
  input: Omit<StoredRecord, "id">,
): Promise<StoredRecord> {
  const id = randomUUID();
  const payload = { ...input, id };
  await pool.execute(
    "INSERT INTO app_records (area, resource, id, payload) VALUES (?, ?, ?, ?)",
    [area, resource, id, JSON.stringify(payload)],
  );
  return payload;
}

export async function updateStoredRecord(
  area: RecordArea,
  resource: string,
  id: string,
  input: Partial<Omit<StoredRecord, "id">>,
): Promise<StoredRecord | null> {
  const [rows] = await pool.execute<StoredRecordRow[]>(
    "SELECT id, payload FROM app_records WHERE area = ? AND resource = ? AND id = ? LIMIT 1",
    [area, resource, id],
  );
  const current = rows[0];
  if (!current) return null;

  const next = { ...parsePayload(current.payload, id), ...input, id };
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE app_records SET payload = ? WHERE area = ? AND resource = ? AND id = ?",
    [JSON.stringify(next), area, resource, id],
  );
  if (result.affectedRows === 0) return null;
  return next;
}

export async function deleteStoredRecord(
  area: RecordArea,
  resource: string,
  id: string,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM app_records WHERE area = ? AND resource = ? AND id = ?",
    [area, resource, id],
  );
  return result.affectedRows > 0;
}
