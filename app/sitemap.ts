import { MetadataRoute } from "next";
import { config } from "./utils/config";

const { url, env } = config;
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/about-blood",
    "/about-donating",
    "/about-sperm",
    "/contact",
    "/education",
    "/faq",
    "/giving-blood",
    "/healthcare",
    "/news",
    "/our-expertise",
    "/research",
    "/what-we-do",
    "/auth",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" || route === "/news"
        ? ("daily" as const)
        : route === "/auth"
          ? ("monthly" as const)
          : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route === "/about" || route === "/about-donating"
          ? 0.9
          : 0.7,
  }));
}
