"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import type {
  BookingsShellRow,
  BookingsShellTabItem,
  BookingsTabPanel,
} from "@/app/(users)/bookings/components/bookings-shell.view";
import { useAppSelector } from "@/store/hooks";
import { fetchAllBookingListPages } from "@/lib/bookings/fetchAllBookingListPages";
import { parseHospitalsListResponse } from "@/lib/hospitals/parseHospitalsListResponse";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  bookingSubtitleDonor,
  bookingTitleForViewer,
  formatScheduledLabel,
  statusToPill,
} from "@/lib/bookings/formatBookingDisplay";
import {
  donorActionBtnClass,
  donorDangerBtnClass,
  donorGhostBtnClass,
} from "@/lib/bookings/bookingsActionButtonClassNames";
import type { Booking } from "@/types/bookings";
import { useBookingDeepLinkHighlight } from "./useBookingDeepLinkHighlight.hook";

export type DonorPanelKey = "pending" | "confirmed" | "past";

export const DONOR_TAB_ORDER: readonly DonorPanelKey[] = [
  "pending",
  "confirmed",
  "past",
];

export function donorTabForBooking(b: Booking): DonorPanelKey {
  if (b.status === "pending") return "pending";
  if (b.status === "accepted") return "confirmed";
  return "past";
}

export function useDonorBookings() {
  const { showSnackbar } = useSnackbar();
  const user = useAppSelector((s) => s.auth.user);
  const searchParams = useSearchParams();
  const highlightBookingId = searchParams.get("bookingId")?.trim() ?? "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hospitalNames, setHospitalNames] = useState<Record<string, string>>(
    () => ({}),
  );
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [reportBookingId, setReportBookingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadState("loading");
    setLoadError(null);
    try {
      const [listRes, hospRes] = await Promise.all([
        fetchAllBookingListPages((params) => $api.bookings.received(params)),
        $api.hospitals.list(),
      ]);

      if (!listRes.ok) {
        setBookings([]);
        setLoadState("error");
        setLoadError(listRes.error);
        return;
      }
      setBookings(listRes.bookings);

      if (
        hospRes.status >= 200 &&
        hospRes.status < 300 &&
        hospRes.data !== undefined
      ) {
        const hospitals = parseHospitalsListResponse(hospRes.data);
        const map: Record<string, string> = {};
        for (const h of hospitals) map[h.id] = h.name;
        setHospitalNames(map);
      }

      setLoadState("ok");
    } catch (e) {
      setBookings([]);
      setLoadState("error");
      setLoadError(
        getAxiosErrorMessage(e, "Could not load bookings. Please try again."),
      );
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const rowIdsFingerprint = useMemo(
    () => bookings.map((b) => b.id).join(","),
    [bookings],
  );
  useBookingDeepLinkHighlight(highlightBookingId, loadState, rowIdsFingerprint);

  const hospitalLabel = useCallback(
    (hospitalId: string) =>
      hospitalNames[hospitalId] ?? `Hospital ${hospitalId.slice(0, 8)}…`,
    [hospitalNames],
  );

  const acceptBooking = useCallback(
    async (id: string) => {
      setMutatingId(id);
      try {
        const { status } = await $api.bookings.accept(id);
        if (status < 200 || status >= 300) {
          showSnackbar("Could not accept this booking.");
          return;
        }
        showSnackbar(
          "You accepted this booking. You can share the meeting code when you meet.",
        );
        await loadData();
      } catch (e) {
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
    [loadData, showSnackbar],
  );

  const declineBooking = useCallback(
    async (id: string) => {
      setMutatingId(id);
      try {
        const { status } = await $api.bookings.decline(id);
        if (status < 200 || status >= 300) {
          showSnackbar("Could not decline this booking.");
          return;
        }
        showSnackbar(
          "You declined this booking. The requester may choose another time or donor.",
        );
        await loadData();
      } catch (e) {
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
    [loadData, showSnackbar],
  );

  const submitReport = useCallback(
    async (payload: { reason: string; details?: string }) => {
      if (!reportBookingId) return;
      const { status } = await $api.bookings.report(
        reportBookingId,
        payload,
      );
      if (status < 200 || status >= 300) {
        throw new Error("Could not send the report.");
      }
      showSnackbar("Thanks — your report was submitted.");
      await loadData();
    },
    [reportBookingId, loadData, showSnackbar],
  );

  const tabPanels = useMemo((): Record<DonorPanelKey, BookingsTabPanel> => {
    const mapRow = (b: Booking, tab: DonorPanelKey): BookingsShellRow => {
      const pill = statusToPill(b.status);
      const title = bookingTitleForViewer(b, "donor");
      const subtitle = bookingSubtitleDonor(b, hospitalLabel(b.hospitalId));
      const dateCol = formatScheduledLabel(b.scheduledAt);

      let actionsSlot: ReactNode;

      if (tab === "pending" && b.status === "pending") {
        const busy = mutatingId === b.id;
        actionsSlot = (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              className={donorActionBtnClass}
              disabled={busy}
              onClick={() => void acceptBooking(b.id)}
            >
              Accept
            </button>
            <button
              type="button"
              className={donorDangerBtnClass}
              disabled={busy}
              onClick={() => void declineBooking(b.id)}
            >
              Decline
            </button>
            <button
              type="button"
              className={donorGhostBtnClass}
              onClick={() => setReportBookingId(b.id)}
            >
              Report issue
            </button>
          </div>
        );
      } else if (tab === "confirmed" && b.status === "accepted") {
        actionsSlot = (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="text-xs text-emerald-700 dark:text-emerald-400">
              {b.meetingCode ? `Code: ${b.meetingCode}` : "Accepted"}
            </span>
            <button
              type="button"
              className={donorGhostBtnClass}
              onClick={() => setReportBookingId(b.id)}
            >
              Report issue
            </button>
          </div>
        );
      } else {
        actionsSlot = (
          <button
            type="button"
            className={donorGhostBtnClass}
            onClick={() => setReportBookingId(b.id)}
          >
            Report issue
          </button>
        );
      }

      return {
        id: b.id,
        dateCol,
        title,
        subtitle,
        pillLabel: pill.label,
        pillVariant: pill.variant,
        reported: (b.reportsCount ?? 0) > 0,
        avatarUrl: b.requesterProfileImage ?? undefined,
        actionsSlot,
        highlight: Boolean(highlightBookingId && b.id === highlightBookingId),
      };
    };

    const byTab = (t: DonorPanelKey) =>
      bookings
        .filter((b) => donorTabForBooking(b) === t)
        .map((b) => mapRow(b, t));

    return {
      pending: {
        summarySections: [],
        mainListTitle: "Open",
        columnLabels: ["Scheduled", "Booking", "Status"],
        rows: byTab("pending"),
        actionsColumnLabel: "Actions",
        tableEmptyMessage: "You're all caught up.",
      },
      confirmed: {
        summarySections: [],
        mainListTitle: "Confirmed",
        columnLabels: ["Scheduled", "Booking", "Status"],
        rows: byTab("confirmed"),
        actionsColumnLabel: "Details",
        tableEmptyMessage: "Nothing confirmed yet.",
      },
      past: {
        summarySections: [],
        mainListTitle: "Past",
        columnLabels: ["Date", "Booking", "Outcome"],
        rows: byTab("past"),
        actionsColumnLabel: "Record",
        tableEmptyMessage: "No past bookings.",
      },
    };
  }, [
    bookings,
    hospitalLabel,
    highlightBookingId,
    mutatingId,
    acceptBooking,
    declineBooking,
  ]);

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
