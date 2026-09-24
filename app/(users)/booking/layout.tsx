import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Booking",
  description:
    "Continue your Blivap booking flow and confirm appointment details.",
  keywords: [
    "booking"
  ],
  robots: { index: false, follow: false },
  path: "/booking",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
