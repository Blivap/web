import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Bookings",
  description:
    "View and manage your Blivap donation appointments and meetings.",
  keywords: [
    "bookings",
    "appointments"
  ],
  robots: { index: false, follow: false },
  path: "/bookings",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
