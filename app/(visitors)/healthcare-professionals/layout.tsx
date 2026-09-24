import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Healthcare Professionals",
  description:
    "Built for clinics and care teams who need reliable donor networks and simple coordination.",
  keywords: [
    "healthcare professionals",
    "clinics",
    "donor network"
  ],
  path: "/healthcare-professionals",
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
