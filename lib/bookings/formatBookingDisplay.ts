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
  if (role === "donor") return "Donation booking";
  return "Booking request";
}

export function bookingSubtitleDonor(
  b: Booking,
  hospitalName: string,
): string {
  const when = formatScheduledLabel(b.scheduledAt);
  const base = `${hospitalName} · ${when}`;
  if (b.status === "accepted" && b.meetingCode) {
    return `${base} · Meeting code: ${b.meetingCode}`;
  }
  return base;
}

export function bookingSubtitleRequester(
  b: Booking,
  hospitalName: string,
): string {
  const when = formatScheduledLabel(b.scheduledAt);
  const donorRef = `Donor ${b.donorUserId.slice(0, 8)}…`;
  const base = `${donorRef} · ${hospitalName} · ${when}`;
  if (b.status === "accepted" && b.meetingCode) {
    return `${base} · Meeting code: ${b.meetingCode}`;
  }
  return base;
}
