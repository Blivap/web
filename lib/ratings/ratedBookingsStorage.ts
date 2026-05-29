const STORAGE_KEY = "rated_booking_ids";

function readIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === "string" && id.trim()));
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* private mode / quota */
  }
}

export function isBookingRatedLocally(bookingId: string): boolean {
  return readIds().has(bookingId);
}

export function markBookingRatedLocally(bookingId: string): void {
  const ids = readIds();
  ids.add(bookingId);
  writeIds(ids);
}

export function bookingNeedsRequesterRating(
  booking: {
    id: string;
    status: string;
    requesterHasRated?: boolean;
  },
): boolean {
  if (booking.status !== "completed") return false;
  if (booking.requesterHasRated === true) return false;
  if (isBookingRatedLocally(booking.id)) return false;
  return true;
}
