import type {
  Booking,
  BookingStatus,
  BookingsListMeta,
} from "@/types/bookings";
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

function publicIdFromPerson(raw: unknown, depth = 0): string | undefined {
  if (!raw || typeof raw !== "object" || depth > 2) return undefined;
  const o = raw as Record<string, unknown>;
  const direct = pickString(o.publicId ?? o.public_id);
  if (direct) return direct.toUpperCase();
  for (const key of ["user", "profile", "account"]) {
    const nested = publicIdFromPerson(o[key], depth + 1);
    if (nested) return nested;
  }
  return undefined;
}

function pickPersonFromRef(raw: unknown): {
  displayName?: string;
  publicId?: string;
  profileImage?: string;
} {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const first = typeof o.firstname === "string" ? o.firstname.trim() : "";
  const last = typeof o.lastname === "string" ? o.lastname.trim() : "";
  const displayName = [first, last].filter(Boolean).join(" ").trim();
  const publicId = publicIdFromPerson(o);
  const profileImage = pickString(o.profileImage ?? o.profile_image);
  return {
    ...(displayName ? { displayName } : {}),
    ...(publicId ? { publicId } : {}),
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

function parseBookingDirection(
  raw: unknown,
): "incoming" | "outgoing" | undefined {
  const value = pickString(raw)?.toLowerCase();
  if (!value) return undefined;
  if (value === "incoming" || value === "in" || value === "received") {
    return "incoming";
  }
  if (value === "outgoing" || value === "out" || value === "sent") {
    return "outgoing";
  }
  return undefined;
}

function parseStatus(raw: unknown): BookingStatus | null {
  const s = pickString(raw);
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower === "declined") return "rejected";
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
  const createdAt = pickString(
    unwrapped.createdAt ??
      r.createdAt ??
      unwrapped.created_at ??
      r.created_at,
  );
  const direction = parseBookingDirection(
    unwrapped.direction ??
      r.direction ??
      unwrapped.flow ??
      r.flow ??
      unwrapped.side ??
      r.side,
  );
  const status = parseStatus(unwrapped.status ?? r.status);
  if (!donorUserId || !requesterId || !hospitalId || !scheduledAt || !status) {
    return null;
  }

  const donorPerson = pickPersonFromRef(donorRaw);
  const requesterPerson = pickPersonFromRef(requesterRaw);
  const hospitalDisplayName =
    pickHospitalNameFromRef(hospitalRaw) ??
    pickString(
      unwrapped.hospitalName ??
        r.hospitalName ??
        unwrapped.hospital_name ??
        r.hospital_name,
    ) ??
    undefined;
  const donorProfileImage =
    donorPerson.profileImage ??
    pickString(
      unwrapped.donorProfileImage ??
        r.donorProfileImage ??
        unwrapped.donor_profile_image ??
        r.donor_profile_image,
    ) ??
    undefined;
  const requesterProfileImage =
    requesterPerson.profileImage ??
    pickString(
      unwrapped.requesterProfileImage ??
        r.requesterProfileImage ??
        unwrapped.requester_profile_image ??
        r.requester_profile_image,
    ) ??
    undefined;

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
    unwrapped.bloodRequestId ?? r.bloodRequestId ?? unwrapped.blood_request_id,
  );
  const respondedAt = pickString(
    unwrapped.respondedAt ?? r.respondedAt ?? unwrapped.responded_at,
  );

  const reportsRaw = unwrapped.reports ?? r.reports;
  const reportsCount = Array.isArray(reportsRaw) ? reportsRaw.length : 0;

  const requesterHasRated = (() => {
    const explicit =
      unwrapped.requesterHasRated ??
      r.requesterHasRated ??
      unwrapped.requester_has_rated ??
      r.requester_has_rated;
    if (typeof explicit === "boolean") return explicit;
    const ratedAt = pickString(
      unwrapped.requesterRatedAt ??
        r.requesterRatedAt ??
        unwrapped.ratingSubmittedAt ??
        r.rating_submitted_at,
    );
    if (ratedAt) return true;
    const ratingObj = unwrapped.rating ?? r.rating ?? unwrapped.requesterRating;
    if (ratingObj && typeof ratingObj === "object") return true;
    return undefined;
  })();

  return {
    id,
    donorUserId,
    requesterId,
    hospitalId,
    scheduledAt,
    ...(createdAt ? { createdAt } : {}),
    ...(direction ? { direction } : {}),
    ...(slotEndAt ? { slotEndAt } : {}),
    status,
    ...(meetingCode ? { meetingCode } : { meetingCode: null }),
    ...(bloodRequestId ? { bloodRequestId } : { bloodRequestId: null }),
    ...(respondedAt ? { respondedAt } : {}),
    ...(donorPerson.displayName
      ? { donorDisplayName: donorPerson.displayName }
      : {}),
    ...(donorPerson.publicId ||
    pickString(unwrapped.donorPublicId ?? unwrapped.donor_public_id)
      ? {
          donorPublicId: (
            donorPerson.publicId ??
            pickString(unwrapped.donorPublicId ?? unwrapped.donor_public_id) ??
            ""
          ).toUpperCase(),
        }
      : {}),
    ...(donorProfileImage ? { donorProfileImage } : {}),
    ...(requesterPerson.displayName
      ? { requesterDisplayName: requesterPerson.displayName }
      : {}),
    ...(requesterPerson.publicId ||
    pickString(unwrapped.requesterPublicId ?? unwrapped.requester_public_id)
      ? {
          requesterPublicId: (
            requesterPerson.publicId ??
            pickString(
              unwrapped.requesterPublicId ?? unwrapped.requester_public_id,
            ) ??
            ""
          ).toUpperCase(),
        }
      : {}),
    ...(requesterProfileImage ? { requesterProfileImage } : {}),
    ...(hospitalDisplayName ? { hospitalName: hospitalDisplayName } : {}),
    ...(reportsCount > 0 ? { reportsCount } : {}),
    ...(requesterHasRated === true ? { requesterHasRated: true } : {}),
    ...(requesterHasRated === false ? { requesterHasRated: false } : {}),
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
  if (
    !Number.isFinite(page) ||
    !Number.isFinite(limit) ||
    !Number.isFinite(total)
  )
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
