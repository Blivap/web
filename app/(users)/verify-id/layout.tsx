import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Verify ID",
  description:
    "Complete identity verification to keep your Blivap account trusted and secure.",
  keywords: [
    "verify id",
    "identity verification"
  ],
  robots: { index: false, follow: false },
  path: "/verify-id",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
