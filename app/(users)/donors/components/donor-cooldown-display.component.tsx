"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Clock, HeartPulse, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COOLDOWN_TONE_STYLES,
  formatOwnerCountdown,
  formatPublicCooldownLabel,
  resolveDonorCooldown,
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

  if (variant === "owner") {
    return (
      <CooldownLabel
        className={className}
        styles={styles}
        label={
          state.isActive
            ? `Cooling down · ${formatOwnerCountdown(state.parts)}`
            : blockedWithoutDate
              ? "Cooling down"
              : "Eligible now"
        }
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

  const publicLabel = state.isActive
    ? `Cooling down · ${formatPublicCooldownLabel(state.parts, state.remainingMs)}`
    : blockedWithoutDate
      ? "Cooling down"
      : "Available to book";

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
