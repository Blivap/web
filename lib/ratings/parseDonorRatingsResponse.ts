import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type { DonorRatingItem, DonorRatingsSummary } from "@/types/ratings";

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
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

export function parseRatingItem(raw: unknown): DonorRatingItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const score = pickNumber(r.score ?? r.rating ?? r.stars, -1);
  if (score < 1 || score > 5) return null;
  const comment = pickString(r.comment ?? r.details ?? r.text);
  const id = pickString(r.id ?? r._id);
  const createdAt = pickString(r.createdAt ?? r.created_at);
  return {
    ...(id ? { id } : {}),
    score,
    ...(comment ? { comment } : { comment: null }),
    ...(createdAt ? { createdAt } : {}),
  };
}

function coerceRatingsArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.ratings)) return o.ratings;
  if (Array.isArray(o.items)) return o.items;
  if (Array.isArray(o.data)) return o.data;
  const nested = o.data;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (Array.isArray(n.ratings)) return n.ratings;
    if (Array.isArray(n.items)) return n.items;
  }
  return [];
}

function parseRatingsItems(raw: unknown): DonorRatingItem[] {
  const items = coerceRatingsArray(raw);
  const parsedItems: DonorRatingItem[] = [];
  for (const item of items) {
    const row = parseRatingItem(item);
    if (row) parsedItems.push(row);
  }
  return parsedItems;
}

/** Normalizes rating fields embedded in GET /donors/:id — uses API aggregates as-is. */
export function parseDonorProfileRatings(
  record: Record<string, unknown>,
): DonorRatingsSummary {
  const averageRaw = pickNumber(
    record.averageRating ??
      record.average_rating ??
      record.avgRating ??
      record.avg,
    -1,
  );
  const ratingCount = Math.max(
    0,
    Math.round(
      pickNumber(
        record.ratingCount ??
          record.rating_count ??
          record.ratingsCount ??
          record.reviewCount,
      ),
    ),
  );

  const itemsRaw =
    record.recentRatings ?? record.recent_ratings ?? record.ratings ?? [];
  const parsedItems = Array.isArray(itemsRaw)
    ? parseRatingsItems(itemsRaw)
    : [];

  const averageRating =
    averageRaw >= 0 ? Math.min(5, Math.max(0, averageRaw)) : 0;

  return {
    averageRating,
    ratingCount,
    ...(parsedItems.length > 0 ? { ratings: parsedItems } : {}),
  };
}

/** Normalizes GET /donors/:id/ratings — aggregates and optional review list. */
export function parseDonorRatingsResponse(body: unknown): DonorRatingsSummary {
  const root = unwrapApiRecord(body) ?? body;
  const r =
    root && typeof root === "object"
      ? (root as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const averageRaw = pickNumber(
    r.averageRating ?? r.average_rating ?? r.avgRating ?? r.avg,
    -1,
  );
  const countRaw = Math.max(
    0,
    Math.round(
      pickNumber(
        r.ratingCount ??
          r.rating_count ??
          r.ratingsCount ??
          r.reviewCount ??
          r.total ??
          r.count,
      ),
    ),
  );

  const items = coerceRatingsArray(body).length
    ? coerceRatingsArray(body)
    : coerceRatingsArray(r);

  const parsedItems = parseRatingsItems(items);

  let averageRating =
    averageRaw >= 0 ? Math.min(5, Math.max(0, averageRaw)) : 0;
  if (averageRating <= 0 && parsedItems.length > 0) {
    const sum = parsedItems.reduce((acc, it) => acc + it.score, 0);
    averageRating = sum / parsedItems.length;
  }

  const ratingCount =
    countRaw > 0 ? countRaw : parsedItems.length > 0 ? parsedItems.length : 0;

  return {
    averageRating,
    ratingCount,
    ...(parsedItems.length > 0 ? { ratings: parsedItems } : {}),
  };
}
