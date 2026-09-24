import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Terms and Conditions",
  description:
    "The rules for using Blivap — eligibility, responsibilities, and service terms explained clearly.",
  keywords: [
    "terms and conditions",
    "terms of service"
  ],
  path: "/terms",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
