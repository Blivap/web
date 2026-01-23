import { Metadata } from "next";
import { config } from "./config";

const { url, env } = config;
const siteUrl = env === "development" ? "http://localhost:3000" : url;

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  path?: string;
  image?: string;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  path = "",
  image,
}: PageMetadata): Metadata {
  const pageUrl = new URL(path || "/", siteUrl).toString();
  const ogImageUrl = image
    ? new URL(image, siteUrl).toString()
    : new URL(
        `/api/og${path ? `?title=${encodeURIComponent(title)}` : ""}`,
        siteUrl,
      ).toString();

  const defaultKeywords = [
    "blood donation",
    "sperm donation",
    "Nigeria",
    "donate blood",
    "save lives",
    "blood bank",
    "healthcare",
    "medical donation",
    "Blivap",
  ];

  return {
    title: {
      default: title,
      template: "%s | Blivap",
    },
    description,
    keywords: [...defaultKeywords, ...keywords],
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["en_NG"],
      url: pageUrl,
      siteName: "Blivap",
      title: ogTitle || title,
      description: ogDescription || description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} | Blivap`,
          type: "image/png",
          secureUrl: ogImageUrl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle || title,
      description: ogDescription || description,
      images: [ogImageUrl],
      creator: "@blivap",
      site: "@blivap",
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/png",
      "og:image:secure_url": ogImageUrl,
    },
  };
}
