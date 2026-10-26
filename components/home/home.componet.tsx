"use client";

import dynamic from "next/dynamic";
import { usePublicLanding } from "@/hooks/public/usePublicSite.hooks";
import { HomeLayout } from "../../layout/home.layout.component";
import { HomeClassicOpeningSection } from "./sections/home-classic-opening.section";
import { HomeHeroSection } from "./sections/home-hero.section";
import { HomeImpactTickerSection } from "./sections/home-impact-ticker.section";

const HomeHowItWorksSection = dynamic(() =>
  import("./sections/home-how-it-works.section").then(
    (mod) => mod.HomeHowItWorksSection,
  ),
);
const HomeWhyBlivapSection = dynamic(() =>
  import("./sections/home-why-blivap.section").then(
    (mod) => mod.HomeWhyBlivapSection,
  ),
);
const HomeCoverageMapSection = dynamic(() =>
  import("./sections/home-coverage-map.section").then(
    (mod) => mod.HomeCoverageMapSection,
  ),
);
const HomeTestimonialsSection = dynamic(() =>
  import("./sections/home-testimonials.section").then(
    (mod) => mod.HomeTestimonialsSection,
  ),
);
const HomeDownloadCtaSection = dynamic(() =>
  import("./sections/home-download-cta.section").then(
    (mod) => mod.HomeDownloadCtaSection,
  ),
);

export const HomeComponent = () => {
  const { landing, status } = usePublicLanding();

  return (
    <HomeLayout>
      <div className="flex w-full flex-1 flex-col gap-10 sm:gap-12 md:gap-14">
        <HomeClassicOpeningSection />
        <HomeHeroSection
          openNeeds={landing?.openNeeds ?? null}
          status={status}
        />
        <HomeImpactTickerSection events={landing?.activity ?? []} />
        <HomeHowItWorksSection />
        <HomeWhyBlivapSection stats={landing?.stats ?? []} status={status} />
        <HomeCoverageMapSection
          cities={landing?.coverage ?? []}
          links={landing?.coverageLinks ?? []}
          status={status}
        />
        <HomeTestimonialsSection testimonials={landing?.testimonials ?? []} />
        <HomeDownloadCtaSection />
      </div>
    </HomeLayout>
  );
};
