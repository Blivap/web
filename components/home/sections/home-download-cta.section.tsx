"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { ScrollReveal } from "../motion/scroll-reveal";
import { HomeCtaButton } from "../motion/home-cta-button";

export function HomeDownloadCtaSection() {
  return (
    <section
      className="mx-auto w-full max-w-360 px-4 py-12 sm:px-8 sm:py-16 lg:px-20"
      aria-labelledby="download-app-heading"
    >
      <div className="grid grid-cols-1 items-center gap-10 overflow-hidden border border-[#E5E7EB] bg-[#FDF2F4] dark:border-primary/20 dark:bg-[#2A1117] lg:grid-cols-2 lg:gap-12">
        <ScrollReveal className="px-5 py-8 sm:px-8 sm:py-10 lg:pl-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Coming soon
          </p>
          <h2
            id="download-app-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
          >
            Carry Blivap in your pocket
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            The mobile app will bring live matches, alerts, and secure messaging
            to your phone. Join the waitlist and we&apos;ll notify you when
            store listings go live.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <HomeCtaButton
              href={routes.waitlist}
              variant="primary"
              className="rounded-full px-6"
            >
              App Store — join waitlist
            </HomeCtaButton>
            <HomeCtaButton
              href={routes.waitlist}
              variant="outline"
              className="rounded-full border-primary/30 bg-white px-6 dark:bg-transparent"
            >
              Google Play — join waitlist
            </HomeCtaButton>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-text-tertiary">
            Prefer the web today?{" "}
            <Link
              href={routes.register}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Register free
            </Link>
            . We treat health data carefully — read our{" "}
            <Link
              href={routes.privacy}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </ScrollReveal>

        <ScrollReveal
          delay={0.1}
          className="relative flex justify-center px-6 pb-10 pt-2 lg:pb-12"
        >
          <div
            className="relative w-52.5 rounded-[2rem] border-[6px] border-[#171717] bg-[#111827] p-2 shadow-[0_24px_50px_rgba(15,23,42,0.25)] dark:border-white/20"
            aria-hidden
          >
            <div className="absolute left-1/2 top-1.5 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#374151]" />
            <div className="flex aspect-9/16 flex-col gap-3 overflow-hidden rounded-[1.4rem] bg-linear-to-b from-[#FDF2F4] to-white p-4 dark:from-[#2A1117] dark:to-[#111827]">
              <div className="h-3 w-20 rounded-full bg-primary/30" />
              <div className="mt-2 h-8 w-full rounded-lg bg-primary/15" />
              <div className="h-24 w-full rounded-xl bg-white shadow-sm dark:bg-white/5" />
              <div className="h-16 w-full rounded-xl bg-white shadow-sm dark:bg-white/5" />
              <div className="mt-auto h-10 w-full rounded-full bg-primary" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
