import { parseBookingRecord } from "@/lib/bookings/parseBookingsMineResponse";
import type { Booking } from "@/types/bookings";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";

/** Parses PATCH accept/decline (and similar) bodies into a booking patch. */
export function parseBookingMutationResponse(
  body: unknown,
): Partial<Booking> | null {
  const direct = parseBookingRecord(body);
  if (direct) return direct;

  const root = unwrapApiRecord(body) ?? body;
  if (!root || typeof root !== "object") return null;

  const nested = parseBookingRecord(
    (root as Record<string, unknown>).booking ??
      (root as Record<string, unknown>).data,
  );
  if (nested) return nested;

  const statusRaw = (root as Record<string, unknown>).status;
  const meetingRaw =
    (root as Record<string, unknown>).meetingCode ??
    (root as Record<string, unknown>).meeting_code;

  const patch: Partial<Booking> = {};
  if (typeof statusRaw === "string") {
    const lower = statusRaw.toLowerCase();
    if (lower === "declined") {
      patch.status = "rejected";
    } else if (
      lower === "pending" ||
      lower === "accepted" ||
      lower === "rejected" ||
      lower === "cancelled" ||
      lower === "expired" ||
      lower === "completed" ||
      lower === "no_show"
    ) {
      patch.status = lower;
    }
  }
  if (typeof meetingRaw === "string" || typeof meetingRaw === "number") {
    const mc =
      typeof meetingRaw === "number" && Number.isFinite(meetingRaw)
        ? String(meetingRaw).padStart(6, "0")
        : String(meetingRaw).trim();
    if (mc) patch.meetingCode = mc;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
