import type { Booking, BookingStatus } from "@/types/bookings";
import type { BookingPillVariant } from "@/app/(users)/bookings/components/booking-status-pill";

const SHORT_ID_LEN = 6;

function shortIdLabel(prefix: string, id: string | undefined | null): string {
  const t = id?.trim() ?? "";
  if (!t) return `${prefix} —`;
  const frag = t.length > SHORT_ID_LEN ? `${t.slice(0, SHORT_ID_LEN)}…` : t;
  return `${prefix} ${frag}`;
}

/** Anonymous donor row: show only the first 6 characters of `donorUserId` (no prefix). */
function donorIdSnippet(donorUserId: string | undefined | null): string {
  const t = donorUserId?.trim() ?? "";
  if (!t) return "—";
  return t.slice(0, SHORT_ID_LEN);
}

export type BookingRowDetailParts = {
  who: string;
  hospital: string;
  when: string;
};

export function bookingRowDetailPartsForViewer(
  b: Booking,
  viewer: "donor" | "requester",
  hospitalFallback: string,
): BookingRowDetailParts {
  const when = formatScheduledLabel(b.scheduledAt);
  const hospital = b.hospitalName?.trim() || hospitalFallback;
  if (viewer === "donor") {
    const who =
      b.requesterDisplayName?.trim() ||
      shortIdLabel("Requester", b.requesterId);
    return { who, hospital, when };
  }
  const who = b.donorDisplayName?.trim() || donorIdSnippet(b.donorUserId);
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
    const name = b.requesterDisplayName?.trim();
    if (name) return `Request · ${name}`;
    return "Donation booking";
  }
  const donor = b.donorDisplayName?.trim();
  if (donor) return `Booking · ${donor}`;
  return "Booking request";
}

export function bookingSubtitleDonor(
  b: Booking,
  hospitalFallback: string,
): string {
  const p = bookingRowDetailPartsForViewer(b, "donor", hospitalFallback);
  return `${p.who} · ${p.hospital} · ${p.when}`;
}

export function bookingSubtitleRequester(
  b: Booking,
  hospitalFallback: string,
): string {
  const p = bookingRowDetailPartsForViewer(b, "requester", hospitalFallback);
  return `${p.who} · ${p.hospital} · ${p.when}`;
}
