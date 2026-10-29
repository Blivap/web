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
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const ms = raw < 1e12 ? raw * 1000 : raw;
    return new Date(ms).toISOString();
  }
  if (typeof raw !== "string" || !raw.trim()) return null;
  const ms = Date.parse(raw.trim());
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

function pickCooldownEndsAtFromRecord(
  record: Record<string, unknown>,
): string | null {
  return (
    parseCooldownEndIso(record.cooldownEndsAt ?? record.cooldown_ends_at) ??
    parseCooldownEndIso(record.nextEligibleAt ?? record.next_eligible_at) ??
    parseCooldownEndIso(record.nextDonationAt ?? record.next_donation_at) ??
    parseCooldownEndIso(record.eligibleAt ?? record.eligible_at) ??
    parseCooldownEndIso(record.availableFrom ?? record.available_from) ??
    parseCooldownEndIso(record.unavailableUntil ?? record.unavailable_until) ??
    parseCooldownEndIso(record.cooldownUntil ?? record.cooldown_until) ??
    null
  );
}

function pickLastDonationAtFromRecord(
  record: Record<string, unknown>,
): string | null {
  return (
    parseCooldownEndIso(record.lastDonationAt ?? record.last_donation_at) ??
    parseCooldownEndIso(record.lastDonatedAt ?? record.last_donated_at) ??
    parseCooldownEndIso(record.donatedAt ?? record.donated_at) ??
    parseCooldownEndIso(record.lastDonationDate ?? record.last_donation_date) ??
    parseCooldownEndIso(
      record.mostRecentDonationAt ?? record.most_recent_donation_at,
    ) ??
    parseCooldownEndIso(record.cooldownStartedAt ?? record.cooldown_started_at) ??
    parseCooldownEndIso(record.restStartedAt ?? record.rest_started_at) ??
    null
  );
}

function pickFromDonationCooldownList(
  record: Record<string, unknown>,
): string | null {
  const list = record.donationCooldowns ?? record.donation_cooldowns;
  if (!Array.isArray(list)) return null;
  const primary =
    record.primaryDonationType ??
    record.donationType ??
    record.primary_donation_type;
  const rows = list.filter(
    (item): item is Record<string, unknown> =>
      !!item && typeof item === "object",
  );
  const match =
    rows.find(
      (item) => item.donationType === primary || item.donation_type === primary,
    ) ?? rows.find((item) => item.available === false);
  if (!match || match.available === true) return null;
  return parseCooldownEndIso(match.cooldownEndsAt ?? match.cooldown_ends_at);
}

function pickLastDonationAtFromCooldownList(
  record: Record<string, unknown>,
): string | null {
  const list = record.donationCooldowns ?? record.donation_cooldowns;
  if (!Array.isArray(list)) return null;
  const primary =
    record.primaryDonationType ??
    record.donationType ??
    record.primary_donation_type;
  const rows = list.filter(
    (item): item is Record<string, unknown> =>
      !!item && typeof item === "object",
  );
  const match =
    rows.find(
      (item) => item.donationType === primary || item.donation_type === primary,
    ) ?? rows.find((item) => item.available === false);
  if (!match) return null;
  return pickLastDonationAtFromRecord(match);
}

export function pickCooldownEndsAt(
  record: Record<string, unknown>,
): string | null {
  const direct = pickCooldownEndsAtFromRecord(record);
  if (direct) return direct;
  for (const key of ["cooldown", "availability", "donationAvailability"]) {
    const nested = record[key];
    if (!nested || typeof nested !== "object") continue;
    const nestedRecord = nested as Record<string, unknown>;
    const found =
      pickCooldownEndsAtFromRecord(nestedRecord) ??
      parseCooldownEndIso(
        nestedRecord.endsAt ?? nestedRecord.ends_at ?? nestedRecord.until,
      );
    if (found) return found;
  }
  return pickFromDonationCooldownList(record);
}

/** ISO timestamp of the donation that started the current rest period. */
export function pickLastDonationAt(
  record: Record<string, unknown>,
): string | null {
  const direct = pickLastDonationAtFromRecord(record);
  if (direct) return direct;
  for (const key of ["cooldown", "availability", "donationAvailability"]) {
    const nested = record[key];
    if (!nested || typeof nested !== "object") continue;
    const found = pickLastDonationAtFromRecord(
      nested as Record<string, unknown>,
    );
    if (found) return found;
  }
  return pickLastDonationAtFromCooldownList(record);
}

