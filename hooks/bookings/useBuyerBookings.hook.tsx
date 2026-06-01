"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "react-redux";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import type { BookingsShellTabItem } from "@/app/(users)/bookings/components/bookings-shell.view";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { AppDispatch, RootState } from "@/store/store";
import {
  loadSentBookings,
  patchBookingInLists,
} from "@/store/slices/bookingsSlice";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { bookingNeedsRequesterRating } from "@/lib/ratings/ratedBookingsStorage";
import type { Booking } from "@/types/bookings";
import {
  buildBuyerBookingsTabPanels,
  BUYER_TAB_ORDER,
  type BuyerPanelKey,
} from "@/lib/bookings/buyerBookingsTabPanels";
import { useBookingDeepLinkHighlight } from "./useBookingDeepLinkHighlight.hook";

export type { BuyerPanelKey } from "@/lib/bookings/buyerBookingsTabPanels";
export { BUYER_TAB_ORDER } from "@/lib/bookings/buyerBookingsTabPanels";

const BOOKINGS_POLL_MS = 20_000;

function donorLabelFromBooking(b: Booking): string {
  if (b.donorDisplayName?.trim()) return b.donorDisplayName.trim();
  return `Donor ${b.donorUserId.slice(0, 6)}`;
}

function scheduleBookingsResync(dispatch: AppDispatch) {
  window.setTimeout(() => {
    void dispatch(loadSentBookings({ silent: true }));
  }, 800);
}

export function useBuyerBookings() {
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const user = useAppSelector((s) => s.auth.user);
  const bookings = useAppSelector((s) => s.bookings.sent.items);
  const loadState = useAppSelector((s) => s.bookings.sent.status);
  const loadError = useAppSelector((s) => s.bookings.sent.error);

  const searchParams = useSearchParams();
  const highlightBookingId = searchParams.get("bookingId")?.trim() ?? "";

  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [reportBookingId, setReportBookingId] = useState<string | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);

  const openRatingForBooking = useCallback(
    (id: string) => {
      const b = bookings.find((row) => row.id === id);
      if (!b || !user?.id || b.requesterId !== user.id) return;
      if (!bookingNeedsRequesterRating(b)) return;
      setRatingBookingId(id);
      setRatingOpen(true);
    },
    [bookings, user?.id],
  );

  const closeRating = useCallback(() => {
    setRatingOpen(false);
    setRatingBookingId(null);
  }, []);

  const activeRatingBooking = useMemo(
    () =>
      ratingBookingId
        ? bookings.find((b) => b.id === ratingBookingId)
        : undefined,
    [bookings, ratingBookingId],
  );

  const activeRatingDonorLabel = useMemo(
    () =>
      activeRatingBooking
        ? donorLabelFromBooking(activeRatingBooking)
        : "",
    [activeRatingBooking],
  );

  const handleRatingSuccess = useCallback(() => {
    const bid = ratingBookingId;
    if (bid) {
      dispatch(
        patchBookingInLists({
          id: bid,
          requesterHasRated: true,
          status: "completed",
        }),
      );
    }
    closeRating();
    showSnackbar("Thanks for your rating.", "success");
    void dispatch(loadSentBookings({ silent: true }));
  }, [ratingBookingId, dispatch, closeRating, showSnackbar]);

  const loadData = useCallback(() => {
    if (!user?.id) return Promise.resolve();
    return dispatch(loadSentBookings()).unwrap();
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const status = store.getState().bookings.sent.status;
    void dispatch(
      loadSentBookings(status === "ok" ? { silent: true } : undefined),
    );
  }, [dispatch, user?.id, store]);

  useEffect(() => {
    if (!user?.id) return;
    const timer = window.setInterval(() => {
      void dispatch(loadSentBookings({ silent: true }));
    }, BOOKINGS_POLL_MS);
    return () => window.clearInterval(timer);
  }, [dispatch, user?.id]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && user?.id) {
        void dispatch(loadSentBookings({ silent: true }));
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

  const refreshSent = useCallback(() => {
    void dispatch(loadSentBookings({ silent: true }));
  }, [dispatch]);

  const withdrawBooking = useCallback(
    async (id: string) => {
      const prev =
        store.getState().bookings.sent.items.find((b) => b.id === id)?.status ??
        "pending";
      setMutatingId(id);
      dispatch(patchBookingInLists({ id, status: "cancelled" }));
      try {
        const { status } = await $api.bookings.cancel(id);
        if (status < 200 || status >= 300) {
          dispatch(patchBookingInLists({ id, status: prev }));
          showSnackbar("Could not withdraw this request.");
          return;
        }
        showSnackbar("Request withdrawn — booking cancelled.");
        scheduleBookingsResync(dispatch);
      } catch (e) {
        dispatch(patchBookingInLists({ id, status: prev }));
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
    [dispatch, showSnackbar, store],
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
      const id = reportBookingId;
      const row =
        store.getState().bookings.sent.items.find((b) => b.id === id) ??
        store.getState().bookings.received.items.find((b) => b.id === id);
      const prevCount = row?.reportsCount ?? 0;
      const { status } = await $api.bookings.report(id, payload);
      if (status < 200 || status >= 300) {
        throw new Error("Could not send the report.");
      }
      dispatch(patchBookingInLists({ id, reportsCount: prevCount + 1 }));
      showSnackbar("Thanks — your report was submitted.");
      scheduleBookingsResync(dispatch);
    },
    [dispatch, reportBookingId, showSnackbar, store],
  );

  const tabPanels = useMemo(
    () =>
      buildBuyerBookingsTabPanels({
        bookings,
        user,
        highlightBookingId,
        mutatingId,
        remindingId,
        withdrawBooking: (id) => void withdrawBooking(id),
        remindDonor: (id) => void remindDonor(id),
        setReportBookingId,
        openRatingForBooking,
      }),
    [
      bookings,
      user,
      highlightBookingId,
      mutatingId,
      remindingId,
      withdrawBooking,
      remindDonor,
      setReportBookingId,
      openRatingForBooking,
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
    ratingOpen,
    activeRatingBooking,
    activeRatingDonorLabel,
    closeRating,
    handleRatingSuccess,
  };
}
