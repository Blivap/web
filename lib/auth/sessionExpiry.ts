import { config } from "@/config/env";
import { isJwtExpired } from "@/lib/auth/isJwtExpired";

export const AUTH_TOKEN_COOKIE = "auth_token";
export const AUTH_TOKEN_EXPIRES_COOKIE = "auth_token_expires";

/** Skew so we clear slightly before the absolute expiry. */
const EXPIRY_SKEW_MS = 5_000;

export function parseAccessTokenExpires(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

export function extractAccessTokenExpires(auth: {
  accessTokenExpires?: string;
  access_token_expires?: string;
}): string | null {
  return parseAccessTokenExpires(
    auth.accessTokenExpires ?? auth.access_token_expires,
  );
}

export function isExpiresAtPast(
  expiresAt: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!expiresAt) return false;
  const ms = Date.parse(expiresAt);
  if (Number.isNaN(ms)) return false;
  return ms <= nowMs + EXPIRY_SKEW_MS;
}

/** Prefer server-provided expiry; fall back to JWT `exp` when present. */
export function isSessionExpired(
  token: string | null | undefined,
  expiresAt?: string | null,
): boolean {
  if (isExpiresAtPast(expiresAt)) return true;
  if (!token) return false;
  return isJwtExpired(token);
}

/** ms until session should end (clamped). null if no known expiry. */
export function msUntilSessionExpiry(
  expiresAt: string | null | undefined,
  nowMs: number = Date.now(),
): number | null {
  if (!expiresAt) return null;
  const ms = Date.parse(expiresAt);
  if (Number.isNaN(ms)) return null;
  return Math.max(0, ms - nowMs - EXPIRY_SKEW_MS);
}

/** Cookie options shared by client cookie writes (not used on the edge). */
export function authCookieOptions(expiresAt: string | null) {
  const expiresDate = expiresAt ? new Date(expiresAt) : undefined;
  return {
    sameSite: "lax" as const,
    secure: config.env === "production",
    ...(expiresDate && !Number.isNaN(expiresDate.getTime())
      ? { expires: expiresDate }
      : { expires: 7 }),
  };
}
