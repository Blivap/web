import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Lifesaving Research",
  description:
    "Explore medical research opportunities with Blivap. Access research data, collaborate with researchers, and contribute to advancing medical science in Nigeria.",
  keywords: [
    "medical research",
    "research data",
    "medical studies",
    "research collaboration",
    "healthcare research Nigeria",
  ],
  path: "/research",
});

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
