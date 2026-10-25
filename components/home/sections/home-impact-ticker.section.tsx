"use client";

import { useState } from "react";
import { CheckCircle2, HeartHandshake } from "lucide-react";
import type { PublicActivity } from "@/app/api/publicRepository";
import { usePrefersReducedMotion } from "../motion/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

function EventIcon({ kind }: { kind: PublicActivity["kind"] }) {
  if (kind === "match") {
    return (
      <CheckCircle2
        className="size-3.5 shrink-0 text-emerald-600"
        aria-hidden
      />
    );
  }
  return (
    <HeartHandshake className="size-3.5 shrink-0 text-primary" aria-hidden />
  );
}

function TickerChip({
  label,
  meta,
  kind,
}: {
  label: string;
  meta: string;
  kind: PublicActivity["kind"];
}) {
  const showMeta = Boolean(meta) && !label.includes(meta);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-[#111827]">
      <EventIcon kind={kind} />
      <span className="font-semibold text-text-primary">{label}</span>
      {showMeta ? <span className="text-text-tertiary">{meta}</span> : null}
    </span>
  );
}

export function HomeImpactTickerSection({
  events,
}: {
  events: PublicActivity[];
}) {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  if (events.length === 0) return null;
  const loop = [...events, ...events];

  return (
    <section
      className={cn(
        "border-y border-[#E5E7EB] bg-[#F9FAFB] py-3 dark:border-white/10 dark:bg-[#0F172A]",
        paused && "home-ticker-paused",
      )}
      aria-label="Live impact updates"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <div className="sr-only" aria-live="polite">
        Recent updates: {events.map((e) => `${e.label}, ${e.meta}`).join(". ")}
      </div>

      {reduced ? (
        <div className="mx-auto flex max-w-360 gap-3 overflow-x-auto px-4 sm:px-8 lg:px-20">
          {events.map((e) => (
            <TickerChip key={e.id} {...e} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden" aria-hidden>
          <div className="home-ticker-track flex w-max gap-3 px-2">
            {loop.map((e, i) => (
              <TickerChip key={`${e.id}-${i}`} {...e} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
