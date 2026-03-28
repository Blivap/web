import { config } from "@/config/env";
import { MetadataRoute } from "next";

const { url, env } = config;
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/wallet/",
          "/history/",
          "/donors/",
          "/waitlist/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/og"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/wallet/",
          "/history/",
          "/donors/",
          "/waitlist/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/api/og"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/wallet/",
          "/history/",
          "/donors/",
          "/waitlist/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
