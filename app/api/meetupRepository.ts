import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";
import type { MeetupReportPayload } from "@/types/meetups";

export default function MeetupRepository() {
  return {
    ensureSession(bookingId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.ensureSession(bookingId), {
        method: "POST",
      });
    },

    getSession(sessionId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.session(sessionId), { method: "GET" });
    },

    verifyCode(sessionId: string, code: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.verifyCode(sessionId), {
        method: "POST",
        data: { code },
      });
    },

    verifyQr(sessionId: string, token: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.verifyQr(sessionId), {
        method: "POST",
        data: { token },
      });
    },

    requesterConfirm(sessionId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.requesterConfirm(sessionId), {
        method: "PATCH",
      });
    },

    donorConfirm(sessionId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.donorConfirm(sessionId), {
        method: "PATCH",
      });
    },

    complete(sessionId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.complete(sessionId), {
        method: "PATCH",
      });
    },

    report(sessionId: string, payload: MeetupReportPayload): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.report(sessionId), {
        method: "POST",
        data: payload,
      });
    },

    cancel(sessionId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.meetups.cancel(sessionId), {
        method: "PATCH",
      });
    },
  };
}
