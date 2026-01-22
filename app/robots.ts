import { MetadataRoute } from "next";
import { config } from "./utils/config";

const { url, env } = config;
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/wallet/",
          "/history/",
          "/active_donors/",
          "/waitlist/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/wallet/",
          "/history/",
          "/active_donors/",
          "/waitlist/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/wallet/",
          "/history/",
          "/active_donors/",
          "/waitlist/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
