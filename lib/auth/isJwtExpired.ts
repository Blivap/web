/**
 * Best-effort JWT expiry check. Opaque (non-JWT) tokens return false —
 * the API /me check remains the source of truth for those.
 */
export function isJwtExpired(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as { exp?: unknown };
    if (typeof payload.exp !== "number") return false;
    // Small skew so we don't keep a nearly-expired token around
    return payload.exp * 1000 <= Date.now() + 5_000;
  } catch {
    return false;
  }
}
