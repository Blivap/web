import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Lifesaving Research",
  description:
    "Explore how Blivap supports medical research and knowledge that improves care.",
  keywords: [
    "medical research",
    "research data"
  ],
  path: "/research",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