export function donorIsCoolingDown(donor: {
  cooldownEndsAt?: string | null;
  isInDonationCooldown?: boolean;
  isPermanentDonationBlock?: boolean;
}): boolean {
  if (
    donor.isPermanentDonationBlock === true ||
    donor.isInDonationCooldown === true
  ) {
    return true;
  }
  if (donor.cooldownEndsAt) {
    return resolveDonorCooldown(donor.cooldownEndsAt).isActive;
  }
  return false;
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

/** Full weeks remaining after months (from leftover days). */
export function cooldownWeeksFromParts(parts: CooldownParts): number {
  return Math.floor(Math.max(0, parts.days) / 7);
}

const MS_MINUTE = 60 * 1000;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;

export type CooldownRingRatios = {
  months: number;
  weeks: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Typical whole-blood rest window — used so mid-cooldown donors aren't stuck at 0%. */
const DEFAULT_REST_MS = 56 * MS_DAY;

/**
 * Overall progress fills the 4 rings in order (min → hr → wk → mo).
 * Center seconds tick within each remaining minute so the dot still moves live.
 */
function ratiosFromProgress(
  progress: number,
  remainingMs: number,
): CooldownRingRatios {
  const stage = Math.min(1, Math.max(0, progress)) * 4;
  const fill = (index: number) => Math.min(1, Math.max(0, stage - index));

  const remInMinute = remainingMs % MS_MINUTE;
  const seconds =
    remainingMs <= 0 ? 1 : remInMinute === 0 ? 0 : 1 - remInMinute / MS_MINUTE;

  return {
    seconds,
    minutes: fill(0),
    hours: fill(1),
    weeks: fill(2),
    months: fill(3),
  };
}

/**
 * Ring fill = how close the donor is to finishing cooldown.
 * Prefer lastDonationAt → cooldownEndsAt (exact rest window from API).
 * Example: B74 donated Oct 22 (further along) fills more than M2A donated Oct 24.
 * Rings fill in order (min → hr → wk → mo); next starts only after the previous
 * completes. All rings complete as remaining hits zero.
 */
export function cooldownRingRatiosForCooldown(opts: {
  lastDonationAt?: string | null;
  cooldownEndsAt?: string | null;
  remainingMs: number;
  nowMs?: number;
}): CooldownRingRatios {
  const remainingMs = Math.max(0, opts.remainingMs);
  if (remainingMs <= 0) {
    return ratiosFromProgress(1, 0);
  }

  const nowMs = opts.nowMs ?? Date.now();
  const startMs = opts.lastDonationAt
    ? Date.parse(opts.lastDonationAt)
    : Number.NaN;
  const endMs = opts.cooldownEndsAt
    ? Date.parse(opts.cooldownEndsAt)
    : Number.NaN;

  let progress: number;

  if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
    const totalMs = endMs - startMs;
    const elapsedMs = Math.min(totalMs, Math.max(0, nowMs - startMs));
    progress = elapsedMs / totalMs;
  } else {
    // Fallback when donation date is missing: remaining vs typical 56-day window.
    const totalMs = Math.max(DEFAULT_REST_MS, remainingMs);
    progress = 1 - remainingMs / totalMs;
  }

  return ratiosFromProgress(
    Math.min(1, Math.max(0, progress)),
    remainingMs,
  );
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

/** List rows often omit cooldown that GET /donors/me already has for the signed-in donor. */
export function applyOwnerCooldown<
  T extends { userId?: string; cooldownEndsAt?: string | null },
>(
  donors: T[],
  ownerUserId: string | undefined,
  ownerCooldownEndsAt: string | null | undefined,
): T[] {
  if (!ownerUserId || !ownerCooldownEndsAt) return donors;
  if (!resolveDonorCooldown(ownerCooldownEndsAt).isActive) return donors;
  return donors.map((donor) => {
    if (donor.userId !== ownerUserId) return donor;
    if (resolveDonorCooldown(donor.cooldownEndsAt).isActive) return donor;
    return { ...donor, cooldownEndsAt: ownerCooldownEndsAt };
  });
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Owner-facing live countdown segments. */
export function formatOwnerCountdown(parts: CooldownParts): string {
  const segments: string[] = [];
  const totalMonths = parts.years * 12 + parts.months;
  const weeks = cooldownWeeksFromParts(parts);
  if (totalMonths > 0) segments.push(`${totalMonths}mo`);
  if (weeks > 0) segments.push(`${weeks}w`);
  const leftoverDays = parts.days % 7;
  if (leftoverDays > 0 && totalMonths === 0 && weeks === 0) {
    segments.push(`${leftoverDays}d`);
  }
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
    return bits.join(" ");
  }
  if (parts.hours > 0) {
    return `${parts.hours}h ${parts.minutes}m`;
  }
  return `${parts.minutes}m`;
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
