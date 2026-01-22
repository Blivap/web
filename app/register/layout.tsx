import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Register",
  description:
    "Create your Blivap account to start donating blood or sperm, save lives, and earn money while making a difference in your community.",
  keywords: [
    "register",
    "sign up",
    "become a donor",
    "donor registration",
    "create account",
  ],
  path: "/register",
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
