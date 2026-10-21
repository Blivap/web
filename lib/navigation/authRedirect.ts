import { publicRoutes, requiresAuth, routes } from "@/config/routes";

type SearchParamsLike = {
  get(name: string): string | null;
};

const DN_STORAGE_KEY = "blivap:auth:dn";
/** Set before setCredentials so AuthLayout does not race applyAuthSession. */
const POST_LOGIN_NAV_KEY = "blivap:auth:post-login-nav";

function isSafeInternalPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/api") &&
    !path.startsWith("/_next")
  );
}

function normalizePath(path: string): string {
  const [pathname] = path.split("?");
  if (!pathname) return path;
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

function isAllowedDnPath(path: string): boolean {
  const normalized = normalizePath(path);
  if (publicRoutes.includes(normalized)) return false;
  // Auth hops themselves are not valid return destinations
  if (
    normalized === routes.verifyEmail ||
    normalized === routes.login ||
    normalized === routes.register ||
    normalized === routes.forgotPassword ||
    normalized === routes.resetPassword ||
    normalized === routes.selectAvatar
  ) {
    return false;
  }
  // Only allow return to known protected app areas (not arbitrary 404 URLs)
  return requiresAuth(normalized);
}

/** Build a path+search candidate from pathname and optional search (`?a=1` or `a=1`). */
export function pathFromParts(
  pathname: string,
  search?: string | null,
): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!search) return path;
  const q = search.startsWith("?") ? search.slice(1) : search;
  return q ? `${path}?${q}` : path;
}

/** Current browser location as path+search (client only). */
export function pathFromLocation(): string {
  if (typeof window === "undefined") return routes.overview;
  return pathFromParts(window.location.pathname, window.location.search);
}

/**
 * Validate a candidate return path (pathname + optional query).
 * Rejects open redirects, public/marketing pages, and auth hop pages.
 */
export function sanitizeReturnPath(
  path: string | null | undefined,
): string | null {
  const raw = path?.trim();
  if (!raw) return null;
  return isSafeInternalPath(raw) && isAllowedDnPath(raw) ? raw : null;
}

function decodeDnCandidate(raw: string): string {
  let value = raw.trim();
  // Tolerate accidental double-encoding from redirects / email clients.
  for (let i = 0; i < 2; i += 1) {
    if (!value.includes("%")) break;
    try {
      const decoded = decodeURIComponent(value);
      if (decoded === value) break;
      value = decoded;
    } catch {
      break;
    }
  }
  return value;
}

export function persistDn(path: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    const safe = sanitizeReturnPath(path);
    if (safe) sessionStorage.setItem(DN_STORAGE_KEY, safe);
    else sessionStorage.removeItem(DN_STORAGE_KEY);
  } catch {
    /* private mode / blocked storage */
  }
}

/** Call immediately before setCredentials during login/register. */
export function markPostLoginNavigation(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(POST_LOGIN_NAV_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Returns true once if applyAuthSession owns the next auth-page bounce. */
export function consumePostLoginNavigation(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const active = sessionStorage.getItem(POST_LOGIN_NAV_KEY) === "1";
    if (active) sessionStorage.removeItem(POST_LOGIN_NAV_KEY);
    return active;
  } catch {
    return false;
  }
}

export function peekStoredDn(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sanitizeReturnPath(sessionStorage.getItem(DN_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function consumeStoredDn(): string | null {
  const value = peekStoredDn();
  if (typeof window === "undefined") return value;
  try {
    sessionStorage.removeItem(DN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return value;
}

export function getDnRedirect(
  searchParams?: SearchParamsLike | null,
): string | null {
  const raw = searchParams?.get("dn");
  if (!raw?.trim()) return null;
  const safe = sanitizeReturnPath(decodeDnCandidate(raw));
  if (safe) persistDn(safe);
  return safe;
}

/**
 * Prefer React searchParams, then the live browser URL, then sessionStorage
 * (survives AuthLayout / middleware races that drop the query string).
 */
export function resolveDnRedirect(
  searchParams?: SearchParamsLike | null,
): string | null {
  const fromParams = getDnRedirect(searchParams);
  if (fromParams) return fromParams;
  if (typeof window === "undefined") return null;
  const fromWindow = getDnRedirect(
    new URLSearchParams(window.location.search),
  );
  if (fromWindow) return fromWindow;
  return peekStoredDn();
}

export function getPostAuthRedirect(
  searchParams?: SearchParamsLike | null,
  fallback: string = routes.overview,
): string {
  return resolveDnRedirect(searchParams) ?? fallback;
}

export function withDn(path: string, dn?: string | null): string {
  if (!dn) return path;

  const safe = sanitizeReturnPath(dn);
  if (safe) persistDn(safe);

  const [pathname, existingQuery = ""] = path.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set("dn", safe ?? dn);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Login URL that carries a validated return destination as `dn`.
 * When the candidate is invalid/public/auth, returns bare `/login`.
 */
export function loginWithReturn(
  pathnameOrFull?: string | null,
  search?: string | null,
): string {
  const candidate =
    pathnameOrFull == null
      ? null
      : pathnameOrFull.includes("?") || search == null
        ? pathnameOrFull
        : pathFromParts(pathnameOrFull, search);

  const dn = sanitizeReturnPath(candidate);
  if (dn) persistDn(dn);
  return withDn(routes.login, dn);
}
