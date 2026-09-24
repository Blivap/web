import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Forgot Password",
  description:
    "Request a secure link to reset your Blivap account password.",
  keywords: [
    "forgot password",
    "password reset",
    "Blivap"
  ],
  robots: { index: false, follow: false },
  path: "/forgot-password",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
