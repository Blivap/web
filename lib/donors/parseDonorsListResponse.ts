import {
  BLOOD_TYPES,
  type BloodType,
  type Donor,
} from "@/app/(users)/donors/donors.data";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type { DonorPublicScreening } from "@/types/donors";
import { parseDonorPublicScreening } from "@/lib/donors/parseDonorPublicScreening";

export type DonorDetail = Donor & {
  profileImageUrl?: string | null;
  /** 0–100 from API when present. */
  reliabilityScore?: number;
  completedBookings?: number;
  successfulDonationCount?: number;
  isActiveDonor?: boolean;
  /** AI / typed screening summary when present on GET /donors/:id */
  screening?: DonorPublicScreening | null;
};

const VALID_BLOOD = new Set(
  BLOOD_TYPES.filter((b): b is Exclude<BloodType, "All"> => b !== "All"),
);

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function pickNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function mergeRecords(
  ...sources: Array<Record<string, unknown> | null | undefined>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const s of sources) {
    if (!s) continue;
    Object.assign(out, s);
  }
  return out;
}

function pickId(r: Record<string, unknown>): string | null {
  return (
    pickString(r.id ?? r.userId ?? r.donorId) ??
    (() => {
      const user = r.user;
      if (user && typeof user === "object") {
        const u = user as Record<string, unknown>;
        return pickString(u.id ?? u._id);
      }
      return null;
    })()
  );
}

function pickBloodType(r: Record<string, unknown>): Exclude<BloodType, "All"> | null {
  const raw = pickString(r.bloodType ?? r.blood_type);
  if (!raw || !VALID_BLOOD.has(raw as Exclude<BloodType, "All">)) return null;
  return raw as Exclude<BloodType, "All">;
}

function areaStringsFromRecord(r: Record<string, unknown>): {
  location: string;
  country: string;
} {
  const areaSource =
    r.areaLocation && typeof r.areaLocation === "object"
      ? (r.areaLocation as Record<string, unknown>)
      : r;

  const city = pickString(areaSource.city) ?? "";
  const state = pickString(areaSource.state) ?? "";
  const area = pickString(
    areaSource.area ?? areaSource.district ?? areaSource.neighborhood,
  );
  const country =
    pickString(areaSource.country ?? areaSource.countryCode) ?? "";

  const location =
    [city || area, state].filter(Boolean).join(", ") ||
    city ||
    state ||
    area ||
    "—";

  return {
    location,
    country: country || "—",
  };
}

function coerceArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;

  if (Array.isArray(o.data)) return o.data;
  if (Array.isArray(o.donors)) return o.donors;
  if (Array.isArray(o.items)) return o.items;

  const nested = o.data;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (Array.isArray(n.items)) return n.items;
    if (Array.isArray(n.data)) return n.data;
    if (Array.isArray(n.donors)) return n.donors;
  }
  return [];
}

/** Maps one donor-shaped API record into a list/detail row (requires known blood type). */
export function parseDonorRecord(raw: unknown): Donor | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const user =
    r.user && typeof r.user === "object"
      ? (r.user as Record<string, unknown>)
      : null;

  const merged = mergeRecords(r, user);
  const id = pickId(merged);
  if (!id) return null;

  const bloodType = pickBloodType(merged);
  if (!bloodType) return null;

  const { location, country } = areaStringsFromRecord(merged);

  const rawRating = pickNumber(merged.rating ?? merged.averageRating, 0);
  const reliabilityRaw = pickNumber(merged.reliabilityScore, -1);
  const rating =
    rawRating > 0
      ? Math.min(5, rawRating)
      : reliabilityRaw >= 0
        ? Math.min(5, reliabilityRaw / 20)
        : 0;

  const donations = Math.max(
    0,
    Math.round(
      pickNumber(
        merged.successfulDonationCount ??
          merged.donations ??
          merged.donationCount ??
          merged.donation_count,
      ),
    ),
  );

  return {
    id,
    bloodType,
    location,
    country,
    packs: Math.max(
      0,
      Math.round(pickNumber(merged.packs ?? merged.packCount ?? merged.completedBookings)),
    ),
    rating,
    donations,
  };
}

function pickProfileImageUrl(merged: Record<string, unknown>): string | null {
  const direct = pickString(
    merged.profileImage ??
      merged.profileImageUrl ??
      merged.avatarUrl ??
      merged.image,
  );
  if (direct) return direct;
  const user = merged.user;
  if (user && typeof user === "object") {
    const u = user as Record<string, unknown>;
    return pickString(u.profileImage ?? u.avatar ?? u.image ?? u.profileImageUrl);
  }
  return null;
}

/** Normalizes GET /donors/:id (and `{ data: { ... } }` wrappers). */
export function parseDonorDetailResponse(body: unknown): DonorDetail | null {
  const unwrapped = unwrapApiRecord(body);
  const candidate =
    unwrapped ??
    (body && typeof body === "object" ? (body as Record<string, unknown>) : null);
  if (!candidate) return null;

  const donor = parseDonorRecord(candidate);
  if (!donor) return null;

  const user =
    candidate.user && typeof candidate.user === "object"
      ? (candidate.user as Record<string, unknown>)
      : null;
  const merged = mergeRecords(candidate, user);
  const profileImageUrl = pickProfileImageUrl(merged);
  const reliabilityRaw = pickNumber(merged.reliabilityScore, -1);
  const completedBookings = Math.max(
    0,
    Math.round(pickNumber(merged.completedBookings)),
  );
  const successfulDonationCount = Math.max(
    0,
    Math.round(
      pickNumber(merged.successfulDonationCount, donor.donations),
    ),
  );

  const screening = parseDonorPublicScreening(
    merged.screening ?? merged.publicScreening,
  );

  return {
    ...donor,
    ...(profileImageUrl ? { profileImageUrl } : {}),
    ...(reliabilityRaw >= 0 ? { reliabilityScore: reliabilityRaw } : {}),
    completedBookings,
    successfulDonationCount,
    ...(typeof merged.isActiveDonor === "boolean"
      ? { isActiveDonor: merged.isActiveDonor }
      : {}),
    ...(screening ? { screening } : {}),
  };
}

/** Normalizes GET /donors (and common `{ data: [...] }` wrappers) into grid rows. */
export function parseDonorsListResponse(body: unknown): Donor[] {
  const items = coerceArray(body);
  const donors: Donor[] = [];
  for (const item of items) {
    const row = parseDonorRecord(item);
    if (row) donors.push(row);
  }
  return donors;
}
