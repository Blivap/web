import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";
import type {
  CreateBookingPayload,
  RespondBookingPayload,
} from "@/types/bookings";

export default function BookingRepository() {
  return {
    create(
      payload: CreateBookingPayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.create, {
        method: "POST",
        data: payload,
      });
    },

    mine(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.mine, { method: "GET" });
    },

    respond(
      id: string,
      payload: RespondBookingPayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.respond(id), {
        method: "PATCH",
        data: payload,
      });
    },

    cancel(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.bookings.cancel(id), { method: "PATCH" });
    },
  };
}
