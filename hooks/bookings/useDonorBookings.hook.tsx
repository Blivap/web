"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "react-redux";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import type { BookingsShellTabItem } from "@/app/(users)/bookings/components/bookings-shell.view";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState, AppDispatch } from "@/store/store";
import {
  loadReceivedBookings,
  patchBookingInLists,
} from "@/store/slices/bookingsSlice";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  buildDonorBookingsTabPanels,
  DONOR_TAB_ORDER,
  type DonorPanelKey,
} from "@/lib/bookings/donorBookingsTabPanels";
import { useBookingDeepLinkHighlight } from "./useBookingDeepLinkHighlight.hook";

export type { DonorPanelKey } from "@/lib/bookings/donorBookingsTabPanels";
export {
  DONOR_TAB_ORDER,
  donorTabForBooking,
} from "@/lib/bookings/donorBookingsTabPanels";

function scheduleReceivedBookingsResync(dispatch: AppDispatch) {
  window.setTimeout(() => {
    void dispatch(loadReceivedBookings({ silent: true }));
  }, 450);
}

export function useDonorBookings() {
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const user = useAppSelector((s) => s.auth.user);
  const bookings = useAppSelector((s) => s.bookings.received.items);
  const hospitalNamesById = useAppSelector((s) => s.bookings.hospitalNamesById);
  const loadState = useAppSelector((s) => s.bookings.received.status);
  const loadError = useAppSelector((s) => s.bookings.received.error);

  const searchParams = useSearchParams();
  const highlightBookingId = searchParams.get("bookingId")?.trim() ?? "";

  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [reportBookingId, setReportBookingId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!user?.id) return Promise.resolve();
    return dispatch(loadReceivedBookings()).unwrap();
  }, [dispatch, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && user?.id) {
        void dispatch(loadReceivedBookings({ silent: true }));
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
      hospitalNamesById[hospitalId] ?? `Hospital ${hospitalId.slice(0, 8)}…`,
    [hospitalNamesById],
  );

  const acceptBooking = useCallback(
    async (id: string) => {
      const prev =
        store.getState().bookings.received.items.find((b) => b.id === id)
          ?.status ?? "pending";
      setMutatingId(id);
      dispatch(
        patchBookingInLists({
          id,
          status: "accepted",
          respondedAt: new Date().toISOString(),
        }),
      );
      try {
        const { status } = await $api.bookings.accept(id);
        if (status < 200 || status >= 300) {
          dispatch(patchBookingInLists({ id, status: prev }));
          showSnackbar("Could not accept this booking.");
          return;
        }
        showSnackbar(
          "You accepted this booking. You can share the meeting code when you meet.",
        );
        scheduleReceivedBookingsResync(dispatch);
      } catch (e) {
        dispatch(patchBookingInLists({ id, status: prev }));
        showSnackbar(
          getAxiosErrorMessage(
            e,
            "Could not accept this booking. Please try again.",
          ),
        );
      } finally {
        setMutatingId(null);
      }
    },
    [dispatch, showSnackbar, store],
  );

  const declineBooking = useCallback(
    async (id: string) => {
      const prev =
        store.getState().bookings.received.items.find((b) => b.id === id)
          ?.status ?? "pending";
      setMutatingId(id);
      dispatch(
        patchBookingInLists({
          id,
          status: "rejected",
          respondedAt: new Date().toISOString(),
        }),
      );
      try {
        const { status } = await $api.bookings.decline(id);
        if (status < 200 || status >= 300) {
          dispatch(patchBookingInLists({ id, status: prev }));
          showSnackbar("Could not decline this booking.");
          return;
        }
        showSnackbar(
          "You declined this booking. The requester may choose another time or donor.",
        );
        scheduleReceivedBookingsResync(dispatch);
      } catch (e) {
        dispatch(patchBookingInLists({ id, status: prev }));
        showSnackbar(
          getAxiosErrorMessage(
            e,
            "Could not decline this booking. Please try again.",
          ),
        );
      } finally {
        setMutatingId(null);
      }
    },
    [dispatch, showSnackbar, store],
  );

  const submitReport = useCallback(
    async (payload: { reason: string; details?: string }) => {
      if (!reportBookingId) return;
      const id = reportBookingId;
      const row =
        store.getState().bookings.received.items.find((b) => b.id === id) ??
        store.getState().bookings.sent.items.find((b) => b.id === id);
      const prevCount = row?.reportsCount ?? 0;
      const { status } = await $api.bookings.report(id, payload);
      if (status < 200 || status >= 300) {
        throw new Error("Could not send the report.");
      }
      dispatch(patchBookingInLists({ id, reportsCount: prevCount + 1 }));
      showSnackbar("Thanks — your report was submitted.");
      scheduleReceivedBookingsResync(dispatch);
    },
    [dispatch, reportBookingId, showSnackbar, store],
  );

  const tabPanels = useMemo(
    () =>
      buildDonorBookingsTabPanels({
        bookings,
        hospitalLabel,
        user,
        highlightBookingId,
        mutatingId,
        acceptBooking: (id) => void acceptBooking(id),
        declineBooking: (id) => void declineBooking(id),
        setReportBookingId,
      }),
    [
      bookings,
      hospitalLabel,
      user,
      highlightBookingId,
      mutatingId,
      acceptBooking,
      declineBooking,
      setReportBookingId,
    ],
  );

  const tabLabels = useMemo(
    () =>
      ({
        pending: "Needs your answer",
        confirmed: "Confirmed",
        past: "Past",
      }) satisfies Record<DonorPanelKey, string>,
    [],
  );

  const shellTabs = useMemo((): readonly BookingsShellTabItem[] => {
    return DONOR_TAB_ORDER.map((key) => ({
      value: key,
      label: tabLabels[key],
      panel: tabPanels[key],
    }));
  }, [tabLabels, tabPanels]);

  const skeletonTabLabels = useMemo(
    () => DONOR_TAB_ORDER.map((k) => tabLabels[k]),
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
