import type { Booking, BookingListQuery } from "@/types/bookings";

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

/** Query fields for GET /bookings: `filter` and `date` (`YYYY-MM-DD`). */
export function bookingListApiQuery(
  filter: BookingListFilter,
  date: string,
): Pick<BookingListQuery, "filter" | "date"> {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(date.trim()) ? date.trim() : "";
  return {
    ...(filter !== "all" ? { filter } : {}),
    ...(day ? { date: day } : {}),
  };
}

export function isActiveBookingListQuery(
  query?: Pick<BookingListQuery, "filter" | "date">,
): boolean {
  return Boolean(
    (query?.filter && query.filter !== "all") || query?.date,
  );
}

export type BookingsListSourceOptions = {
  /** Sent on GET /bookings as `filter` and `date`. */
  query?: Pick<BookingListQuery, "filter" | "date">;
  /** When false, the hook does not request the list. */
  enabled?: boolean;
  /** Rows to render instead of the stored list. */
  bookings?: Booking[];
  /** Apply a successful mutation to the visible rows. */
  onBookingPatched?: (id: string, patch: Partial<Booking>) => void;
};

const LIST_FILTER_STATUS: Partial<
  Record<BookingListFilter, Booking["status"]>
> = {
  pending: "pending",
  confirmed: "accepted",
  cancelled: "cancelled",
  completed: "completed",
  declined: "rejected",
  expired: "expired",
  no_show: "no_show",
};

function scheduledCalendarDay(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Whether a patched row still belongs on the current bookings query. */
export function bookingStillMatchesListQuery(
  booking: Booking,
  filter: BookingListFilter,
  date: string,
  userId: string | undefined,
): boolean {
  if (date) {
    const day = scheduledCalendarDay(booking.scheduledAt);
    if (day && day !== date) return false;
  }
  if (filter === "all") return true;
  if (filter === "incoming" || filter === "outgoing") {
    return bookingDirectionForViewer(booking, userId, filter) === filter;
  }
  const status = LIST_FILTER_STATUS[filter];
  return status ? booking.status === status : true;
}

/** `silent` keeps the current screen up. `replace` drops rows the server filter excluded. */
export function bookingListLoadArg(
  query: BookingsListSourceOptions["query"],
  alreadyLoaded: boolean,
): {
  silent?: boolean;
  replace?: boolean;
  query?: BookingsListSourceOptions["query"];
} {
  const active = isActiveBookingListQuery(query);
  if (alreadyLoaded) {
    return { silent: true, replace: active, query };
  }
  return { replace: active, query };
}

export function bookingDirectionForViewer(
  booking: Booking,
  userId: string | undefined,
  filter: BookingListFilter,
): "incoming" | "outgoing" {
  if (booking.direction === "incoming" || booking.direction === "outgoing") {
    return booking.direction;
  }
  if (filter === "incoming") return "incoming";
  if (filter === "outgoing") return "outgoing";
  if (userId && booking.requesterId === userId) return "outgoing";
  if (userId && booking.donorUserId === userId) return "incoming";
  return "outgoing";
}
