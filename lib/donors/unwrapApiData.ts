/** Unwraps `{ data: T }` from typical Nest responses, or returns the object. */
export function unwrapApiRecord(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.data !== undefined && typeof d.data === "object" && d.data !== null) {
    return d.data as Record<string, unknown>;
  }
  return d as Record<string, unknown>;
}
