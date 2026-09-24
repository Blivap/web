import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "About Donating",
  description:
    "A simple guide to getting started as a donor — from registration to making your first contribution.",
  keywords: [
    "about donating",
    "how to donate",
    "become a donor"
  ],
  path: "/about-donating",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
