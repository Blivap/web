import { config } from "@/config/env";

/**
 * Canonical origin for robots, sitemap, and absolute links.
 * Uses localhost in development so local builds match how you browse the app.
 */
export function getSiteOrigin(): string {
  const { url, env } = config;
  const raw = (env === "development" ? "http://localhost:3000" : url).trim();
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
  const encodedPath = "/" + segments.map((s) => encodeURIComponent(s)).join("/");
  return `${origin}${encodedPath}`;
}
