import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Verify Email",
  description:
    "Confirm your email address to finish setting up your Blivap account.",
  keywords: [
    "verify email",
    "email verification",
    "Blivap"
  ],
  robots: { index: false, follow: false },
  path: "/verify-email",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
