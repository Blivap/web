import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "News & Updates",
  description:
    "Updates, stories, and announcements from Blivap and the communities we serve.",
  keywords: [
    "Blivap news",
    "donation stories"
  ],
  path: "/news",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
