import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "About Blood Donation",
  description:
    "Learn everything about blood donation in Nigeria. Understand the process, benefits, eligibility requirements, and how you can save lives through blood donation.",
  keywords: [
    "blood donation information",
    "how to donate blood",
    "blood donation process",
    "blood types",
    "blood donation benefits",
  ],
  path: "/about-blood",
});

export default function AboutBloodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
