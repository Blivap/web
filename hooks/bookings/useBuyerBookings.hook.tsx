"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import type {
  BookingsShellTabItem,
} from "@/app/(users)/bookings/components/bookings-shell.view";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadSentBookings } from "@/store/slices/bookingsSlice";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  buildBuyerBookingsTabPanels,
  BUYER_TAB_ORDER,
  type BuyerPanelKey,
} from "@/lib/bookings/buyerBookingsTabPanels";
import { useBookingDeepLinkHighlight } from "./useBookingDeepLinkHighlight.hook";

export type { BuyerPanelKey } from "@/lib/bookings/buyerBookingsTabPanels";
export { BUYER_TAB_ORDER } from "@/lib/bookings/buyerBookingsTabPanels";

export function useBuyerBookings() {
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const bookings = useAppSelector((s) => s.bookings.sent.items);
  const hospitalNamesById = useAppSelector((s) => s.bookings.hospitalNamesById);
  const loadState = useAppSelector((s) => s.bookings.sent.status);
  const loadError = useAppSelector((s) => s.bookings.sent.error);

  const searchParams = useSearchParams();
  const highlightBookingId = searchParams.get("bookingId")?.trim() ?? "";

  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [reportBookingId, setReportBookingId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!user?.id) return Promise.resolve();
    return dispatch(loadSentBookings()).unwrap();
  }, [dispatch, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && user?.id) {
        void dispatch(loadSentBookings());
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [dispatch, user?.id]);

  const rowIdsFingerprint = useMemo(
    () => bookings.map((b) => b.id).join(","),
    [bookings],
  );
  useBookingDeepLinkHighlight(highlightBookingId, loadState, rowIdsFingerprint);

  const hospitalLabel = useCallback(
    (hospitalId: string) =>
      hospitalNamesById[hospitalId] ??
      `Hospital ${hospitalId.slice(0, 8)}…`,
    [hospitalNamesById],
  );

  const refreshSent = useCallback(() => {
    void dispatch(loadSentBookings());
  }, [dispatch]);

  const withdrawBooking = useCallback(
    async (id: string) => {
      setMutatingId(id);
      try {
        const { status } = await $api.bookings.cancel(id);
        if (status < 200 || status >= 300) {
          showSnackbar("Could not withdraw this request.");
          return;
        }
        showSnackbar("Request withdrawn — booking cancelled.");
        refreshSent();
      } catch (e) {
        showSnackbar(
          getAxiosErrorMessage(
            e,
            "Could not withdraw this request. Please try again.",
          ),
        );
      } finally {
        setMutatingId(null);
      }
    },
    [refreshSent, showSnackbar],
  );

  const remindDonor = useCallback(
    async (id: string) => {
      setRemindingId(id);
      try {
        const { status } = await $api.bookings.remind(id);
        if (status < 200 || status >= 300) {
          showSnackbar("Could not send reminder.");
          return;
        }
        showSnackbar("Reminder sent to the donor.");
        refreshSent();
      } catch (e) {
        showSnackbar(
          getAxiosErrorMessage(e, "Reminder didnt go through"),
          "error",
        );
      } finally {
        setRemindingId(null);
      }
    },
    [refreshSent, showSnackbar],
  );

  const submitReport = useCallback(
    async (payload: { reason: string; details?: string }) => {
      if (!reportBookingId) return;
      const { status } = await $api.bookings.report(reportBookingId, payload);
      if (status < 200 || status >= 300) {
        throw new Error("Could not send the report.");
      }
      showSnackbar("Thanks — your report was submitted.");
      refreshSent();
    },
    [reportBookingId, refreshSent, showSnackbar],
  );

  const tabPanels = useMemo(
    () =>
      buildBuyerBookingsTabPanels({
        bookings,
        hospitalLabel,
        user,
        highlightBookingId,
        mutatingId,
        remindingId,
        withdrawBooking: (id) => void withdrawBooking(id),
        remindDonor: (id) => void remindDonor(id),
        setReportBookingId,
      }),
    [
      bookings,
      hospitalLabel,
      user,
      highlightBookingId,
      mutatingId,
      remindingId,
      withdrawBooking,
      remindDonor,
    ],
  );

  const tabLabels = useMemo(
    () =>
      ({
        sent: "Sent",
        confirmed: "Confirmed",
        past: "Past",
      }) satisfies Record<BuyerPanelKey, string>,
    [],
  );

  const shellTabs = useMemo((): readonly BookingsShellTabItem[] => {
    return BUYER_TAB_ORDER.map((key) => ({
      value: key,
      label: tabLabels[key],
      panel: tabPanels[key],
    }));
  }, [tabLabels, tabPanels]);

  const skeletonTabLabels = useMemo(
    () => BUYER_TAB_ORDER.map((k) => tabLabels[k]),
    [tabLabels],
  );

  return {
    user,
    loadState,
    loadError,
    loadData,
    reportBookingId,
    setReportBookingId,
    submitReport,
    shellTabs,
    skeletonTabLabels,
  };
}
