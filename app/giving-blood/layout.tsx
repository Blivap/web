import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Giving Blood",
  description:
    "Start your blood donation journey with Blivap. Learn how to give blood, find donation centers, schedule appointments, and make a life-saving difference in Nigeria.",
  keywords: [
    "give blood",
    "blood donation centers",
    "donate blood Nigeria",
    "blood donation appointment",
    "blood donor registration",
  ],
  path: "/giving-blood",
});

export default function GivingBloodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
