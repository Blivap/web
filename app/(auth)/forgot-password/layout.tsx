import { Metadata } from "next";
import { generateMetadata } from "../../../lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Forgot Password",
  description: "Request a password reset link for your Blivap account.",
  keywords: ["forgot password", "password reset", "Blivap"],
  path: "/forgot-password",
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
