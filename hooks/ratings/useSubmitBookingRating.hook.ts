"use client";

import { useCallback, useState } from "react";
import { $api } from "@/app/api";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import { markBookingRatedLocally } from "@/lib/ratings/ratedBookingsStorage";
import axios from "axios";

export type SubmitBookingRatingResult =
  | { ok: true }
  | { ok: false; message: string; alreadyRated?: boolean };

export function useSubmitBookingRating() {
  const [busy, setBusy] = useState(false);

  const submitRating = useCallback(
    async (
      bookingId: string,
      score: number,
      comment?: string,
    ): Promise<SubmitBookingRatingResult> => {
      if (!bookingId.trim()) {
        return { ok: false, message: "Missing booking." };
      }
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        return { ok: false, message: "Select a rating from 1 to 5 stars." };
      }

      const trimmedComment = comment?.trim();
      const payload = {
        score,
        ...(trimmedComment ? { comment: trimmedComment } : {}),
      };

      setBusy(true);
      try {
        const { status, data } = await $api.bookings.submitRating(
          bookingId,
          payload,
        );
        if (status === 409) {
          markBookingRatedLocally(bookingId);
          return { ok: true };
        }
        if (status < 200 || status >= 300) {
          const msg =
            getApiMessageFromData(data) ?? "Could not submit your rating.";
          const lower = msg.toLowerCase();
          if (
            status === 400 &&
            (lower.includes("already") || lower.includes("rated"))
          ) {
            markBookingRatedLocally(bookingId);
            return { ok: true };
          }
          return { ok: false, message: msg };
        }
        markBookingRatedLocally(bookingId);
        return { ok: true };
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const st = e.response?.status;
          if (st === 409) {
            markBookingRatedLocally(bookingId);
            return { ok: true };
          }
          if (st === 429) {
            return {
              ok: false,
              message: "Too many attempts. Try again later.",
            };
          }
          const msg = getAxiosErrorMessage(
            e,
            "Could not submit your rating. Try again.",
          );
          const lower = msg.toLowerCase();
          if (lower.includes("already") || lower.includes("rated")) {
            markBookingRatedLocally(bookingId);
            return { ok: true };
          }
          return { ok: false, message: msg };
        }
        return {
          ok: false,
          message: "Could not submit your rating. Try again.",
        };
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { submitRating, busy };
}
