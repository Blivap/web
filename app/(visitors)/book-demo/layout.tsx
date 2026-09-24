import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Book a Demo",
  description:
    "Book a demo to see how Blivap can support your organization or healthcare workflow.",
  keywords: [
    "book demo",
    "Blivap demo"
  ],
  path: "/book-demo",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
