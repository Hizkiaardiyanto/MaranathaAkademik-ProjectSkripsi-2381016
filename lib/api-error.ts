export async function getApiErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const payload: unknown = await response.json();
    if (
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
    ) {
      return payload.error;
    }
  } catch {
    return fallback;
  }
  return fallback;
}
