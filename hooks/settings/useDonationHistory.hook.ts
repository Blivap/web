"use client";

import { useCallback, useEffect, useState } from "react";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { fetchAllBookingListPages } from "@/lib/bookings/fetchAllBookingListPages";
import type { Booking } from "@/types/bookings";

export function useDonationHistory() {
  const { showSnackbar } = useSnackbar();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchAllBookingListPages(
        (params) => $api.bookings.list(params),
        { filter: "completed" },
      );
      if (!result.ok) {
        showSnackbar(result.error, "error");
        return;
      }
      const unique = result.bookings
        .filter((booking) => booking.status === "completed")
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
      setBookings(unique);
    } catch (error) {
      showSnackbar(
        getAxiosErrorMessage(error, "Could not load donation history"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    void load();
  }, [load]);

  return { bookings, loading, reload: load };
}
