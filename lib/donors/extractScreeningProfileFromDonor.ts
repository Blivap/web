import type { DonorScreeningProfilePayload } from "@/types/donors";

function pickString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function pickBoolOrNull(v: unknown): boolean | null | undefined {
  if (v === null) return null;
  if (typeof v === "boolean") return v;
  return undefined;
}

function coerceDonationTypes(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const item of raw) {
    const s = pickString(item);
    if (s) out.push(s);
  }
  return out.length > 0 ? out : undefined;
}

/** Reads screening-profile fields from GET /donors/me (flat or nested). */
export function extractScreeningProfileFromDonor(
  raw: Record<string, unknown>,
): DonorScreeningProfilePayload {
  const sp =
    raw.screeningProfile && typeof raw.screeningProfile === "object"
      ? (raw.screeningProfile as Record<string, unknown>)
      : raw;

  const biologicalSex = pickString(sp.biologicalSex ?? sp.biological_sex) as
    | DonorScreeningProfilePayload["biologicalSex"]
    | undefined;

  const activeDonationTypes =
    coerceDonationTypes(sp.activeDonationTypes ?? sp.active_donation_types) ??
    coerceDonationTypes(raw.activeDonationTypes);

  return {
    ...(biologicalSex ? { biologicalSex } : {}),
    ...(activeDonationTypes ? { activeDonationTypes } : {}),
    ...(pickBoolOrNull(sp.isActivelyLactating ?? sp.is_actively_lactating) !==
    undefined
      ? {
          isActivelyLactating: pickBoolOrNull(
            sp.isActivelyLactating ?? sp.is_actively_lactating,
          ) as boolean | null,
        }
      : {}),
    ...(pickBoolOrNull(sp.isCurrentlyPregnant ?? sp.is_currently_pregnant) !==
    undefined
      ? {
          isCurrentlyPregnant: pickBoolOrNull(
            sp.isCurrentlyPregnant ?? sp.is_currently_pregnant,
          ) as boolean | null,
        }
      : {}),
  };
}

export function hasMeaningfulScreeningProfilePayload(
  p: DonorScreeningProfilePayload,
): boolean {
  if (p.biologicalSex) return true;
  if (p.activeDonationTypes && p.activeDonationTypes.length > 0) return true;
  if (p.isActivelyLactating !== undefined && p.isActivelyLactating !== null) {
    return true;
  }
  if (p.isCurrentlyPregnant !== undefined && p.isCurrentlyPregnant !== null) {
    return true;
  }
  return false;
}

export function hasScreeningProfileOnRecord(
  raw: Record<string, unknown>,
): boolean {
  return hasMeaningfulScreeningProfilePayload(
    extractScreeningProfileFromDonor(raw),
  );
}
