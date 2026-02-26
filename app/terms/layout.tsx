import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Terms and Conditions",
  description:
    "Terms and conditions for using Blivap's blood and sperm donation platform. Read our user agreement, eligibility requirements, and service terms.",
  keywords: [
    "terms and conditions",
    "terms of service",
    "user agreement",
    "Blivap terms",
  ],
  path: "/terms",
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
