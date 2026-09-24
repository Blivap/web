import { Metadata } from "next";
import { generateMetadata as genMeta } from "../lib/utils/metadata";
import { HomeComponent } from "../components/home/home.componet";

export const metadata: Metadata = genMeta({
  title: "Blood Donation in Nigeria | Blivap",
  description:
    "Blivap connects people in need with donors, healthcare support, and meaningful opportunities to give. Discover, connect, and make a difference through a trusted digital platform.",
  keywords: [
    "blood donation Nigeria",
    "sperm donation Nigeria",
    "donate blood online",
    "blood donor platform",
    "save lives Nigeria",
  ],
  path: "/",
});

export default function Home() {
  return <HomeComponent />;
}
