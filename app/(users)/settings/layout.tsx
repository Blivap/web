import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Settings",
  description:
    "Update your Blivap profile, notifications, security, and account preferences.",
  keywords: [
    "settings",
    "account",
    "notifications",
    "privacy",
    "donation history",
  ],
  robots: { index: false, follow: false },
  path: "/settings",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
