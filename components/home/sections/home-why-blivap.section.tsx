"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { Lock, MapPin, ShieldCheck, Zap } from "lucide-react";
import { ScrollReveal } from "../motion/scroll-reveal";
import { usePrefersReducedMotion } from "../motion/use-prefers-reduced-motion";
import { HOME_STATS } from "../data/home-landing.mock";
import { useInView } from "@/components/in-view";

const DIFFERENTIATORS = [
  {
    title: "Speed of matching",
    body: "Live need signals and nearby donor availability cut wait time when every minute counts.",
    Icon: Zap,
  },
  {
    title: "Verified donors",
    body: "Identity checks and profile verification help recipients and partners coordinate with confidence.",
    Icon: ShieldCheck,
  },
  {
    title: "Privacy first",
    body: "Health and identity details stay protected. You control what you share and when.",
    Icon: Lock,
  },
  {
    title: "Location-based",
    body: "Match around where you are — Abuja, Lagos, Kano, and cities across Nigeria.",
    Icon: MapPin,
  },
] as const;

function StatCount({
  value,
  suffix = "",
  prefix = "",
  label,
  reduced,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  reduced: boolean;
}) {
  const elRef = useRef<HTMLSpanElement>(null);
  const [setNode, inView] = useInView<HTMLDivElement>({
    once: true,
    rootMargin: "0px 0px -10% 0px",
  });

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el || !inView) return;

    if (reduced) {
      el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
      return;
    }

    const state = { n: 0 };
    const tween = gsap.to(state, {
      n: value,
      duration: 1.35,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = `${prefix}${Math.round(state.n).toLocaleString()}${suffix}`;
      },
    });

    return () => {
      tween.kill();
    };
  }, [inView, value, suffix, prefix, reduced]);

  return (
    <div ref={setNode} className="flex flex-col gap-1">
      <span
        ref={elRef}
        className="text-3xl font-semibold tabular-nums tracking-tight text-primary sm:text-4xl"
        aria-label={`${label}: ${prefix}${value.toLocaleString()}${suffix}`}
      >
        {prefix}0{suffix}
      </span>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}

export function HomeWhyBlivapSection() {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      className="border-y border-[#E5E7EB] bg-[#F9FAFB] dark:border-white/10 dark:bg-[#0F172A]"
      aria-labelledby="why-blivap-heading"
    >
      <div className="mx-auto w-full max-w-360 px-4 py-12 sm:px-8 sm:py-16 lg:px-20">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Why Blivap
          </p>
          <h2
            id="why-blivap-heading"
            className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
          >
            Built for urgency, trust, and dignity
          </h2>
        </ScrollReveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.06}>
              <article className="flex h-full flex-col gap-3 border border-[#E5E7EB] bg-white p-5 dark:border-white/10 dark:bg-[#111827]">
                <item.Icon className="size-5 text-primary" aria-hidden />
                <h3 className="text-base font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {item.body}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-10" delay={0.1}>
          <div
            className="grid grid-cols-1 gap-8 border border-[#E5E7EB] bg-white px-5 py-8 dark:border-white/10 dark:bg-[#111827] sm:grid-cols-3 sm:px-8"
            aria-label="Blivap impact statistics"
          >
            {HOME_STATS.map((stat) => (
              <StatCount
                key={stat.id}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                label={stat.label}
                reduced={reduced}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
