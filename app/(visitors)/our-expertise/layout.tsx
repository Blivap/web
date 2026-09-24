import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Our Expertise",
  description:
    "How Blivap combines healthcare insight and technology to make giving safer and simpler.",
  keywords: [
    "Blivap expertise",
    "healthcare technology"
  ],
  path: "/our-expertise",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
