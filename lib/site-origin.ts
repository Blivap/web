import { config } from "@/config/env";

/**
 * Canonical origin for robots, sitemap, and absolute links.
 * Prefer the configured public site URL (never force localhost when BASE_URL is set).
 */
export function getSiteOrigin(): string {
  const { url } = config;
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    url ||
    "http://localhost:3000";
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

/**
 * Absolute URL for a site pathname (with leading slash). Encodes each path
 * segment so reserved characters (e.g. `&`) are valid in sitemaps and hrefs.
 */
export function absoluteSiteUrl(pathname: string): string {
  const origin = getSiteOrigin();
  if (!pathname || pathname === "/") {
    return origin;
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = path.split("/").filter(Boolean);
  const encodedPath =
    "/" + segments.map((s) => encodeURIComponent(s)).join("/");
  return `${origin}${encodedPath}`;
}
