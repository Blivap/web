"use client";

import { ScrollReveal } from "../motion/scroll-reveal";
import { usePrefersReducedMotion } from "../motion/use-prefers-reduced-motion";
import {
  HOME_COVERAGE_CITIES,
  HOME_COVERAGE_LINKS,
  type CoverageCity,
} from "../data/home-landing.mock";
import { cn } from "@/lib/utils";

function cityById(id: string): CoverageCity | undefined {
  return HOME_COVERAGE_CITIES.find((c) => c.id === id);
}

/** Soft quadratic arc between two constellation points. */
function linkPath(a: CoverageCity, b: CoverageCity) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const bulge = Math.min(12, len * 0.18);
  const cx = mx - (dy / len) * bulge;
  const cy = my + (dx / len) * bulge;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

function PresenceNetwork({ reduced }: { reduced: boolean }) {
  const links = HOME_COVERAGE_LINKS.flatMap((link, i) => {
    const from = cityById(link.from);
    const to = cityById(link.to);
    if (!from || !to) return [];
    return [{ id: `${link.from}-${link.to}`, d: linkPath(from, to), i }];
  });

  return (
    <div
      className="relative h-full min-h-72 w-full overflow-hidden sm:min-h-80 lg:min-h-104"
      role="img"
      aria-label="Abstract network of Blivap donor presence across major Nigerian cities"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(150,0,24,0.14),transparent_55%),radial-gradient(ellipse_at_75%_70%,rgba(36,175,181,0.1),transparent_50%),linear-gradient(160deg,#F7F4F2_0%,#F0EBE8_45%,#EDE8E4_100%)] dark:bg-[radial-gradient(ellipse_at_30%_40%,rgba(150,0,24,0.28),transparent_55%),radial-gradient(ellipse_at_75%_70%,rgba(36,175,181,0.12),transparent_50%),linear-gradient(160deg,#12141C_0%,#0C0E14_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(23,23,23,0.18) 0.6px, transparent 0.7px)",
          backgroundSize: "18px 18px",
        }}
      />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="coverage-link" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#960018" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#960018" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#24AFB5" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {links.map((link) => (
          <path
            key={link.id}
            d={link.d}
            fill="none"
            stroke="url(#coverage-link)"
            strokeWidth="0.35"
            strokeLinecap="round"
            className={cn(
              !reduced && link.i === 3 && "home-coverage-link-flow",
            )}
            pathLength={1}
          />
        ))}

        {HOME_COVERAGE_CITIES.map((city) => {
          const r = 1.1 + city.strength * 1.4;
          return (
            <g key={city.id}>
              {!reduced ? (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={r * 2.4}
                  className="home-coverage-pulse fill-primary/25"
                  style={{ animationDelay: `${city.delay}s` }}
                />
              ) : null}
              <circle cx={city.x} cy={city.y} r={r} className="fill-primary" />
              <circle
                cx={city.x}
                cy={city.y}
                r={r * 0.35}
                className="fill-white dark:fill-[#0C0E14]"
              />
            </g>
          );
        })}
      </svg>

      {HOME_COVERAGE_CITIES.map((city) => (
        <span
          key={`${city.id}-label`}
          className="pointer-events-none absolute -translate-x-1/2 text-[10px] font-semibold tracking-wide text-text-primary sm:text-[11px]"
          style={{
            left: `${city.x}%`,
            top: `calc(${city.y}% + 1.1rem)`,
          }}
        >
          {city.label}
        </span>
      ))}

      <p className="absolute bottom-3 left-4 text-[10px] font-medium tracking-wide text-text-tertiary uppercase sm:bottom-4 sm:left-5">
        Live presence · sample cities
      </p>
    </div>
  );
}

export function HomeCoverageMapSection() {
  const reduced = usePrefersReducedMotion();
  const ranked = [...HOME_COVERAGE_CITIES].sort(
    (a, b) => b.strength - a.strength,
  );

  return (
    <section className="w-full" aria-labelledby="coverage-map-heading">
      <div className="mx-auto grid w-full max-w-360 grid-cols-1 items-stretch gap-8 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-0 lg:px-20">
        <ScrollReveal className="flex flex-col justify-center lg:col-span-5 lg:pr-10 xl:pr-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Presence
          </p>
          <h2
            id="coverage-map-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
          >
            Active donors across Nigeria
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            Blivap links verified donors into a living network — so when someone
            needs blood, help is already close by in the cities that matter.
          </p>

          <ul
            className="mt-8 flex flex-col gap-3.5"
            aria-label="Sample city readiness"
          >
            {ranked.map((city) => (
              <li key={city.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm font-medium text-text-primary sm:w-32">
                  {city.label}
                </span>
                <span
                  className="relative h-1 flex-1 overflow-hidden bg-[#E8E4E1] dark:bg-white/10"
                  aria-hidden
                >
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 bg-primary",
                      !reduced && "home-coverage-meter",
                    )}
                    style={{
                      width: `${Math.round(city.strength * 100)}%`,
                      animationDelay: `${city.delay}s`,
                    }}
                  />
                </span>
                <span className="w-8 text-right text-[11px] tabular-nums text-text-tertiary">
                  {Math.round(city.strength * 100)}
                </span>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal
          delay={0.12}
          className="overflow-hidden lg:col-span-7 lg:ml-4"
        >
          <PresenceNetwork reduced={reduced} />
        </ScrollReveal>
      </div>
    </section>
  );
}
