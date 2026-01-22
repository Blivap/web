import { MetadataRoute } from "next";
import { config } from "./utils/config";

const { url, env } = config;
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1.0, changeFreq: "daily" as const },
    { path: "/about", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/about-blood", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/about-donating", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/about-sperm", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/contact", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/education", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/faq", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/giving-blood", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/healthcare", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/healthcare&professionals", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/news", priority: 0.8, changeFreq: "daily" as const },
    { path: "/our-expertise", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/research", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/researchers", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/what-we-do", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/working_at", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/login", priority: 0.5, changeFreq: "monthly" as const },
    { path: "/register", priority: 0.5, changeFreq: "monthly" as const },
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
