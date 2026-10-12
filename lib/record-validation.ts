export function isRecordInput(
  value: unknown,
): value is Record<string, string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([key, item]) =>
        key !== "id" &&
        (typeof item === "string" ||
          (typeof item === "number" && Number.isFinite(item))),
    )
  );
}
