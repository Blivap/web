"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ScrollReveal } from "../motion/scroll-reveal";
import { usePrefersReducedMotion } from "../motion/use-prefers-reduced-motion";

const STEPS = [
  {
    title: "Register",
    body: "Create your profile in minutes. Tell us your blood type, location, and availability.",
    paths: ["M12 4v4M12 16v4M4 12h4M16 12h4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  },
  {
    title: "Get matched",
    body: "We connect you with nearby requests or donors using verified profiles and live need signals.",
    paths: [
      "M8 12h8",
      "M12 8v8",
      "M7 7l10 10",
      "M17 7L7 17",
      "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    ],
  },
  {
    title: "Donate",
    body: "Show up at a partner facility or coordinated meetup. Track impact after you give.",
    paths: [
      "M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z",
      "M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    ],
  },
] as const;

function StepIcon({
  paths,
  reduced,
}: {
  paths: readonly string[];
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div
      ref={ref}
      className="flex size-14 items-center justify-center rounded-xl bg-[#F9E8EE] text-primary dark:bg-primary/20"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {paths.map((d, i) =>
          reduced ? (
            <path key={i} d={d} />
          ) : (
            <motion.path
              key={i}
              d={d}
              initial={{ pathLength: 0, opacity: 0.35 }}
              animate={
                inView
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0.35 }
              }
              transition={{
                duration: 0.9,
                delay: i * 0.08,
                ease: "easeOut",
              }}
            />
          ),
        )}
      </svg>
    </div>
  );
}

export function HomeHowItWorksSection() {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      className="mx-auto w-full max-w-360 px-4 py-12 sm:px-8 sm:py-16 lg:px-20"
      aria-labelledby="how-it-works-heading"
    >
      <ScrollReveal>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          How it works
        </p>
        <h2
          id="how-it-works-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
        >
          Three steps from intent to impact
        </h2>
      </ScrollReveal>

      <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, index) => (
          <ScrollReveal key={step.title} delay={index * 0.08} as="li">
            <div className="flex h-full flex-col gap-4 border border-[#E5E7EB] bg-white p-5 dark:border-white/10 dark:bg-[#111827] sm:p-6">
              <StepIcon paths={step.paths} reduced={reduced} />
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Step {index + 1}
                </p>
                <h3 className="text-lg font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {step.body}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </ol>
    </section>
  );
}
