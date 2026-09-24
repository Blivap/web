import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Donor Profile",
  description:
    "View donor details and next steps for connecting through Blivap.",
  keywords: ["donor profile"],
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
