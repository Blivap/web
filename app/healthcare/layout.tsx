import { Metadata } from "next";
import { generateMetadata } from "../utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Healthcare Services",
  description:
    "Access comprehensive healthcare services through Blivap. Connect with healthcare providers, find medical facilities, and access quality healthcare services in Nigeria.",
  keywords: [
    "healthcare services",
    "medical facilities",
    "healthcare providers",
    "medical services Nigeria",
    "healthcare access",
  ],
  path: "/healthcare",
});

export default function HealthcareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
