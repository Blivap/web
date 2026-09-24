import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "What We Do",
  description:
    "See how Blivap helps people give and receive support — from donation pathways to trusted healthcare connections.",
  keywords: [
    "Blivap services",
    "donation platform",
    "what we do"
  ],
  path: "/what-we-do",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
