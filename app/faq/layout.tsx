import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about blood donation, sperm donation, eligibility, the donation process, compensation, and more on Blivap.",
  keywords: [
    "blood donation FAQ",
    "sperm donation FAQ",
    "donation questions",
    "eligibility requirements",
    "donation process",
  ],
  path: "/faq",
});

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
