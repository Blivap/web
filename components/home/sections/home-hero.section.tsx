"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { HomeCtaButton } from "../motion/home-cta-button";
import { usePrefersReducedMotion } from "../motion/use-prefers-reduced-motion";
import { HOME_URGENCY_BASE } from "../data/home-landing.mock";
import { cn } from "@/lib/utils";

type PathMode = "donate" | "need";

function HeartbeatWave({ animate }: { animate: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40 dark:opacity-30"
      viewBox="0 0 1200 400"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 200 H180 L210 200 L240 80 L280 320 L320 200 H480 L510 200 L540 120 L580 280 L620 200 H900 L930 200 L960 90 L1000 310 L1040 200 H1200"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className={cn(
          "text-white/70",
          animate && "home-heartbeat-wave home-heartbeat-pulse",
        )}
      />
      <path
        d="M0 220 H180 L210 220 L240 140 L280 300 L320 220 H480 L510 220 L540 160 L580 260 L620 220 H900 L930 220 L960 150 L1000 290 L1040 220 H1200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        className={cn("text-white/35", animate && "home-heartbeat-wave")}
        style={animate ? { animationDelay: "0.4s" } : undefined}
      />
    </svg>
  );
}

export function HomeHeroSection() {
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState<PathMode>("donate");
  const [needCount, setNeedCount] = useState(HOME_URGENCY_BASE);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setNeedCount((n) => {
        const delta = Math.random() > 0.55 ? 1 : -1;
        return Math.min(96, Math.max(32, n + delta));
      });
    }, 4200);
    return () => window.clearInterval(id);
  }, [reduced]);

  const primary =
    mode === "donate"
      ? {
          label: "Find someone who needs you",
          href: routes.register,
          hint: "Create a donor profile and get matched near you.",
        }
      : {
          label: "Request blood",
          href: routes.waitlist,
          hint: "Tell us what you need — we connect you with verified donors.",
        };

  const secondary =
    mode === "donate"
      ? { label: "Request blood", href: routes.waitlist }
      : { label: "Donate now", href: routes.register };

  return (
    <section
      className="relative overflow-hidden bg-primary text-white dark:bg-[#7A0014]"
      aria-labelledby="home-hero-heading"
    >
      <HeartbeatWave animate={!reduced} />
      <div className="relative z-1 mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-8 sm:py-14 md:px-12 lg:px-20 lg:py-16">
        <div
          role="tablist"
          aria-label="Choose how you want to use Blivap"
          className="inline-flex w-fit max-w-full rounded-full border border-white/25 bg-black/20 p-1 backdrop-blur-sm gap-3"
        >
          {(
            [
              { id: "donate" as const, label: "I want to donate" },
              { id: "need" as const, label: "I need blood" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors sm:px-5 sm:text-sm",
                mode === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-white/85 hover:bg-white/10",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex max-w-2xl flex-col gap-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide text-white/80"
            aria-live="polite"
            aria-atomic="true"
          >
            Live need signal
          </p>
          <h1
            id="home-hero-heading"
            className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[2.75rem]"
          >
            <span className="tabular-nums">{needCount}</span> people need blood
            right now
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            {primary.hint} Blivap matches donors and recipients across Nigeria —
            fast, verified, and private.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <HomeCtaButton
            href={primary.href}
            variant="secondary"
            className="w-full justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary hover:bg-white/95 sm:w-auto"
          >
            {primary.label}
          </HomeCtaButton>
          <HomeCtaButton
            href={secondary.href}
            variant="outline"
            className="w-full justify-center rounded-full border-white/40 bg-transparent px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto"
          >
            {secondary.label}
          </HomeCtaButton>
        </div>

        <p className="text-xs text-white/75">
          Already have an account?{" "}
          <Link href={routes.login} className="underline underline-offset-2">
            Log in
          </Link>
          . We never sell health data — see our{" "}
          <Link href={routes.privacy} className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
