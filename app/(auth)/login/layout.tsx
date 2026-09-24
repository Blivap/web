import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Login",
  description:
    "Sign in to your Blivap account to manage donations, bookings, and your profile.",
  keywords: [
    "login",
    "sign in",
    "Blivap login",
    "donor login"
  ],
  path: "/login",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
