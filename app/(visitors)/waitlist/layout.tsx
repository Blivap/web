import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Waitlist",
  description:
    "Join the Blivap waitlist to be first to know when new features and the mobile app go live.",
  keywords: [
    "Blivap waitlist",
    "app waitlist"
  ],
  robots: { index: false, follow: false },
  path: "/waitlist",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
