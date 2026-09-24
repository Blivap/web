import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Settings",
  description:
    "Update your Blivap profile, preferences, and account details.",
  keywords: [
    "settings",
    "account"
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
