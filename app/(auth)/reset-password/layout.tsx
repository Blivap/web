import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Reset Password",
  description:
    "Choose a new password to regain access to your Blivap account.",
  keywords: [
    "reset password",
    "new password",
    "Blivap"
  ],
  robots: { index: false, follow: false },
  path: "/reset-password",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
