import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Login",
  description: "Login to your Blivap account to access your donor dashboard, manage donations, and connect with recipients.",
  keywords: ["login", "sign in", "Blivap login", "donor login"],
  path: "/login",
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
