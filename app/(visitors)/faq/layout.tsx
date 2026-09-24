import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Frequently Asked Questions",
  description:
    "Clear answers about eligibility, the donation process, safety, and using Blivap.",
  keywords: [
    "blood donation FAQ",
    "sperm donation FAQ"
  ],
  path: "/faq",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
