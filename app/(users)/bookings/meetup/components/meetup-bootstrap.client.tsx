"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import { parseMeetupEnsureSessionBody } from "@/lib/meetups/parseMeetupResponses";
import {
  meetupChatBookingStashKey,
  meetupCodeHintStorageKey,
  meetupOtqrStorageKey,
} from "@/lib/meetups/meetupSessionStorageKeys";
import {
  MEETUP_VERIFY_MEETING_CODE_PARAM,
  meetupPendingVerifyCodeStorageKey,
} from "@/lib/meetups/meetupVerifyQrUrl";
import { normalizeMeetupSixDigitCode } from "@/lib/meetups/meetupSwapCodes";
import { routes } from "@/config/routes";
import { MeetupPageSkeleton } from "./meetup-page-skeleton.component";

export function MeetupBootstrapClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId")?.trim() ?? "";
  const pendingVerifyCode = normalizeMeetupSixDigitCode(
    searchParams.get(MEETUP_VERIFY_MEETING_CODE_PARAM),
  );
  const [error, setError] = useState<string | null>(null);

  const missingBooking = !bookingId;

  useEffect(() => {
    if (missingBooking) {
      router.replace(routes.bookings);
    }
  }, [missingBooking, router]);

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
          const codeHint = parsed.myMeetingCode;
          if (codeHint) {
            sessionStorage.setItem(
              meetupCodeHintStorageKey(parsed.sessionId),
              codeHint,
            );
          }
          sessionStorage.setItem(
            meetupChatBookingStashKey(parsed.sessionId),
            bookingId,
          );
          if (pendingVerifyCode) {
            sessionStorage.setItem(
              meetupPendingVerifyCodeStorageKey(parsed.sessionId),
              pendingVerifyCode,
            );
          }
        } catch {
          /* storage blocked */
        }
        const sessionPath = `/bookings/meetup/${parsed.sessionId}`;
        router.replace(sessionPath);
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
  }, [bookingId, missingBooking, pendingVerifyCode, router]);

  if (missingBooking) {
    return <MeetupPageSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-white p-6 text-center dark:border-white/10 dark:bg-[#1a1a22]">
        <p className="text-sm text-text-primary">{error}</p>
        <Link
          href={routes.bookings}
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return <MeetupPageSkeleton />;
}
