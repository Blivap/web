"use client";

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
  return (
    <HomeLayout>
      <div className="flex w-full flex-1 flex-col gap-10 sm:gap-12 md:gap-14">
        <HomeClassicOpeningSection />
        <HomeHeroSection />
        <HomeImpactTickerSection />
        <HomeHowItWorksSection />
        <HomeWhyBlivapSection />
        <HomeCoverageMapSection />
        <HomeTestimonialsSection />
        <HomeDownloadCtaSection />
      </div>
    </HomeLayout>
  );
};
