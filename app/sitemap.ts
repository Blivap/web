import { absoluteSiteUrl } from "@/lib/site-origin";
import { MetadataRoute } from "next";

/**
 * Public indexable routes only — aligned with app/robots.ts (no auth, account, or waitlist).
 * Order: highest business value first, then grouped by theme.
 */
const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/what-we-do", changeFrequency: "weekly", priority: 0.95 },
  { path: "/giving-blood", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about-blood", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about-sperm", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about-donating", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "weekly", priority: 0.9 },
  { path: "/our-expertise", changeFrequency: "weekly", priority: 0.85 },
  { path: "/healthcare", changeFrequency: "weekly", priority: 0.85 },
  { path: "/healthcare&professionals", changeFrequency: "weekly", priority: 0.85 },
  { path: "/education", changeFrequency: "weekly", priority: 0.85 },
  { path: "/research", changeFrequency: "weekly", priority: 0.8 },
  { path: "/researchers", changeFrequency: "weekly", priority: 0.8 },
  { path: "/news", changeFrequency: "daily", priority: 0.8 },
  { path: "/book-demo", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.8 },
  { path: "/working_at", changeFrequency: "monthly", priority: 0.75 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.5 },
  { path: "/vulnerability-disclosure", changeFrequency: "yearly", priority: 0.45 },
  { path: "/login", changeFrequency: "monthly", priority: 0.4 },
  { path: "/register", changeFrequency: "monthly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteSiteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
