import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Donors",
  description:
    "Browse and manage donors connected through Blivap.",
  keywords: [
    "donors"
  ],
  robots: { index: false, follow: false },
  path: "/donors",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
