import { Metadata } from "next";
import { generateMetadata as genMeta } from "../lib/utils/metadata";
import { HomeComponent } from "../components/home/home.componet";
import { HomeStructuredData } from "@/components/seo/home-structured-data";

export const metadata: Metadata = genMeta({
  title: "Donations in Nigeria | Blivap",
  description:
    "Blivap matches people with donors for blood, plasma, platelets, organs, tissue, reproductive donation, and more across Nigeria.",
  keywords: [
    "donation platform Nigeria",
    "organ donation Nigeria",
    "plasma donation",
    "tissue donation",
    "reproductive donation",
  ],
  path: "/",
});

export default function Home() {
  return (
    <>
      <HomeStructuredData />
      <HomeComponent />
    </>
  );
}
