import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Our Expertise",
  description:
    "Learn about Blivap's expertise in medical donations, healthcare technology, and connecting donors with recipients. Our team brings years of experience in healthcare and technology.",
  keywords: [
    "Blivap expertise",
    "healthcare technology",
    "medical expertise",
    "donation expertise",
    "healthcare professionals",
  ],
  path: "/our-expertise",
});

export default function OurExpertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
