import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Working at Blivap",
  description:
    "Explore careers and culture at Blivap — join a team building meaningful healthcare connections.",
  keywords: [
    "careers",
    "jobs at Blivap",
    "working at Blivap"
  ],
  path: "/working_at",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
