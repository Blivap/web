import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "News & Updates",
  description:
    "Stay updated with the latest news, stories, and updates from Blivap. Read about successful donations, platform updates, and important healthcare news in Nigeria.",
  keywords: [
    "Blivap news",
    "donation stories",
    "healthcare news",
    "platform updates",
    "medical news Nigeria",
  ],
  path: "/news",
});

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
