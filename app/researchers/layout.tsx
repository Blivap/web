import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "For Researchers",
  description:
    "Join Blivap as a researcher. Access large datasets, collaborate with international researchers, and advance medical science through our research platform in Nigeria.",
  keywords: [
    "researcher platform",
    "medical research data",
    "research collaboration",
    "research opportunities",
    "medical data access",
  ],
  path: "/researchers",
});

export default function ResearchersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
