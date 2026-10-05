"use client";

import { useCallback, useEffect, useState } from "react";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { parseBookingsMineResponse } from "@/lib/bookings/parseBookingsMineResponse";
import type { Booking } from "@/types/bookings";

export function useDonationHistory() {
  const { showSnackbar } = useSnackbar();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        $api.bookings.received({ status: "completed", limit: 50 }),
        $api.bookings.sent({ status: "completed", limit: 50 }),
      ]);
      const rows = [
        ...parseBookingsMineResponse(received.data ?? received),
        ...parseBookingsMineResponse(sent.data ?? sent),
      ]
        .filter((booking) => booking.status === "completed")
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

      const seen = new Set<string>();
      const unique = rows.filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });
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
