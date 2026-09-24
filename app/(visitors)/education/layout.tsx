import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Education & Resources",
  description:
    "Guides and resources to help you understand donation, health basics, and how to give with confidence.",
  keywords: [
    "donation education",
    "health resources"
  ],
  path: "/education",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
