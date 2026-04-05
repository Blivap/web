import { generateMetadata } from "@/lib/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "What We Do",
  description:
    "Discover how Blivap connects donors with recipients, facilitates life-saving donations, and supports the healthcare system in Nigeria through our innovative platform.",
  keywords: [
    "Blivap services",
    "donation platform",
    "healthcare services",
    "donor matching",
    "medical platform Nigeria",
  ],
  path: "/what-we-do",
});

export default function WhatWeDoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
