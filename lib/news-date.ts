import { isValid, parseISO } from "date-fns";

/** Endpoint shape: `"pubDate": "2026-05-08 11:22:46"` (space between date and time, no offset in string). */
const NAIVE_DATETIME_SPLIT = /\s+/;

/**
 * Converts provider `pubDate` + optional `pubDateTZ` to a UTC ISO string.
 *
 * Your API sends **`YYYY-MM-DD HH:mm:ss`** (naive local clock). The zone is carried separately in
 * **`pubDateTZ`** (e.g. `"UTC"`). Without an offset in the string, we attach **`Z`** only when the
 * zone is UTC/GMT (or missing — treated like UTC for this feed).
 */
export function parseNewsPublishedAtToIso(
  pubDate?: string | null,
  pubDateTZ?: string | null,
): string {
  const raw = pubDate?.trim();
  if (!raw) return new Date(0).toISOString();

  const tz = pubDateTZ?.trim().toUpperCase() ?? "";

  // String already includes Z or a numeric offset
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw)) {
    const normalized = raw.includes("T")
      ? raw
      : raw.replace(NAIVE_DATETIME_SPLIT, "T");
    const d = parseISO(normalized);
    return isValid(d) ? d.toISOString() : new Date(0).toISOString();
  }

  const withT = raw.includes("T")
    ? raw
    : raw.replace(NAIVE_DATETIME_SPLIT, "T");

  if (
    tz === "UTC" ||
    tz === "GMT" ||
    tz === "Z" ||
    tz === "" ||
    tz === "UTC+0"
  ) {
    const d = new Date(`${withT}Z`);
    return isValid(d) ? d.toISOString() : new Date(0).toISOString();
  }

  // Unknown zone label: treat naive time as UTC (same as most NewsData-style APIs)
  const d = new Date(`${withT}Z`);
  return isValid(d) ? d.toISOString() : new Date(0).toISOString();
}

/**
 * Formats a stored ISO instant using the **UTC calendar date** so it matches the provider’s
 * `pubDate` day (avoids local timezone shifting the day near midnight).
 */
export function formatNewsPublishedDate(
  isoTimestamp?: string,
  emptyLabel = "Latest update",
): string {
  if (!isoTimestamp) return emptyLabel;
  const d = parseISO(isoTimestamp);
  if (!isValid(d) || d.getTime() === 0) return emptyLabel;

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
