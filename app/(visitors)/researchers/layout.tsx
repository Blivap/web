import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "For Researchers",
  description:
    "Collaboration opportunities and tools for researchers advancing healthcare with Blivap.",
  keywords: [
    "researcher platform",
    "medical research data"
  ],
  path: "/researchers",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
