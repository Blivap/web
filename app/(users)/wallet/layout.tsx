import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Wallet",
  description:
    "Track earnings and payments in your Blivap wallet.",
  keywords: [
    "wallet",
    "payments"
  ],
  robots: { index: false, follow: false },
  path: "/wallet",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
