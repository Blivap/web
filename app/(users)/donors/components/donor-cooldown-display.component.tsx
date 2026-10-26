"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Clock, HeartPulse, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  COOLDOWN_TONE_STYLES,
  formatOwnerCountdown,
  resolveDonorCooldown,
  type CooldownParts,
  type CooldownTone,
} from "@/lib/donors/donorCooldown";

type DonorCooldownDisplayProps = {
  cooldownEndsAt?: string | null;
  /** Rest period with no end timestamp, including a one-time donation block. */
  unavailable?: boolean;
  /** Full live timer for the donor viewing their own profile/card */
  variant: "owner" | "public";
  className?: string;
};

export function DonorCooldownDisplay({
  cooldownEndsAt,
  unavailable = false,
  variant,
  className,
}: DonorCooldownDisplayProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const state = resolveDonorCooldown(cooldownEndsAt, now);
  const blockedWithoutDate = unavailable && !state.isActive;
  const tone: CooldownTone = blockedWithoutDate ? "long" : state.tone;
  const styles = COOLDOWN_TONE_STYLES[tone];
  const resting = state.isActive || blockedWithoutDate;

  if (state.isActive) {
    return (
      <CooldownClock
        className={className}
        parts={state.parts}
        tone={tone}
        label={`Cooling down, ${formatOwnerCountdown(state.parts)}`}
      />
    );
  }

  if (variant === "owner") {
    return (
      <CooldownLabel
        className={className}
        styles={styles}
        label={blockedWithoutDate ? "Cooling down" : "Eligible now"}
        icon={
          resting ? (
            <Clock className="size-3 shrink-0" aria-hidden />
          ) : (
            <Sparkles className="size-3 shrink-0" aria-hidden />
          )
        }
        mono
        role="timer"
        ariaLive="polite"
      />
    );
  }

  const publicLabel = blockedWithoutDate ? "Cooling down" : "Available to book";

  return (
    <CooldownLabel
      className={className}
      styles={styles}
      label={publicLabel}
      icon={
        resting ? (
          <Clock className="size-3 shrink-0 opacity-80" aria-hidden />
        ) : (
          <HeartPulse
            className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        )
      }
    />
  );
}

function CooldownRing({
  radius,
  ratio,
  strokeWidth,
  animate,
}: {
  radius: number;
  ratio: number;
  strokeWidth: number;
  animate: boolean;
}) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-current opacity-20"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${clamped * circumference} ${circumference}`}
        className={cn(
          "stroke-current",
          animate &&
            "transition-[stroke-dasharray] duration-1000 ease-linear motion-reduce:transition-none",
        )}
      />
    </>
  );
}

function CooldownNap() {
  return (
    <svg viewBox="0 0 64 56" className="size-12 shrink-0" aria-hidden>
      <text
        x="44"
        y="16"
        fill="#960018"
        fontSize="12"
        fontWeight="500"
        transform="rotate(-14 46 14)"
      >
        z
      </text>
      <text
        x="52"
        y="9"
        fill="#960018"
        fontSize="8"
        fontWeight="500"
        transform="rotate(-8 54 8)"
      >
        z
      </text>
      <circle
        cx="28"
        cy="32"
        r="18"
        fill="#ffd0c8"
        stroke="#c45b68"
        strokeWidth="1"
      />
      <path
        d="M20 31c1.6 1.8 3.6 1.8 5.2 0M32 31c1.6 1.8 3.6 1.8 5.2 0"
        fill="none"
        stroke="#960018"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M24 38c1.4 1.6 3.2 2.2 4.8 1.2"
        fill="none"
        stroke="#960018"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="18" cy="36" r="2" fill="#f08a98" />
      <circle cx="39" cy="36" r="2" fill="#f08a98" />
    </svg>
  );
}

function CooldownKey({ label, ratio }: { label: string; ratio: number }) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-[#e7b4ba] bg-white py-1 dark:border-[#c45b68]/50 dark:bg-[#3a1c22]">
      <svg viewBox="0 0 24 24" className="size-5 -rotate-90" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="#f3c9cf"
          strokeWidth="1.25"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="#960018"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray={`${clamped * circumference} ${circumference}`}
        />
      </svg>
      <span className="text-[9px] font-medium uppercase tracking-wide text-[#960018] dark:text-[#ffb4be]">
        {label}
      </span>
    </div>
  );
}

function CooldownClock({
  parts,
  tone,
  label,
  className,
}: {
  parts: CooldownParts;
  tone: CooldownTone;
  label: string;
  className?: string;
}) {
  const [trackedSeconds, setTrackedSeconds] = useState(parts.seconds);
  // Jump the seconds ring when the minute rolls over; ease it on the way down.
  const animateSeconds = parts.seconds <= trackedSeconds;
  if (parts.seconds !== trackedSeconds) {
    setTrackedSeconds(parts.seconds);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label}. Show what the rings mean.`}
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "relative shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            COOLDOWN_TONE_STYLES[tone].label,
            className,
            "size-8",
          )}
        >
          <svg
            viewBox="0 0 100 100"
            className="size-full -rotate-90"
            aria-hidden
          >
            <CooldownRing
              radius={44}
              ratio={parts.seconds / 60}
              strokeWidth={6}
              animate={animateSeconds}
            />
            <CooldownRing
              radius={32}
              ratio={parts.minutes / 60}
              strokeWidth={6}
              animate={false}
            />
            <CooldownRing
              radius={20}
              ratio={parts.hours / 24}
              strokeWidth={6}
              animate={false}
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[216px] overflow-hidden rounded-2xl border border-[#e7b4ba] bg-[#fff4f1] p-3 shadow-[0_2px_8px_rgba(150,0,24,0.08)] dark:border-[#c45b68]/40 dark:bg-[#2a1418] dark:shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <CooldownNap />
          <p className="text-sm font-medium tracking-tight text-[#3d2426] dark:text-[#ffe4e6]">
            Resting
          </p>
        </div>
        <p className="mt-1 font-mono text-[11px] font-medium tabular-nums text-[#960018] dark:text-[#ffb4be]">
          {formatOwnerCountdown(parts)}
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <CooldownKey label="sec" ratio={parts.seconds / 60} />
          <CooldownKey label="min" ratio={parts.minutes / 60} />
          <CooldownKey label="hr" ratio={parts.hours / 24} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CooldownLabel({
  className,
  styles,
  label,
  icon,
  mono,
  role,
  ariaLive,
}: {
  className?: string;
  styles: (typeof COOLDOWN_TONE_STYLES)[CooldownTone];
  label: string;
  icon: ReactNode;
  mono?: boolean;
  role?: string;
  ariaLive?: "polite" | "off" | "assertive";
}) {
  return (
    <div
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1",
        styles.box,
        className,
      )}
      role={role}
      aria-live={ariaLive}
    >
      {icon}
      <span
        className={cn(
          "min-w-0 truncate font-medium",
          mono ? "font-mono text-xs tabular-nums" : "text-[10px] leading-tight",
        )}
      >
        {label}
      </span>
    </div>
  );
}
