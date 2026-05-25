import type { BookingListQuery } from "@/types/bookings";

/** Builds `?page=&limit=&status=&scheduledFrom=&scheduledTo=` for GET /bookings/sent|received. */
export function toBookingsListQueryString(params?: BookingListQuery): string {
  const sp = new URLSearchParams();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;
  sp.set("page", String(Math.max(1, page)));
  sp.set("limit", String(Math.min(100, Math.max(1, limit))));
  if (params?.status) sp.set("status", params.status);
  if (params?.scheduledFrom) sp.set("scheduledFrom", params.scheduledFrom);
  if (params?.scheduledTo) sp.set("scheduledTo", params.scheduledTo);
  const q = sp.toString();
  return q ? `?${q}` : "";
}
