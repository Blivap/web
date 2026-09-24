import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Dashboard",
  description:
    "Access your Blivap dashboard and account tools in one place.",
  keywords: [
    "dashboard"
  ],
  robots: { index: false, follow: false },
  path: "/dashboard",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
