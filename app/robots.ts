import { MetadataRoute } from "next";
import config from "./utils/config";

const { url, env } = config();
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/settings/", "/wallet/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/settings/", "/wallet/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
