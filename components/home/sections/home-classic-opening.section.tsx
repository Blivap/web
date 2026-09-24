"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { BlivapLogo } from "@/public/svg";
import { Button } from "@/components/ui/button";
import { HomeCtaButton } from "../motion/home-cta-button";
import { usePrefersReducedMotion } from "../motion/use-prefers-reduced-motion";

/**
 * Former homepage opening (brand header + photo hero + intro).
 * Placed at the top of the landing; animations run on load (not scroll-gated).
 */
export function HomeClassicOpeningSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const isMdUp = window.matchMedia("(min-width: 768px)").matches;

    if (reduced) {
      return;
    }

    const ctx = gsap.context(() => {
      const header = root.querySelector("[data-classic-header]");
      const copy = root.querySelector("[data-classic-copy]");
      const links = root.querySelector("[data-classic-links]");
      const image = root.querySelector("[data-classic-image]");
      const introCopy = root.querySelector("[data-classic-intro-copy]");
      const introShift = root.querySelector("[data-classic-intro-shift]");

      gsap.set([header, copy, links, image, introCopy, introShift], {
        opacity: 0,
      });
      gsap.set([copy, links, introCopy], { y: 28, scale: 0.96 });
      gsap.set(image, { x: 40, scale: 1.04 });
      // Start flush; CSS `md:-translate-*` holds the final settle after clearProps.
      gsap.set(introShift, { x: 0, y: 0, scale: 0.96 });
      gsap.set(header, { y: -12 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out", overwrite: "auto" },
      });

      tl.to(header, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        clearProps: "transform",
      })
        .to(
          copy,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            clearProps: "transform",
          },
          "-=0.28",
        )
        .to(
          image,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "transform",
          },
          "-=0.55",
        )
        .to(
          links,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            clearProps: "transform",
          },
          "-=0.5",
        )
        .to(
          introCopy,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            clearProps: "transform",
          },
          "-=0.2",
        )
        .to(
          introShift,
          {
            opacity: 1,
            scale: 1,
            x: isMdUp ? -16 : 0,
            y: isMdUp ? 16 : 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              // Hand off to CSS settle classes so y/x stay (clearing scale alone
              // would wipe the whole transform and snap it back up).
              gsap.set(introShift, { clearProps: "all" });
            },
          },
          "-=0.45",
        );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="flex w-full flex-col gap-6 sm:gap-8 md:gap-10"
    >
      <header
        data-classic-header
        className="mx-auto mt-4 w-full max-w-360 px-4 sm:mt-6 sm:px-8 lg:px-20"
      >
        <div className="flex flex-col justify-between gap-4 py-3 sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-start gap-0.5">
            <Link href="/" className="w-fit">
              <p className="flex justify-center font-semibold font-helvetica text-5xl tracking-tight text-primary">
                <BlivapLogo fill="#960018" className="size-17" />
                <span className="-mt-1 -ml-4">livap</span>
              </p>
            </Link>
            <span className="text-[10px] font-medium tracking-wide text-[#6B7280] uppercase dark:text-slate-400 sm:text-xs">
              Connecting generosity to real impact.
            </span>
          </div>
          <div className="flex items-center gap-px sm:gap-2">
            <HomeCtaButton
              variant="link"
              href="/login"
              className="rounded-full bg-primary px-6 py-2 text-xs font-medium text-white hover:bg-primary/90 hover:text-white!"
            >
              Login
            </HomeCtaButton>
            <Button variant="link" href="/register">
              Register
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="relative z-1 col-span-1 flex min-h-80 w-full flex-col gap-4 bg-primary px-4 pt-6 sm:min-h-96 sm:gap-6 sm:px-8 sm:pt-8 md:col-span-6 md:h-112 md:gap-8 md:pt-10 xl:pl-36 dark:bg-[#7A0014]">
          <div data-classic-copy className="flex flex-col gap-3 sm:gap-4">
            <p className="text-lg font-medium leading-snug text-white sm:text-xl md:text-2xl">
              Save lives with your blood or sperm
            </p>
            <HomeCtaButton
              variant="link"
              href="/login"
              className="w-fit rounded-md bg-black px-6 text-xs font-medium text-white hover:bg-black/60 hover:text-white!"
            >
              Login
            </HomeCtaButton>
          </div>
          <div
            data-classic-links
            className="relative z-10 mt-2 flex w-full max-w-150 flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 pt-4 pb-5 shadow-sm dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:mt-0 sm:px-5 sm:pt-5 sm:pb-6 md:px-6"
          >
            <p className="mb-1 text-sm font-semibold text-black dark:text-white">
              Quick links
            </p>
            <div className="flex flex-col gap-0">
              {[
                { label: "About donating", href: "/about-donating" },
                { label: "Research", href: "/research" },
                { label: "About Blivap", href: "/about" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between border-b border-[#E5E7EB] py-2.5 text-xs font-medium text-[#374151] transition-colors last:border-0 hover:text-primary dark:border-white/10 dark:text-slate-300 dark:hover:text-primary"
                >
                  {item.label}
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="opacity-70 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div
          data-classic-image
          className="relative z-0 col-span-1 -ml-10 min-h-75 sm:min-h-100 md:col-span-6"
        >
          <Image
            src="/images/hero_image.jpg"
            alt="Donor and care illustration"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="pointer-events-none absolute -bottom-2 h-2 w-[95%] bg-[#0005F2] dark:bg-[#4338CA] sm:-bottom-3 sm:h-3" />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 md:mt-4 md:grid-cols-5">
        <div
          data-classic-intro-copy
          className="col-span-1 flex max-w-full flex-col gap-4 border border-l-0 border-[#E5E7EB] bg-[#F9FAFB] px-4 py-16 pr-4 dark:border-white/10 dark:bg-[#0F172A] sm:gap-5 sm:px-8 sm:py-20 sm:pr-6 md:col-span-3 md:pr-16 xl:pl-36"
        >
          <p className="max-w-100 text-base font-semibold leading-snug text-black dark:text-white sm:text-xl">
            Together we help connect people who need blood or sperm with willing
            donors.
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-[#6B7280] dark:text-slate-400 sm:text-sm">
            Blivap stands for life. For people. For making a difference when it
            really matters. Thanks to our donors, patients get a chance at a
            better future.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <HomeCtaButton
              variant="link"
              href="/login"
              className="bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 hover:text-white!"
            >
              Login
            </HomeCtaButton>
            <Button variant="outline" href="/about">
              Read more
            </Button>
          </div>
        </div>
        <div
          data-classic-intro-shift
          className="relative col-span-1 mt-6 flex flex-col gap-6 border border-[#E5E7EB] bg-white px-4 py-6 dark:border-white/10 dark:bg-[#111827] md:col-span-2 md:mt-0 md:-translate-x-4 md:translate-y-4 md:border-r-0 md:px-5 sm:px-6"
        >
          {[
            {
              title: "Your donation",
              desc: "Hope, recovery and future.",
              href: "/about-donating",
            },
            {
              title: "About Blivap",
              desc: "Safe blood products and donor connections.",
              href: "/about",
            },
            {
              title: "Lifesaving research",
              desc: "Therapeutics, diagnostics and care.",
              href: "/research",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-1 transition-opacity hover:opacity-90"
            >
              <p className="text-sm font-semibold text-black dark:text-white">
                {item.title}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">
                {item.desc}
              </p>
            </Link>
          ))}
          <Link
            href="/what-we-do"
            className="mt-2 flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            What we do
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
