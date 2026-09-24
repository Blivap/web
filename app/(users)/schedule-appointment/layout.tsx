import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Schedule Appointment",
  description:
    "Book your next donation appointment through Blivap.",
  keywords: [
    "schedule appointment",
    "book donation"
  ],
  robots: { index: false, follow: false },
  path: "/schedule-appointment",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
