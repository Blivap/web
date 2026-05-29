import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";
import type {
  BookingListQuery,
  CreateBookingPayload,
  ReportBookingPayload,
  RespondBookingPayload,
} from "@/types/bookings";
import type { BookingRatingPayload } from "@/types/ratings";
import { toBookingsListQueryString } from "@/lib/bookings/bookingsListQuery";

export default function BookingRepository() {
  return {
    /** POST /bookings/request — preferred for new clients. */
    request(payload: CreateBookingPayload): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.request, {
        method: "POST",
        data: payload,
      });
    },

    /** POST /bookings — legacy alias, same payload as `request`. */
    create(payload: CreateBookingPayload): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.create, {
        method: "POST",
        data: payload,
      });
    },

    sent(params?: BookingListQuery): Promise<IResponse<unknown>> {
      const qs = toBookingsListQueryString(params);
      return fetcher(`${endpoints.bookings.sent}${qs}`, { method: "GET" });
    },

    received(params?: BookingListQuery): Promise<IResponse<unknown>> {
      const qs = toBookingsListQueryString(params);
      return fetcher(`${endpoints.bookings.received}${qs}`, {
        method: "GET",
      });
    },

    mine(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.mine, { method: "GET" });
    },

    /** Legacy: PATCH /bookings/:id/respond — prefer `accept` / `decline` in new UIs. */
    respond(
      id: string,
      payload: RespondBookingPayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.respond(id), {
        method: "PATCH",
        data: payload,
      });
    },

    accept(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.accept(id), { method: "PATCH" });
    },

    decline(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.decline(id), { method: "PATCH" });
    },

    cancel(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.cancel(id), { method: "PATCH" });
    },

    report(
      id: string,
      payload: ReportBookingPayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.report(id), {
        method: "PATCH",
        data: payload,
      });
    },

    /** Optional PATCH — sends another notification to the donor (rebuzz). No body. */
    remind(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.remind(id), { method: "PATCH" });
    },

    submitRating(
      bookingId: string,
      payload: BookingRatingPayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.rating(bookingId), {
        method: "POST",
        data: payload,
      });
    },
  };
}
