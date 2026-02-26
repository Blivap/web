import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Privacy & Cookies",
  description:
    "Blivap's privacy policy and cookie policy. Learn how we collect, use, and protect your personal information when you use our donation platform.",
  keywords: [
    "privacy policy",
    "cookies",
    "data protection",
    "personal information",
    "Blivap privacy",
  ],
  path: "/privacy",
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
