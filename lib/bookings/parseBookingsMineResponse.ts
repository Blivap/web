import type { Booking, BookingStatus } from "@/types/bookings";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";

const VALID_STATUS = new Set<BookingStatus>([
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "completed",
  "no_show",
]);

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function coerceArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data;
  if (Array.isArray(o.bookings)) return o.bookings;
  if (Array.isArray(o.items)) return o.items;
  const nested = o.data;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (Array.isArray(n.items)) return n.items;
    if (Array.isArray(n.data)) return n.data;
    if (Array.isArray(n.bookings)) return n.bookings;
  }
  return [];
}

function parseStatus(raw: unknown): BookingStatus | null {
  const s = pickString(raw);
  if (!s) return null;
  const lower = s.toLowerCase();
  if (VALID_STATUS.has(lower as BookingStatus)) return lower as BookingStatus;
  return null;
}

/** Maps one booking-shaped API record into a Booking or null. */
export function parseBookingRecord(raw: unknown): Booking | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const unwrapped = unwrapApiRecord(raw) ?? r;

  const id =
    pickString(unwrapped.id ?? unwrapped._id ?? r.id ?? r._id) ??
    pickString(
      (unwrapped as Record<string, unknown>)._id as string | undefined,
    );
  if (!id) return null;

  const donorUserId = pickString(
    unwrapped.donorUserId ?? r.donorUserId ?? unwrapped.donor_user_id,
  );
  const requesterId = pickString(
    unwrapped.requesterId ?? r.requesterId ?? unwrapped.requester_id,
  );
  const hospitalId = pickString(
    unwrapped.hospitalId ?? r.hospitalId ?? unwrapped.hospital_id,
  );
  const scheduledAt = pickString(
    unwrapped.scheduledAt ?? r.scheduledAt ?? unwrapped.scheduled_at,
  );
  const status = parseStatus(
    unwrapped.status ?? r.status,
  );
  if (!donorUserId || !requesterId || !hospitalId || !scheduledAt || !status) {
    return null;
  }

  const slotEndAt = pickString(
    unwrapped.slotEndAt ?? r.slotEndAt ?? unwrapped.slot_end_at,
  );
  const meetingRaw =
    unwrapped.meetingCode ?? r.meetingCode ?? unwrapped.meeting_code;
  const meetingCode =
    pickString(meetingRaw) ??
    (typeof meetingRaw === "number" && Number.isFinite(meetingRaw)
      ? String(meetingRaw)
      : null);
  const bloodRequestId = pickString(
    unwrapped.bloodRequestId ??
      r.bloodRequestId ??
      unwrapped.blood_request_id,
  );
  const respondedAt = pickString(
    unwrapped.respondedAt ?? r.respondedAt ?? unwrapped.responded_at,
  );

  return {
    id,
    donorUserId,
    requesterId,
    hospitalId,
    scheduledAt,
    ...(slotEndAt ? { slotEndAt } : {}),
    status,
    ...(meetingCode ? { meetingCode } : { meetingCode: null }),
    ...(bloodRequestId ? { bloodRequestId } : { bloodRequestId: null }),
    ...(respondedAt ? { respondedAt } : {}),
  };
}

/** Normalizes GET /bookings/mine (and common wrappers) into a sorted list (newest scheduledAt first — server already sorts; we preserve order). */
export function parseBookingsMineResponse(body: unknown): Booking[] {
  const items = coerceArray(body);
  const out: Booking[] = [];
  for (const item of items) {
    const b = parseBookingRecord(item);
    if (b) out.push(b);
  }
  return out;
}
