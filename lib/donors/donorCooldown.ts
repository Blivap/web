import { intervalToDuration } from "date-fns";

export type CooldownTone = "ready" | "soon" | "long";

export type CooldownParts = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type DonorCooldownState = {
  /** ISO end time from API, if any */
  endsAt: string | null;
  remainingMs: number;
  isActive: boolean;
  parts: CooldownParts;
  tone: CooldownTone;
};

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function parseCooldownEndIso(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const ms = Date.parse(raw.trim());
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

export function pickCooldownEndsAt(
  record: Record<string, unknown>,
): string | null {
  return (
    parseCooldownEndIso(record.cooldownEndsAt ?? record.cooldown_ends_at) ??
    parseCooldownEndIso(record.nextEligibleAt ?? record.next_eligible_at) ??
    parseCooldownEndIso(record.eligibleAt ?? record.eligible_at) ??
    parseCooldownEndIso(record.cooldownUntil ?? record.cooldown_until) ??
    null
  );
}

export function cooldownPartsFromMs(remainingMs: number): CooldownParts {
  const clamped = Math.max(0, remainingMs);
  const d = intervalToDuration({ start: 0, end: clamped });
  return {
    years: d.years ?? 0,
    months: d.months ?? 0,
    days: d.days ?? 0,
    hours: d.hours ?? 0,
    minutes: d.minutes ?? 0,
    seconds: d.seconds ?? 0,
  };
}

export function cooldownToneFrom(
  remainingMs: number,
  parts: CooldownParts,
): CooldownTone {
  if (remainingMs <= 0) return "ready";
  if (remainingMs <= SIX_HOURS_MS) return "soon";
  if (parts.years > 0 || parts.months > 0 || parts.days > 0) return "long";
  return "long";
}

export function resolveDonorCooldown(
  cooldownEndsAt: string | null | undefined,
  nowMs: number = Date.now(),
): DonorCooldownState {
  const endsAt = cooldownEndsAt ?? null;
  if (!endsAt) {
    const empty = cooldownPartsFromMs(0);
    return {
      endsAt: null,
      remainingMs: 0,
      isActive: false,
      parts: empty,
      tone: "ready",
    };
  }

  const endMs = Date.parse(endsAt);
  if (!Number.isFinite(endMs)) {
    const empty = cooldownPartsFromMs(0);
    return {
      endsAt: null,
      remainingMs: 0,
      isActive: false,
      parts: empty,
      tone: "ready",
    };
  }

  const remainingMs = Math.max(0, endMs - nowMs);
  const parts = cooldownPartsFromMs(remainingMs);
  return {
    endsAt,
    remainingMs,
    isActive: remainingMs > 0,
    parts,
    tone: cooldownToneFrom(remainingMs, parts),
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Owner-facing live countdown segments. */
export function formatOwnerCountdown(parts: CooldownParts): string {
  const segments: string[] = [];
  if (parts.years > 0) segments.push(`${parts.years}y`);
  if (parts.months > 0) segments.push(`${parts.months}mo`);
  if (parts.days > 0) segments.push(`${parts.days}d`);
  segments.push(`${parts.hours}h`);
  segments.push(`${pad2(parts.minutes)}m`);
  segments.push(`${pad2(parts.seconds)}s`);
  return segments.join(" ");
}

/** Compact label for other users browsing donors. */
export function formatPublicCooldownLabel(
  parts: CooldownParts,
  remainingMs: number,
): string {
  if (remainingMs <= 0) return "Available to book";
  if (parts.years > 0 || parts.months > 0 || parts.days > 0) {
    const bits: string[] = [];
    if (parts.years > 0) bits.push(`${parts.years} yr`);
    if (parts.months > 0) bits.push(`${parts.months} mo`);
    if (parts.days > 0)
      bits.push(`${parts.days} day${parts.days === 1 ? "" : "s"}`);
    return `Rest period · ${bits.join(" ")}`;
  }
  if (parts.hours > 0) {
    return `Rest period · ${parts.hours}h ${parts.minutes}m`;
  }
  return `Rest period · ${parts.minutes}m ${parts.seconds}s`;
}

export const COOLDOWN_TONE_STYLES: Record<
  CooldownTone,
  { box: string; label: string }
> = {
  ready: {
    box: "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  soon: {
    box: "border-border bg-[#F4F4F5] text-text-secondary dark:border-white/10 dark:bg-white/8 dark:text-text-secondary",
    label: "text-text-secondary",
  },
  long: {
    box: "border-red-200/90 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-200",
    label: "text-red-700 dark:text-red-300",
  },
};
