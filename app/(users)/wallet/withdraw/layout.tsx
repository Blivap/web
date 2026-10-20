import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Withdraw",
  description: "Withdraw funds from your Blivap wallet to your bank account.",
  keywords: ["wallet", "withdraw", "payout"],
  robots: { index: false, follow: false },
  path: "/wallet/withdraw",
});

export default function WithdrawLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
