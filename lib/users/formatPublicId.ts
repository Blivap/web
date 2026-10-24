/**
 * Anonymous platform handle — always shown in ALL CAPS.
 * Returns `null` when the value is missing/blank (never invent a truncated user id).
 */
export function formatPublicId(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  return value.toUpperCase();
}

/** UI label for a public id; falls back to a short placeholder, never a Mongo user id. */
export function displayPublicId(
  raw: string | null | undefined,
  fallback = "USER",
): string {
  return formatPublicId(raw) ?? fallback;
}
