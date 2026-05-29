"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Booking } from "@/types/bookings";
import { bookingNeedsRequesterRating } from "@/lib/ratings/ratedBookingsStorage";

export type PendingDonationRating = {
  bookingId: string;
  donorUserId: string;
  donorLabel: string;
};

function donorLabelFromBooking(b: Booking): string {
  if (b.donorDisplayName?.trim()) return b.donorDisplayName.trim();
  return `Donor ${b.donorUserId.slice(0, 6)}`;
}

function pickPendingFromBookings(
  bookings: Booking[],
  requesterId: string | undefined,
): PendingDonationRating | null {
  if (!requesterId) return null;
  const candidates = bookings
    .filter(
      (b) =>
        b.requesterId === requesterId &&
        bookingNeedsRequesterRating(b),
    )
    .sort((a, b) => {
      const ta = new Date(a.scheduledAt).getTime();
      const tb = new Date(b.scheduledAt).getTime();
      return tb - ta;
    });
  const top = candidates[0];
  if (!top) return null;
  return {
    bookingId: top.id,
    donorUserId: top.donorUserId,
    donorLabel: donorLabelFromBooking(top),
  };
}

export function usePendingDonationRating(
  bookings: Booking[],
  requesterId: string | undefined,
  enabled: boolean,
) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [manualPending, setManualPending] =
    useState<PendingDonationRating | null>(null);
  const autoPromptedRef = useRef(false);

  const autoPending = useMemo(
    () => pickPendingFromBookings(bookings, requesterId),
    [bookings, requesterId],
  );

  const activePending = manualPending ?? autoPending;

  useEffect(() => {
    if (!enabled) return;
    if (autoPromptedRef.current) return;
    if (!autoPending) return;
    autoPromptedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prompt once when a completed unrated booking appears
    setRatingOpen(true);
  }, [enabled, autoPending]);

  const openRatingForBooking = useCallback(
    (bookingId: string) => {
      const b = bookings.find((row) => row.id === bookingId);
      if (!b || !requesterId || b.requesterId !== requesterId) return;
      if (!bookingNeedsRequesterRating(b)) return;
      setManualPending({
        bookingId: b.id,
        donorUserId: b.donorUserId,
        donorLabel: donorLabelFromBooking(b),
      });
      setRatingOpen(true);
    },
    [bookings, requesterId],
  );

  const closeRating = useCallback(() => {
    setRatingOpen(false);
    setManualPending(null);
  }, []);

  const onRatingSuccess = useCallback(() => {
    setManualPending(null);
  }, []);

  return {
    ratingOpen,
    setRatingOpen,
    activePending,
    openRatingForBooking,
    closeRating,
    onRatingSuccess,
  };
}
