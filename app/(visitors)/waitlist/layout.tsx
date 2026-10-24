import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Waitlist",
  description:
    "Join the Blivap app waitlist for the App Store or Google Play. We'll email you when the mobile app is ready.",
  keywords: ["Blivap waitlist", "Blivap app", "App Store", "Google Play"],
  robots: { index: false, follow: false },
  path: "/waitlist",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
