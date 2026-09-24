import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "About Blood Donation",
  description:
    "Understand blood donation, who can give, and how your donation helps patients who need it most.",
  keywords: [
    "blood donation information",
    "how to donate blood",
    "blood donation process",
    "blood donation benefits"
  ],
  path: "/about-blood",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
