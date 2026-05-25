import {
  BLOOD_TYPES,
  type BloodType,
  type Donor,
} from "@/app/(users)/donors/donors.data";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type { DonorPublicScreening } from "@/types/donors";
import { parseDonorPublicScreening } from "@/lib/donors/parseDonorPublicScreening";
import { pickCooldownEndsAt } from "@/lib/donors/donorCooldown";
import { normalizeDonationTypesList } from "@/lib/donors/screeningDonationTypes";

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

function pickBloodType(
  r: Record<string, unknown>,
): Exclude<BloodType, "All"> | null {
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

function pickActiveDonationTypes(merged: Record<string, unknown>): string[] {
  const nestedSources: unknown[] = [];
  for (const key of [
    "screeningProfile",
    "screening_profile",
    "screening",
    "publicScreening",
    "public_screening",
  ]) {
    const nested = merged[key];
    if (nested && typeof nested === "object") {
      const n = nested as Record<string, unknown>;
      nestedSources.push(n.activeDonationTypes, n.active_donation_types);
    }
  }

  const candidates = [
    merged.activeDonationTypes,
    merged.active_donation_types,
    ...nestedSources,
  ];

  for (const raw of candidates) {
    if (!Array.isArray(raw)) continue;
    const strings = raw.filter((x): x is string => typeof x === "string");
    const normalized = normalizeDonationTypesList(strings);
    if (normalized.length > 0) return normalized;
  }

  return [];
}

function pickProfileImageUrl(merged: Record<string, unknown>): string | null {
  const direct = pickString(
    merged.profileImage ??
      merged.profile_image ??
      merged.profileImageUrl ??
      merged.profile_image_url ??
      merged.avatarUrl ??
      merged.image,
  );
  if (direct) return direct;
  const user = merged.user;
  if (user && typeof user === "object") {
    const u = user as Record<string, unknown>;
    return pickString(
      u.profileImage ??
        u.profile_image ??
        u.avatar ??
        u.image ??
        u.profileImageUrl,
    );
  }
  return null;
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
  const reliability =
    r.reliability && typeof r.reliability === "object"
      ? (r.reliability as Record<string, unknown>)
      : null;

  const merged = mergeRecords(r, user, reliability);
  const id = pickId(merged);
  if (!id) return null;

  const bloodType = pickBloodType(merged);
  if (!bloodType) return null;

  const { location, country } = areaStringsFromRecord(merged);

  const rawRating = pickNumber(merged.rating ?? merged.averageRating, 0);
  const reliabilityRaw = pickNumber(
    merged.reliabilityScore ?? merged.score,
    -1,
  );
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

  const profileImage = pickProfileImageUrl(merged);
  const userId = pickString(merged.userId ?? merged.user_id);
  const cooldownEndsAt = pickCooldownEndsAt(merged);

  return {
    id,
    bloodType,
    location,
    country,
    packs: Math.max(
      0,
      Math.round(
        pickNumber(
          merged.packs ?? merged.packCount ?? merged.completedBookings,
        ),
      ),
    ),
    rating,
    donations,
    activeDonationTypes: pickActiveDonationTypes(merged),
    ...(userId ? { userId } : {}),
    ...(cooldownEndsAt ? { cooldownEndsAt } : {}),
    ...(profileImage ? { profileImage } : {}),
  };
}

/** Normalizes GET /donors/:id (and `{ data: { ... } }` wrappers). */
export function parseDonorDetailResponse(body: unknown): DonorDetail | null {
  const unwrapped = unwrapApiRecord(body);
  const candidate =
    unwrapped ??
    (body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null);
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
    Math.round(pickNumber(merged.successfulDonationCount, donor.donations)),
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

export type DonorsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type DonorsListResult = {
  donors: Donor[];
  meta: DonorsListMeta;
};

const DEFAULT_LIST_META: DonorsListMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

function parseDonorsListMeta(body: unknown): DonorsListMeta {
  if (!body || typeof body !== "object") return DEFAULT_LIST_META;
  const root = body as Record<string, unknown>;
  const raw = root.meta;
  if (!raw || typeof raw !== "object") return DEFAULT_LIST_META;
  const m = raw as Record<string, unknown>;

  const total = Math.max(0, Math.round(pickNumber(m.total)));
  const limit = Math.max(1, Math.round(pickNumber(m.limit, 20)));
  const totalPages = Math.max(
    1,
    Math.round(
      pickNumber(m.totalPages, total > 0 ? Math.ceil(total / limit) : 1),
    ),
  );
  const page = Math.min(
    totalPages,
    Math.max(1, Math.round(pickNumber(m.page, 1))),
  );

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage:
      typeof m.hasNextPage === "boolean" ? m.hasNextPage : page < totalPages,
    hasPreviousPage:
      typeof m.hasPreviousPage === "boolean" ? m.hasPreviousPage : page > 1,
  };
}

/** Normalizes GET /donors (`{ data: [...], meta }`) into grid rows + pagination meta. */
export function parseDonorsListResponse(body: unknown): DonorsListResult {
  const items = coerceArray(body);
  const donors: Donor[] = [];
  for (const item of items) {
    const row = parseDonorRecord(item);
    if (row) donors.push(row);
  }
  return {
    donors,
    meta: parseDonorsListMeta(body),
  };
}
