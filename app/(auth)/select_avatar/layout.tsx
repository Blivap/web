import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Select Avatar",
  description:
    "Choose a profile avatar for your Blivap account.",
  keywords: [
    "avatar",
    "profile picture",
    "Blivap"
  ],
  robots: { index: false, follow: false },
  path: "/select_avatar",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
