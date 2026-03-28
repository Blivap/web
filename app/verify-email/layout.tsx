import { Metadata } from "next";
import { generateMetadata } from "../../lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Verify Email",
  description:
    "Verify your Blivap account email using the token sent to your inbox.",
  keywords: ["verify email", "email verification", "Blivap"],
  path: "/verify-email",
});

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
