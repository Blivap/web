import { absoluteSiteUrl } from "@/lib/site-origin";
import { MetadataRoute } from "next";

/**
 * Paths that must not be indexed (auth, account, transactional, or thin flows).
 * Trailing slashes match subpaths in robots.txt (e.g. /donors/ blocks /donors/xyz).
 * Do not blanket-block `/api/` — WhatsApp/X need `/api/og` for link previews.
 */
const DISALLOWED_PREFIXES = [
  "/dashboard/",
  "/overview/",
  "/settings/",
  "/wallet/",
  "/history/",
  "/donors/",
  "/bookings/",
  "/booking/",
  "/schedule-appointment/",
  "/verify-id/",
  "/select_avatar/",
  "/forgot-password/",
  "/reset-password/",
  "/verify-email/",
  "/waitlist/",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og", "/og.png"],
        disallow: [...DISALLOWED_PREFIXES],
      },
      {
        userAgent: "Twitterbot",
        allow: ["/", "/api/og", "/og.png"],
      },
    ],
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
