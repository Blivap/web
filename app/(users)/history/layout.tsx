import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "History",
  description:
    "Review your past donations and activity on Blivap.",
  keywords: [
    "history",
    "donation history"
  ],
  robots: { index: false, follow: false },
  path: "/history",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
