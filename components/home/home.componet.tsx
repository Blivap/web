"use client";

import { usePublicLanding } from "@/hooks/public/usePublicSite.hooks";
import { HomeLayout } from "../../layout/home.layout.component";
import { HomeClassicOpeningSection } from "./sections/home-classic-opening.section";
import { HomeHeroSection } from "./sections/home-hero.section";
import { HomeImpactTickerSection } from "./sections/home-impact-ticker.section";
import { HomeHowItWorksSection } from "./sections/home-how-it-works.section";
import { HomeWhyBlivapSection } from "./sections/home-why-blivap.section";
import { HomeCoverageMapSection } from "./sections/home-coverage-map.section";
import { HomeTestimonialsSection } from "./sections/home-testimonials.section";
import { HomeDownloadCtaSection } from "./sections/home-download-cta.section";

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
