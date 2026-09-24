import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Giving Blood",
  description:
    "Ready to give blood? Learn what to expect before, during, and after your donation with Blivap.",
  keywords: [
    "give blood",
    "blood donation centers",
    "blood donation appointment"
  ],
  path: "/giving-blood",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
