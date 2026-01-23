import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Blivap. Contact our team for questions about blood donation, sperm donation, registration, or any other inquiries. We're here to help.",
  keywords: [
    "contact Blivap",
    "customer support",
    "help",
    "inquiries",
    "support",
  ],
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
