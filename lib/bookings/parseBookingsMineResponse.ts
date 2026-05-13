import type { Booking, BookingStatus, BookingsListMeta } from "@/types/bookings";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";

const VALID_STATUS = new Set<BookingStatus>([
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "expired",
  "completed",
  "no_show",
]);

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

/** Mongo id string, or `id` / `_id` from a populated relation object. */
function pickRefId(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string" || typeof raw === "number") {
    return pickString(raw);
  }
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return pickString(o.id ?? o._id);
  }
  return null;
}

function pickPersonFromRef(raw: unknown): {
  displayName?: string;
  profileImage?: string;
} {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const first =
    typeof o.firstname === "string" ? o.firstname.trim() : "";
  const last = typeof o.lastname === "string" ? o.lastname.trim() : "";
  const displayName = [first, last].filter(Boolean).join(" ").trim();
  const profileImage = pickString(o.profileImage ?? o.profile_image);
  return {
    ...(displayName ? { displayName } : {}),
    ...(profileImage ? { profileImage } : {}),
  };
}

function pickHospitalNameFromRef(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const n = pickString((raw as Record<string, unknown>).name);
  return n ?? undefined;
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

  if (unwrapped.isDeleted === true || r.isDeleted === true) {
    return null;
  }

  const id =
    pickString(unwrapped.id ?? unwrapped._id ?? r.id ?? r._id) ??
    pickString(
      (unwrapped as Record<string, unknown>)._id as string | undefined,
    );
  if (!id) return null;

  const donorRaw =
    unwrapped.donorUserId ?? r.donorUserId ?? unwrapped.donor_user_id;
  const requesterRaw =
    unwrapped.requesterId ?? r.requesterId ?? unwrapped.requester_id;
  const hospitalRaw =
    unwrapped.hospitalId ?? r.hospitalId ?? unwrapped.hospital_id;

  const donorUserId = pickRefId(donorRaw);
  const requesterId = pickRefId(requesterRaw);
  const hospitalId = pickRefId(hospitalRaw);
  const scheduledAt = pickString(
    unwrapped.scheduledAt ?? r.scheduledAt ?? unwrapped.scheduled_at,
  );
  const status = parseStatus(
    unwrapped.status ?? r.status,
  );
  if (!donorUserId || !requesterId || !hospitalId || !scheduledAt || !status) {
    return null;
  }

  const donorPerson = pickPersonFromRef(donorRaw);
  const requesterPerson = pickPersonFromRef(requesterRaw);
  const hospitalDisplayName = pickHospitalNameFromRef(hospitalRaw);

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

  const reportsRaw = unwrapped.reports ?? r.reports;
  const reportsCount = Array.isArray(reportsRaw) ? reportsRaw.length : 0;

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
    ...(donorPerson.displayName
      ? { donorDisplayName: donorPerson.displayName }
      : {}),
    ...(donorPerson.profileImage
      ? { donorProfileImage: donorPerson.profileImage }
      : {}),
    ...(requesterPerson.displayName
      ? { requesterDisplayName: requesterPerson.displayName }
      : {}),
    ...(requesterPerson.profileImage
      ? { requesterProfileImage: requesterPerson.profileImage }
      : {}),
    ...(hospitalDisplayName ? { hospitalName: hospitalDisplayName } : {}),
    ...(reportsCount > 0 ? { reportsCount } : {}),
  };
}

/** Normalizes list bodies: legacy GET /bookings/mine, GET /bookings/sent, GET /bookings/received, and common `{ data: [...] }` wrappers. */
export function parseBookingsMineResponse(body: unknown): Booking[] {
  const items = coerceArray(body);
  const out: Booking[] = [];
  for (const item of items) {
    const b = parseBookingRecord(item);
    if (b) out.push(b);
  }
  return out;
}

function parseListMeta(body: unknown): BookingsListMeta | undefined {
  if (!body || typeof body !== "object") return undefined;
  const root = body as Record<string, unknown>;
  const meta = root.meta;
  if (!meta || typeof meta !== "object") return undefined;
  const m = meta as Record<string, unknown>;
  const page = Number(m.page);
  const limit = Number(m.limit);
  const total = Number(m.total);
  if (!Number.isFinite(page) || !Number.isFinite(limit) || !Number.isFinite(total))
    return undefined;
  return { page, limit, total };
}

/** Parses paginated `{ message, data, meta }` list responses (sent / received). */
export function parseBookingsPaginatedResponse(body: unknown): {
  bookings: Booking[];
  meta?: BookingsListMeta;
} {
  return {
    bookings: parseBookingsMineResponse(body),
    meta: parseListMeta(body),
  };
}
