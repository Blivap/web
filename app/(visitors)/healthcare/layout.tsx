import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Healthcare Services",
  description:
    "Healthcare services and support connected through Blivap's trusted digital platform.",
  keywords: [
    "healthcare services",
    "medical facilities"
  ],
  path: "/healthcare",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
