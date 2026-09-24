import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "About Sperm Donation",
  description:
    "Learn how sperm donation works on Blivap and how donors can support families building their future.",
  keywords: [
    "sperm donation Nigeria",
    "sperm donor",
    "sperm donation process"
  ],
  path: "/about-sperm",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
