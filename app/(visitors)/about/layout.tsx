import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "About Us",
  description:
    "Learn who we are and why Blivap exists to connect donors, recipients, and healthcare partners across Nigeria.",
  keywords: [
    "about Blivap",
    "our mission",
    "blood donation platform",
    "medical services Nigeria"
  ],
  path: "/about",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
