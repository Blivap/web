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
  loadSentBookings,
  patchBookingInLists,
} from "@/store/slices/bookingsSlice";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  buildBuyerBookingsTabPanels,
  BUYER_TAB_ORDER,
  type BuyerPanelKey,
} from "@/lib/bookings/buyerBookingsTabPanels";
import {
  bookingListLoadArg,
  type BookingsListSourceOptions,
} from "@/lib/bookings/bookingListFilters";
import { formatPublicId } from "@/lib/users/formatPublicId";
import { bookingNeedsRequesterRating } from "@/lib/ratings/ratedBookingsStorage";
import type { Booking } from "@/types/bookings";
import { useBookingDeepLinkHighlight } from "./useBookingDeepLinkHighlight.hook";
import {
  classifyAnalyticsError,
  trackFailure,
  trackSuccess,
} from "@/lib/analytics/ga";

export type { BuyerPanelKey } from "@/lib/bookings/buyerBookingsTabPanels";
export { BUYER_TAB_ORDER } from "@/lib/bookings/buyerBookingsTabPanels";

function donorLabelFromBooking(b: Booking): string {
  return formatPublicId(b.donorPublicId) ?? "";
}

export function useBuyerBookings(options?: BookingsListSourceOptions) {
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
  const user = useAppSelector((s) => s.auth.user);
  const storedBookings = useAppSelector((s) => s.bookings.sent.items);
  const bookings = options?.bookings ?? storedBookings;
  const loadState = useAppSelector((s) => s.bookings.sent.status);
  const loadError = useAppSelector((s) => s.bookings.sent.error);

  const searchParams = useSearchParams();
  const setParams = useSetQueryParams();
  const highlightBookingId = searchParams.get("bookingId")?.trim() ?? "";
  const ratingOpen = searchParams.get("modal") === "rate";
  const ratingBookingId =
    ratingOpen && highlightBookingId ? highlightBookingId : null;

  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const publishBookingPatch = useCallback((id: string, patch: Partial<Booking>) => {
    onBookingPatchedRef.current?.(id, patch);
  }, []);

  const openRatingForBooking = useCallback(
    (id: string) => {
      const b = bookings.find((row) => row.id === id);
      if (!b || !user?.id || b.requesterId !== user.id) return;
      if (!bookingNeedsRequesterRating(b)) return;
      setParams({ modal: "rate", bookingId: id });
    },
    [bookings, setParams, user?.id],
  );

  const closeRating = useCallback(() => {
    setParams({ modal: null });
  }, [setParams]);

  const activeRatingBooking = useMemo(
    () =>
      ratingBookingId
        ? bookings.find((b) => b.id === ratingBookingId)
        : undefined,
    [bookings, ratingBookingId],
  );

  const activeRatingDonorLabel = useMemo(
    () =>
      activeRatingBooking ? donorLabelFromBooking(activeRatingBooking) : "",
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
    if (bid) {
      publishBookingPatch(bid, {
        requesterHasRated: true,
        status: "completed",
      });
    }
  }, [ratingBookingId, dispatch, closeRating, publishBookingPatch, showSnackbar]);

  const loadData = useCallback(() => {
    if (!user?.id || !enabled) return Promise.resolve();
    return dispatch(
      loadSentBookings(
        bookingListLoadArg(
          queryRef.current,
          store.getState().bookings.sent.status === "ok",
        ),
      ),
    ).unwrap();
  }, [dispatch, enabled, store, user?.id]);

  useEffect(() => {
    if (!user?.id || !enabled) return;
    const status = store.getState().bookings.sent.status;
    void dispatch(
      loadSentBookings(bookingListLoadArg(queryRef.current, status === "ok")),
    );
  }, [dispatch, enabled, queryKey, store, user?.id]);

  const rowIdsFingerprint = useMemo(
    () => bookings.map((b) => b.id).join(","),
    [bookings],
  );
  useBookingDeepLinkHighlight(highlightBookingId, loadState, rowIdsFingerprint);

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
          trackFailure("booking_cancelled", "api");
          dispatch(patchBookingInLists({ id, status: prev }));
          showSnackbar("Could not withdraw this request.");
          return;
        }
        trackSuccess("booking_cancelled");
        const patch: Partial<Booking> = { status: "cancelled" };
        dispatch(patchBookingInLists({ id, ...patch }));
        publishBookingPatch(id, patch);
        showSnackbar("Request withdrawn — booking cancelled.");
      } catch (e) {
        trackFailure("booking_cancelled", classifyAnalyticsError(e));
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
    [dispatch, publishBookingPatch, showSnackbar, store],
  );

  const tabPanels = useMemo(
    () =>
      buildBuyerBookingsTabPanels({
        bookings,
        user,
        highlightBookingId,
        mutatingId,
        withdrawBooking: (id) => void withdrawBooking(id),
        openRatingForBooking,
      }),
    [
      bookings,
      user,
      highlightBookingId,
      mutatingId,
      withdrawBooking,
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
    bookings,
    loadState,
    loadError,
    loadData,
    shellTabs,
    skeletonTabLabels,
    ratingOpen,
    activeRatingBooking,
    activeRatingDonorLabel,
    closeRating,
    handleRatingSuccess,
  };
}
