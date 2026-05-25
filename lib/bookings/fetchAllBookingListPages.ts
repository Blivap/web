import type {
  Booking,
  BookingListQuery,
  BookingsListMeta,
} from "@/types/bookings";
import type { IResponse } from "@/types";
import { parseBookingsPaginatedResponse } from "@/lib/bookings/parseBookingsMineResponse";

const PAGE_LIMIT = 100;

export type FetchAllBookingsResult =
  | { ok: true; bookings: Booking[]; meta?: BookingsListMeta }
  | { ok: false; error: string };

/**
 * Loads all pages from GET /bookings/sent or GET /bookings/received until
 * `meta.total` is satisfied or a short page / empty page ends the chain.
 */
export async function fetchAllBookingListPages(
  fetchPage: (params: BookingListQuery) => Promise<IResponse<unknown>>,
): Promise<FetchAllBookingsResult> {
  const merged: Booking[] = [];
  let page = 1;
  let lastMeta: BookingsListMeta | undefined;

  for (;;) {
    const res = await fetchPage({ page, limit: PAGE_LIMIT });
    if (res.status < 200 || res.status >= 300 || res.data === undefined) {
      return { ok: false, error: "Could not load bookings." };
    }

    const { bookings, meta } = parseBookingsPaginatedResponse(res.data);
    lastMeta = meta;
    merged.push(...bookings);

    const total = meta?.total;
    const fullPage = bookings.length >= PAGE_LIMIT;

    if (total !== undefined) {
      if (merged.length >= total) break;
      if (!fullPage) break;
    } else {
      if (!fullPage) break;
    }

    page += 1;
    if (page > 50) break;
  }

  return { ok: true, bookings: merged, meta: lastMeta };
}
