"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HOME_TESTIMONIALS } from "../data/home-landing.mock";
import { ScrollReveal } from "../motion/scroll-reveal";
import { usePrefersReducedMotion } from "../motion/use-prefers-reduced-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeTestimonialsSection() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const total = HOME_TESTIMONIALS.length;
  const active = HOME_TESTIMONIALS[index]!;

  const go = useCallback(
    (next: number) => {
      setIndex((next + total) % total);
    },
    [total],
  );

  return (
    <section
      className="border-y border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#111827]"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto w-full max-w-360 px-4 py-12 sm:px-8 sm:py-16 lg:px-20">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Stories
          </p>
          <h2
            id="testimonials-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
          >
            Real people. Real urgency.
          </h2>
        </ScrollReveal>

        <ScrollReveal className="mt-8" delay={0.08}>
          <div className="relative mx-auto max-w-2xl">
            <div
              className={cn(
                "border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-8 dark:border-white/10 dark:bg-[#0F172A] sm:px-8 sm:py-10",
                !reduced && "transition-all duration-500 ease-out",
              )}
              style={
                !reduced
                  ? {
                      transform: `translateY(${index % 2 === 0 ? 0 : 6}px)`,
                      opacity: 1,
                    }
                  : undefined
              }
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="text-base leading-relaxed text-text-primary sm:text-lg">
                “{active.quote}”
              </p>
              <div className="mt-6 flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-text-primary">
                  {active.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {active.role} · {active.location}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous testimonial"
                  onClick={() => go(index - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next testimonial"
                  onClick={() => go(index + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              <div
                className="flex gap-1.5"
                role="tablist"
                aria-label="Testimonials"
              >
                {HOME_TESTIMONIALS.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show testimonial ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      i === index
                        ? "bg-primary"
                        : "bg-[#D1D5DB] dark:bg-white/25",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
