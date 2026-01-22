import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Education & Resources",
  description:
    "Educational resources about blood donation, sperm donation, health, and wellness. Learn about the donation process, health benefits, and how to maintain a healthy lifestyle.",
  keywords: [
    "donation education",
    "health resources",
    "wellness information",
    "donation guides",
    "health education",
  ],
  path: "/education",
});

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
