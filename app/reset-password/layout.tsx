import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Reset Password",
  description:
    "Set a new password for your Blivap account using the reset token from your email.",
  keywords: ["reset password", "new password", "Blivap"],
  path: "/reset-password",
});

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
