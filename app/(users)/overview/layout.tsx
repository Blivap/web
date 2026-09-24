import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Overview",
  description:
    "Your Blivap home — start a donation, see active donors, and manage your account.",
  keywords: [
    "overview",
    "dashboard"
  ],
  robots: { index: false, follow: false },
  path: "/overview",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
