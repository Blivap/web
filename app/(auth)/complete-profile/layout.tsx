import { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Complete profile",
  description:
    "Add your phone number and date of birth to finish setting up your Blivap account.",
  keywords: ["complete profile", "phone", "date of birth", "Blivap"],
  robots: { index: false, follow: false },
  path: "/complete-profile",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
