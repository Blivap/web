import type { Booking, BookingStatus } from "@/types/bookings";

export const BOOKING_LIST_FILTERS = [
  "all",
  "incoming",
  "outgoing",
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "declined",
  "expired",
  "no_show",
] as const;

export type BookingListFilter = (typeof BOOKING_LIST_FILTERS)[number];

export const BOOKING_LIST_FILTER_LABELS: Record<BookingListFilter, string> = {
  all: "All",
  incoming: "Incoming",
  outgoing: "Outgoing",
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  declined: "Declined",
  expired: "Expired",
  no_show: "No-show",
};

const STATUS_FILTERS: Partial<Record<BookingListFilter, BookingStatus>> = {
  pending: "pending",
  confirmed: "accepted",
  cancelled: "cancelled",
  completed: "completed",
  declined: "rejected",
  expired: "expired",
  no_show: "no_show",
};

export function isBookingListFilter(value: string): value is BookingListFilter {
  return (BOOKING_LIST_FILTERS as readonly string[]).includes(value);
}

export function bookingListEmptyCopy(filter: BookingListFilter): {
  title: string;
  description: string;
} {
  switch (filter) {
    case "incoming":
      return {
        title: "No incoming bookings",
        description: "Requests other people send you will show up here.",
      };
    case "outgoing":
      return {
        title: "No outgoing bookings",
        description: "Appointments you request will show up here.",
      };
    case "all":
      return {
        title: "No bookings yet",
        description:
          "Incoming and outgoing appointment requests will show up here.",
      };
    default:
      return {
        title: `No ${BOOKING_LIST_FILTER_LABELS[filter].toLowerCase()} bookings`,
        description: "Try another filter, or check back when a status changes.",
      };
  }
}

/** True when `scheduledAt` falls on `date` (`YYYY-MM-DD`, local calendar day). */
export function bookingMatchesDate(booking: Booking, date: string): boolean {
  const wanted = date.trim();
  if (!wanted) return true;
  const scheduled = new Date(booking.scheduledAt);
  if (Number.isNaN(scheduled.getTime())) return false;
  const month = String(scheduled.getMonth() + 1).padStart(2, "0");
  const day = String(scheduled.getDate()).padStart(2, "0");
  return `${scheduled.getFullYear()}-${month}-${day}` === wanted;
}

export function bookingMatchesListFilter(
  booking: Booking,
  direction: "incoming" | "outgoing",
  filter: BookingListFilter,
): boolean {
  if (filter === "incoming") return direction === "incoming";
  if (filter === "outgoing") return direction === "outgoing";
  const status = STATUS_FILTERS[filter];
  if (status) return booking.status === status;
  return true;
}
