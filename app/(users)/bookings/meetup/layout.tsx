import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Meetup",
  description:
    "Join your Blivap donation meetup session and stay connected through your appointment.",
  keywords: ["meetup", "donation session"],
  robots: { index: false, follow: false },
  path: "/bookings/meetup",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
