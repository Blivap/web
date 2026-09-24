import { publicRoutes, requiresAuth, routes } from "@/config/routes";

type SearchParamsLike = {
  get(name: string): string | null;
};

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

export function getDnRedirect(
  searchParams?: SearchParamsLike | null,
): string | null {
  const raw = searchParams?.get("dn")?.trim();
  if (!raw) return null;
  return sanitizeReturnPath(raw);
}

export function getPostAuthRedirect(
  searchParams?: SearchParamsLike | null,
  fallback: string = routes.overview,
): string {
  return getDnRedirect(searchParams) ?? fallback;
}

export function withDn(path: string, dn?: string | null): string {
  if (!dn) return path;

  const [pathname, existingQuery = ""] = path.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set("dn", dn);

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
  return withDn(routes.login, dn);
}
