"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { $api } from "@/app/api";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import { parseMeetupEnsureSessionBody } from "@/lib/meetups/parseMeetupResponses";
import {
  meetupBookingCodeStashKey,
  meetupCodeHintStorageKey,
  meetupOtqrStorageKey,
} from "@/lib/meetups/meetupSessionStorageKeys";

export function MeetupBootstrapClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId")?.trim() ?? "";
  const [error, setError] = useState<string | null>(null);

  const missingBooking = !bookingId;

  useEffect(() => {
    if (missingBooking) return;

    let cancelled = false;
    void (async () => {
      try {
        const { status, data } = await $api.meetups.ensureSession(bookingId);
        if (cancelled) return;
        if (status < 200 || status >= 300) {
          setError(
            getApiMessageFromData(data) ??
              "Could not open the meetup for this booking.",
          );
          return;
        }
        const parsed = parseMeetupEnsureSessionBody(data);
        if (!parsed?.sessionId) {
          setError("Unexpected response from the server.");
          return;
        }
        try {
          if (parsed.qrToken) {
            sessionStorage.setItem(
              meetupOtqrStorageKey(parsed.sessionId),
              parsed.qrToken,
            );
          }
          let codeHint = parsed.meetingCode;
          if (!codeHint) {
            const stashed = sessionStorage.getItem(
              meetupBookingCodeStashKey(bookingId),
            );
            if (stashed) {
              codeHint = stashed;
              sessionStorage.removeItem(meetupBookingCodeStashKey(bookingId));
            }
          }
          if (codeHint) {
            sessionStorage.setItem(
              meetupCodeHintStorageKey(parsed.sessionId),
              codeHint,
            );
          }
        } catch {
          /* storage blocked */
        }
        router.replace(`/bookings/meetup/${parsed.sessionId}`);
      } catch (e) {
        if (!cancelled) {
          setError(
            getAxiosErrorMessage(e, "Could not open the meetup. Try again."),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId, missingBooking, router]);

  if (missingBooking) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-white p-6 text-center dark:border-white/10 dark:bg-[#1a1a22]">
        <p className="text-sm text-text-primary">
          This link is missing a booking id.
        </p>
        <Link
          href="/bookings"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-white p-6 text-center dark:border-white/10 dark:bg-[#1a1a22]">
        <p className="text-sm text-text-primary">{error}</p>
        <Link
          href="/bookings"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-text-secondary">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">Opening meetup…</p>
    </div>
  );
}
