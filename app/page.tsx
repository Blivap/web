import { Metadata } from "next";
import { generateMetadata as genMeta } from "./utils/metadata";
import { HomeComponent } from "./components/home/home.componet";

export const metadata: Metadata = genMeta({
  title: "Blivap — Give Blood. Save Lives.",
  description:
    "Blivap connects blood and sperm donors with people in need across Nigeria. Join our platform to donate, save lives, and earn money while making a difference in your community.",
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
