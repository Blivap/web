import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Register as Donor",
  description:
    "Complete your donor registration and screening on Blivap.",
  keywords: [
    "donor registration"
  ],
  robots: { index: false, follow: false },
  path: "/donors/new",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
