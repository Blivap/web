import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Frequently Asked Questions",
  description:
    "Clear answers about eligibility, the donation process, safety, and using Blivap.",
  keywords: ["donation FAQ", "organ donation", "blood donation", "donor eligibility"],
  path: "/faq",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
