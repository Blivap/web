import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Privacy & Cookies",
  description:
    "How Blivap collects, uses, and protects your personal information when you use our platform.",
  keywords: ["privacy policy", "cookies"],
  path: "/privacy",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
