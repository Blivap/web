import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Register",
  description:
    "Create a Blivap account to start giving, connecting, and making a difference.",
  keywords: [
    "register",
    "sign up"
  ],
  path: "/register",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
