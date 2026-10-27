"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "react-redux";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import type { BookingsShellTabItem } from "@/app/(users)/bookings/components/bookings-shell.view";
import { useSetQueryParams } from "@/hooks/navigation/useQueryParamState.hook";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import {
  loadReceivedBookings,
  patchBookingInLists,
} from "@/store/slices/bookingsSlice";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { parseBookingMutationResponse } from "@/lib/bookings/parseBookingMutationResponse";
import type { Booking } from "@/types/bookings";
import {
  buildDonorBookingsTabPanels,
  DONOR_TAB_ORDER,
  type DonorPanelKey,
} from "@/lib/bookings/donorBookingsTabPanels";
import {
  bookingListLoadArg,
  type BookingsListSourceOptions,
} from "@/lib/bookings/bookingListFilters";
import { useBookingDeepLinkHighlight } from "./useBookingDeepLinkHighlight.hook";
import {
  classifyAnalyticsError,
  trackFailure,
  trackSuccess,
} from "@/lib/analytics/ga";

export type { DonorPanelKey } from "@/lib/bookings/donorBookingsTabPanels";
export {
  DONOR_TAB_ORDER,
  donorTabForBooking,
} from "@/lib/bookings/donorBookingsTabPanels";

export function useDonorBookings(options?: BookingsListSourceOptions) {
  const enabled = options?.enabled !== false;
  const query = options?.query;
  const queryKey = JSON.stringify(query ?? {});
  const queryRef = useRef(query);
  queryRef.current = query;
  const onBookingPatchedRef = useRef(options?.onBookingPatched);
  onBookingPatchedRef.current = options?.onBookingPatched;
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const searchParams = useSearchParams();
  const user = useAppSelector((s) => s.auth.user);
  const storedBookings = useAppSelector((s) => s.bookings.received.items);
  const bookings = options?.bookings ?? storedBookings;
  const loadState = useAppSelector((s) => s.bookings.received.status);
  const loadError = useAppSelector((s) => s.bookings.received.error);

  const setParams = useSetQueryParams();
  const highlightBookingId = searchParams.get("bookingId")?.trim() ?? "";
  const reportOpen = searchParams.get("modal") === "report";
  const reportBookingId =
    reportOpen && highlightBookingId ? highlightBookingId : null;

  const setReportBookingId = useCallback(
    (id: string | null) => {
      if (id) {
        setParams({ modal: "report", bookingId: id });
        return;
      }
      setParams({ modal: null });
    },
    [setParams],
  );

  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const publishBookingPatch = useCallback((id: string, patch: Partial<Booking>) => {
    onBookingPatchedRef.current?.(id, patch);
  }, []);

  const loadData = useCallback(() => {
    if (!user?.id || !enabled) return Promise.resolve();
    return dispatch(
      loadReceivedBookings(
        bookingListLoadArg(
          queryRef.current,
          store.getState().bookings.received.status === "ok",
        ),
      ),
    ).unwrap();
  }, [dispatch, enabled, store, user?.id]);

  useEffect(() => {
    if (!user?.id || !enabled) return;
    const status = store.getState().bookings.received.status;
    void dispatch(
      loadReceivedBookings(
        bookingListLoadArg(queryRef.current, status === "ok"),
      ),
    );
  }, [dispatch, enabled, queryKey, store, user?.id]);

  const rowIdsFingerprint = useMemo(
    () => bookings.map((b) => b.id).join(","),
    [bookings],
  );
  useBookingDeepLinkHighlight(highlightBookingId, loadState, rowIdsFingerprint);

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
        const { status, data } = await $api.bookings.accept(id);
        if (status < 200 || status >= 300) {
          trackFailure("booking_accepted", "api");
          dispatch(patchBookingInLists({ id, status: prev }));
          showSnackbar("Could not accept this booking.");
          return;
        }
        trackSuccess("booking_accepted");
        const patch: Partial<Booking> = {
          status: "accepted",
          respondedAt: new Date().toISOString(),
          ...parseBookingMutationResponse(data),
        };
        dispatch(patchBookingInLists({ id, ...patch }));
        publishBookingPatch(id, patch);
        showSnackbar(
          "You accepted this booking. You can share the meeting code when you meet.",
        );
      } catch (e) {
        trackFailure("booking_accepted", classifyAnalyticsError(e));
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
    [dispatch, publishBookingPatch, showSnackbar, store],
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
        const { status, data } = await $api.bookings.decline(id);
        if (status < 200 || status >= 300) {
          trackFailure("booking_declined", "api");
          dispatch(patchBookingInLists({ id, status: prev }));
          showSnackbar("Could not decline this booking.");
          return;
        }
        trackSuccess("booking_declined");
        const patch: Partial<Booking> = {
          status: "rejected",
          respondedAt: new Date().toISOString(),
          ...parseBookingMutationResponse(data),
        };
        dispatch(patchBookingInLists({ id, ...patch }));
        publishBookingPatch(id, patch);
        showSnackbar("Booking declined.", "success");
      } catch (e) {
        trackFailure("booking_declined", classifyAnalyticsError(e));
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
    [dispatch, publishBookingPatch, showSnackbar, store],
  );

  const submitReport = useCallback(
    async (payload: { reason: string; details?: string }) => {
      if (!reportBookingId) return;
      const id = reportBookingId;
      const row =
        bookings.find((b) => b.id === id) ??
        store.getState().bookings.received.items.find((b) => b.id === id) ??
        store.getState().bookings.sent.items.find((b) => b.id === id);
      const prevCount = row?.reportsCount ?? 0;
      const { status } = await $api.bookings.report(id, payload);
      if (status < 200 || status >= 300) {
        throw new Error("Could not send the report.");
      }
      const patch = { reportsCount: prevCount + 1 };
      dispatch(patchBookingInLists({ id, ...patch }));
      publishBookingPatch(id, patch);
      showSnackbar("Thanks — your report was submitted.");
    },
    [bookings, dispatch, publishBookingPatch, reportBookingId, showSnackbar, store],
  );

  const tabPanels = useMemo(
    () =>
      buildDonorBookingsTabPanels({
        bookings,
        user,
        highlightBookingId,
        mutatingId,
        acceptBooking: (id) => void acceptBooking(id),
        declineBooking: (id) => void declineBooking(id),
        setReportBookingId,
      }),
    [
      bookings,
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
        pending: "Pending",
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
    bookings,
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
