import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "About Us",
  description:
    "Learn about Blivap's mission to connect blood and sperm donors with recipients across Nigeria. Discover how we're revolutionizing medical donations and saving lives.",
  keywords: ["about Blivap", "our mission", "blood donation platform", "medical services Nigeria"],
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
