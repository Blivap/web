import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Contact Us",
  description:
    "Reach the Blivap team for support, partnerships, or questions about donating and receiving care.",
  keywords: [
    "contact Blivap",
    "customer support"
  ],
  path: "/contact",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
