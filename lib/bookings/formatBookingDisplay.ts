import type { Booking, BookingStatus } from "@/types/bookings";
import type { BookingPillVariant } from "@/app/(users)/bookings/components/booking-status-pill";

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
  const when = formatScheduledLabel(b.scheduledAt);
  const hospital = b.hospitalName?.trim() || hospitalFallback;
  const who =
    b.requesterDisplayName?.trim() ||
    `Requester ${b.requesterId.slice(0, 8)}…`;
  const base = `${who} · ${hospital} · ${when}`;
  if (b.status === "accepted" && b.meetingCode) {
    return `${base} · Meeting code: ${b.meetingCode}`;
  }
  return base;
}

export function bookingSubtitleRequester(
  b: Booking,
  hospitalFallback: string,
): string {
  const when = formatScheduledLabel(b.scheduledAt);
  const hospital = b.hospitalName?.trim() || hospitalFallback;
  const donor =
    b.donorDisplayName?.trim() ||
    `Donor ${b.donorUserId.slice(0, 8)}…`;
  const base = `${donor} · ${hospital} · ${when}`;
  if (b.status === "accepted" && b.meetingCode) {
    return `${base} · Meeting code: ${b.meetingCode}`;
  }
  return base;
}
