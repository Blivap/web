import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "About Sperm Donation",
  description:
    "Learn about sperm donation in Nigeria. Understand the process, requirements, compensation, and how you can help families while earning money through sperm donation.",
  keywords: [
    "sperm donation Nigeria",
    "sperm donor",
    "fertility donation",
    "sperm donation process",
    "become a sperm donor",
  ],
  path: "/about-sperm",
});

export default function AboutSpermLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
