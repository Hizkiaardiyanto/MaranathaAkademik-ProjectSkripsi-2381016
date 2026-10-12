import {
  createStoredRecord,
  deleteStoredRecord,
  listStoredRecords,
  updateStoredRecord,
  type StoredRecord,
} from "./app-record-store";

export type AcademicResource =
  | "classes"
  | "schedules"
  | "subjects"
  | "grades"
  | "attendance";

export type AcademicRecord = StoredRecord;

const academicResources: AcademicResource[] = [
  "classes",
  "schedules",
  "subjects",
  "grades",
  "attendance",
];

export function isAcademicResource(value: string): value is AcademicResource {
  return academicResources.includes(value as AcademicResource);
}

export function listRecords(resource: AcademicResource) {
  return listStoredRecords("academic", resource);
}

export function createRecord(
  resource: AcademicResource,
  input: Omit<AcademicRecord, "id">,
) {
  return createStoredRecord("academic", resource, input);
}

export function updateRecord(
  resource: AcademicResource,
  id: string,
  input: Partial<Omit<AcademicRecord, "id">>,
) {
  return updateStoredRecord("academic", resource, id, input);
}

export function deleteRecord(resource: AcademicResource, id: string) {
  return deleteStoredRecord("academic", resource, id);
}
