import type { BookingListQuery } from "@/types/bookings";

/** Builds `?page=&limit=&filter=&date=` for GET /bookings. */
export function toBookingsListQueryString(params?: BookingListQuery): string {
  const sp = new URLSearchParams();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  sp.set("page", String(Math.max(1, page)));
  sp.set("limit", String(Math.min(100, Math.max(1, limit))));
  const filter = params?.filter?.trim();
  if (filter && filter !== "all") sp.set("filter", filter);
  const date = params?.date?.trim();
  if (date) sp.set("date", date);
  const q = sp.toString();
  return q ? `?${q}` : "";
}
