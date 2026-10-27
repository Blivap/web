import type { Booking, BookingStatus } from "@/types/bookings";
import type { BookingPillVariant } from "@/app/(users)/bookings/components/booking-status-pill";
import { formatPublicId } from "@/lib/users/formatPublicId";

const SHORT_ID_LEN = 6;

/** Prefer anonymous publicId (ALL CAPS); never fall back to truncated Mongo user ids. */
function partyPublicLabel(
  publicId: string | null | undefined,
  fallback: string,
): string {
  return formatPublicId(publicId) ?? fallback;
}

function hospitalFallbackFromId(hospitalId: string): string {
  const t = hospitalId.trim();
  if (!t) return "Hospital";
  return t.length > SHORT_ID_LEN
    ? `Hospital ${t.slice(0, SHORT_ID_LEN)}…`
    : `Hospital ${t}`;
}

export type BookingRowDetailParts = {
  who: string;
  hospital: string;
  when: string;
};

export function bookingRowDetailPartsForViewer(
  b: Booking,
  viewer: "donor" | "requester",
): BookingRowDetailParts {
  const when = formatScheduledLabel(b.scheduledAt);
  const hospital =
    b.hospitalName?.trim() || hospitalFallbackFromId(b.hospitalId);
  if (viewer === "donor") {
    const who = partyPublicLabel(b.requesterPublicId, "");
    return { who, hospital, when };
  }
  const who = partyPublicLabel(b.donorPublicId, "");
  return { who, hospital, when };
}

export function formatScheduledLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Created-at label for the bookings table Date column: day, month, year. */
export function formatBookingCreatedShort(
  createdAt: string | null | undefined,
): string {
  if (!createdAt) return "—";
  try {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return createdAt;
    const day = d.getDate();
    const month = d.toLocaleString(undefined, { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return createdAt;
  }
}

/** Compact date for booking table rows. */
export function formatScheduledShort(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function statusToPill(status: BookingStatus): {
  label: string;
  variant: BookingPillVariant;
} {
  switch (status) {
    case "pending":
      return { label: "Pending", variant: "pending" };
    case "accepted":
      return { label: "Accepted", variant: "accepted" };
    case "rejected":
      return { label: "Declined", variant: "rejected" };
    case "cancelled":
      return { label: "Cancelled", variant: "profile" };
    case "expired":
      return { label: "Expired", variant: "profile" };
    case "completed":
      return { label: "Completed", variant: "accepted" };
    case "no_show":
      return { label: "No-show", variant: "profile" };
    default:
      return { label: status, variant: "profile" };
  }
}

export function bookingTitleForViewer(
  b: Booking,
  role: "donor" | "requester",
): string {
  if (role === "donor") {
    const handle = formatPublicId(b.requesterPublicId);
    if (handle) return `Request · ${handle}`;
    return "Donation booking";
  }
  const handle = formatPublicId(b.donorPublicId);
  if (handle) return `Booking · ${handle}`;
  return "Booking request";
}

export function bookingSubtitleDonor(b: Booking): string {
  const p = bookingRowDetailPartsForViewer(b, "donor");
  return `${p.who} · ${p.hospital} · ${p.when}`;
}

export function bookingSubtitleRequester(b: Booking): string {
  const p = bookingRowDetailPartsForViewer(b, "requester");
  return `${p.who} · ${p.hospital} · ${p.when}`;
}
