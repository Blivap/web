"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Send } from "lucide-react";
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
  bookingSubtitleRequester,
  bookingTitleForViewer,
  formatScheduledLabel,
  statusToPill,
} from "@/lib/bookings/formatBookingDisplay";
import {
  buyerBtnGhost,
  buyerBtnReminder,
  buyerBtnSecondary,
} from "@/lib/bookings/bookingsActionButtonClassNames";
import type { Booking } from "@/types/bookings";
import { useBookingDeepLinkHighlight } from "./useBookingDeepLinkHighlight.hook";

export type BuyerPanelKey = "sent" | "pending" | "confirmed" | "past";

export const BUYER_TAB_ORDER: readonly BuyerPanelKey[] = [
  "sent",
  "pending",
  "confirmed",
  "past",
];

export function buyerTabForBooking(
  b: Booking,
): Exclude<BuyerPanelKey, "sent"> {
  if (b.status === "pending") return "pending";
  if (b.status === "accepted") return "confirmed";
  return "past";
}

export function useBuyerBookings() {
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
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [reportBookingId, setReportBookingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadState("loading");
    setLoadError(null);
    try {
      const [listRes, hospRes] = await Promise.all([
        fetchAllBookingListPages((params) => $api.bookings.sent(params)),
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
        await loadData();
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
    [loadData, showSnackbar],
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
      } catch (e) {
        showSnackbar(
          getAxiosErrorMessage(
            e,
            "Reminder could not be sent. If this keeps happening, reminders may not be enabled on the server yet.",
          ),
        );
      } finally {
        setRemindingId(null);
      }
    },
    [showSnackbar],
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

  const sentBanner = useMemo(
    () => (
      <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/6 px-3 py-2.5 dark:border-primary/35 dark:bg-primary/10">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary dark:bg-primary/20">
          <Send className="size-4" aria-hidden />
        </div>
        <p className="text-xs text-text-secondary sm:text-sm">
          <span className="font-medium text-text-primary">Sent</span>
          {" · "}
          Every request you made, every status.
        </p>
      </div>
    ),
    [],
  );

  const tabPanels = useMemo((): Record<BuyerPanelKey, BookingsTabPanel> => {
    const mapRow = (b: Booking, ctx: BuyerPanelKey): BookingsShellRow => {
      const pill = statusToPill(b.status);
      const title = bookingTitleForViewer(b, "requester");
      const subtitle = bookingSubtitleRequester(
        b,
        hospitalLabel(b.hospitalId),
      );
      const dateCol = formatScheduledLabel(b.scheduledAt);
      const reported = (b.reportsCount ?? 0) > 0;

      let actionsSlot: ReactNode;

      const pendingActions = () => {
        const busyWithdraw = mutatingId === b.id;
        const busyRemind = remindingId === b.id;
        return (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className={buyerBtnSecondary}
              disabled={busyWithdraw || busyRemind}
              onClick={() => void withdrawBooking(b.id)}
            >
              {busyWithdraw ? "Withdrawing…" : "Withdraw"}
            </button>
            <button
              type="button"
              className={buyerBtnReminder}
              disabled={busyWithdraw || busyRemind}
              onClick={() => void remindDonor(b.id)}
            >
              <Bell className="size-3.5 shrink-0" aria-hidden />
              {busyRemind ? "Sending…" : "Send reminder"}
            </button>
            <button
              type="button"
              className={buyerBtnGhost}
              disabled={busyWithdraw || busyRemind}
              onClick={() => setReportBookingId(b.id)}
            >
              Report issue
            </button>
          </div>
        );
      };

      const confirmedActions = () => {
        const busy = mutatingId === b.id;
        return (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className={buyerBtnSecondary}
              disabled={busy}
              onClick={() => void withdrawBooking(b.id)}
            >
              {busy ? "Cancelling…" : "Cancel booking"}
            </button>
            <button
              type="button"
              className={buyerBtnGhost}
              disabled={busy}
              onClick={() => setReportBookingId(b.id)}
            >
              Report issue
            </button>
          </div>
        );
      };

      if (ctx === "sent") {
        if (b.status === "pending") actionsSlot = pendingActions();
        else if (b.status === "accepted") actionsSlot = confirmedActions();
        else
          actionsSlot = (
            <button
              type="button"
              className={buyerBtnGhost}
              onClick={() => setReportBookingId(b.id)}
            >
              Report issue
            </button>
          );
      } else if (ctx === "pending" && b.status === "pending") {
        actionsSlot = pendingActions();
      } else if (ctx === "confirmed" && b.status === "accepted") {
        actionsSlot = confirmedActions();
      } else {
        actionsSlot = (
          <button
            type="button"
            className={buyerBtnGhost}
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
        reported,
        avatarUrl: b.donorProfileImage ?? undefined,
        actionsSlot,
        highlight: Boolean(highlightBookingId && b.id === highlightBookingId),
      };
    };

    const rowsFor = (t: Exclude<BuyerPanelKey, "sent">) =>
      bookings
        .filter((b) => buyerTabForBooking(b) === t)
        .map((b) => mapRow(b, t));

    const rowsSent = () => bookings.map((b) => mapRow(b, "sent"));

    return {
      sent: {
        panelBanner: sentBanner,
        bannerInListCard: true,
        summarySections: [],
        mainListTitle: "Sent",
        columnLabels: ["Scheduled", "Booking", "Status"],
        rows: rowsSent(),
        actionsColumnLabel: "Actions",
        tableEmptyMessage: "No outbound requests yet.",
      },
      pending: {
        summarySections: [],
        mainListTitle: "Waiting",
        columnLabels: ["Scheduled", "Booking", "Status"],
        rows: rowsFor("pending"),
        actionsColumnLabel: "Actions",
        tableEmptyMessage: "Nothing pending.",
      },
      confirmed: {
        summarySections: [],
        mainListTitle: "Confirmed",
        columnLabels: ["Scheduled", "Booking", "Status"],
        rows: rowsFor("confirmed"),
        actionsColumnLabel: "Actions",
        tableEmptyMessage: "No confirmed bookings yet.",
      },
      past: {
        summarySections: [],
        mainListTitle: "Past",
        columnLabels: ["Date", "Booking", "Outcome"],
        rows: rowsFor("past"),
        actionsColumnLabel: "Record",
        tableEmptyMessage: "No past bookings.",
      },
    };
  }, [
    bookings,
    sentBanner,
    withdrawBooking,
    remindDonor,
    highlightBookingId,
    mutatingId,
    remindingId,
    hospitalLabel,
  ]);

  const tabLabels = useMemo(
    () =>
      ({
        sent: "Sent",
        pending: "Waiting",
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
