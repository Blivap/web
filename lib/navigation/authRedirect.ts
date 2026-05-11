import { publicRoutes, routes } from "@/config/routes";

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
  return normalized !== routes.verifyEmail;
}

export function getDnRedirect(
  searchParams?: SearchParamsLike | null,
): string | null {
  const raw = searchParams?.get("dn")?.trim();
  if (!raw) return null;
  return isSafeInternalPath(raw) && isAllowedDnPath(raw) ? raw : null;
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
