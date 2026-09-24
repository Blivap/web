import Cookies from "js-cookie";
import {
  AUTH_TOKEN_COOKIE,
  AUTH_TOKEN_EXPIRES_COOKIE,
  authCookieOptions,
  parseAccessTokenExpires,
} from "@/lib/auth/sessionExpiry";

export { AUTH_TOKEN_COOKIE, AUTH_TOKEN_EXPIRES_COOKIE };

export function readStoredTokenExpires(): string | null {
  if (typeof window === "undefined") return null;
  return parseAccessTokenExpires(Cookies.get(AUTH_TOKEN_EXPIRES_COOKIE));
}

export function persistAuthCookies(
  token: string,
  expiresAt: string | null,
): void {
  if (typeof window === "undefined") return;

  const cookieOpts = authCookieOptions(expiresAt);
  Cookies.set(AUTH_TOKEN_COOKIE, token, cookieOpts);
  if (expiresAt) {
    Cookies.set(AUTH_TOKEN_EXPIRES_COOKIE, expiresAt, cookieOpts);
  } else {
    Cookies.remove(AUTH_TOKEN_EXPIRES_COOKIE);
  }
}

export function clearAuthCookies(): void {
  Cookies.remove(AUTH_TOKEN_COOKIE);
  Cookies.remove(AUTH_TOKEN_EXPIRES_COOKIE);
}
