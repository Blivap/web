"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { $api } from "@/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import {
  BookingsShell,
  type BookingsShellRow,
  type BookingsShellTabPanels,
} from "./bookings-shell.view";
import { useAppSelector } from "@/store/hooks";
import { parseBookingsMineResponse } from "@/lib/bookings/parseBookingsMineResponse";
import { parseHospitalsListResponse } from "@/lib/hospitals/parseHospitalsListResponse";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  bookingSubtitleRequester,
  bookingTitleForViewer,
  formatScheduledLabel,
  statusToPill,
} from "@/lib/bookings/formatBookingDisplay";
import type { Booking } from "@/types/bookings";

type RequesterTab = "active" | "referrals" | "archived";

const btnSecondary =
  "rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/6";
const btnGhost =
  "rounded-md px-2.5 py-1.5 text-xs font-medium text-[#6B7280] underline-offset-2 hover:text-primary hover:underline";

function tabForBooking(b: Booking): RequesterTab {
  if (b.status === "pending" || b.status === "accepted") return "active";
  return "archived";
}

export function BuyerBookingsView() {
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

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadState("loading");
    setLoadError(null);
    try {
      const [mineRes, hospRes] = await Promise.all([
        $api.bookings.mine(),
        $api.hospitals.list(),
      ]);

      if (mineRes.status < 200 || mineRes.status >= 300 || mineRes.data === undefined) {
        setBookings([]);
        setLoadState("error");
        setLoadError("Could not load bookings.");
        return;
      }
      const parsed = parseBookingsMineResponse(mineRes.data);
      const mine = parsed.filter((b) => b.requesterId === user.id);
      setBookings(mine);

      if (hospRes.status >= 200 && hospRes.status < 300 && hospRes.data !== undefined) {
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

  useEffect(() => {
    if (!highlightBookingId || loadState !== "ok") return;
    const t = window.setTimeout(() => {
      document
        .getElementById(`booking-row-${highlightBookingId}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 300);
    return () => window.clearTimeout(t);
  }, [highlightBookingId, loadState, bookings]);

  const hospitalLabel = useCallback(
    (hospitalId: string) => hospitalNames[hospitalId] ?? `Hospital ${hospitalId.slice(0, 8)}…`,
    [hospitalNames],
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      setMutatingId(id);
      try {
        const { status } = await $api.bookings.cancel(id);
        if (status < 200 || status >= 300) {
          showSnackbar("Could not cancel this booking.");
          return;
        }
        showSnackbar("This booking was cancelled.");
        await loadData();
      } catch (e) {
        showSnackbar(
          getAxiosErrorMessage(
            e,
            "Could not cancel this booking. Please try again.",
          ),
        );
      } finally {
        setMutatingId(null);
      }
    },
    [loadData, showSnackbar],
  );

  const tabPanels = useMemo((): BookingsShellTabPanels => {
    const activeBookings = bookings.filter(
      (b) => b.status === "pending" || b.status === "accepted",
    );
    const newOffers = activeBookings.filter((b) => b.status === "pending")
      .length;
    const followUps = activeBookings.filter((b) => b.status === "accepted")
      .length;

    const mapRow = (b: Booking, tab: RequesterTab): BookingsShellRow => {
      const pill = statusToPill(b.status);
      const title = bookingTitleForViewer(b, "requester");
      const subtitle = bookingSubtitleRequester(b, hospitalLabel(b.hospitalId));
      const dateCol = formatScheduledLabel(b.scheduledAt);

      let actionsSlot: ReactNode;

      if (tab === "active") {
        const canCancel =
          b.status === "pending" || b.status === "accepted";
        const busy = mutatingId === b.id;
        actionsSlot = (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className={btnSecondary}
              disabled={!canCancel || busy}
              onClick={() => void cancelBooking(b.id)}
            >
              Cancel booking
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() =>
                showSnackbar(
                  "Thanks — we’ve logged your report for the trust & safety team.",
                )
              }
            >
              Report issue
            </button>
          </div>
        );
      } else if (tab === "referrals") {
        actionsSlot = <span className="text-xs text-[#9CA3AF]">—</span>;
      } else {
        actionsSlot = (
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              showSnackbar(
                "Request history export will be available from your account.",
              )
            }
          >
            View details
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
        actionsSlot,
        highlight: Boolean(highlightBookingId && b.id === highlightBookingId),
      };
    };

    const rowsFor = (t: RequesterTab) =>
      bookings
        .filter((b) => tabForBooking(b) === t)
        .map((b) => mapRow(b, t));

    const archivedCount = bookings.filter(
      (b) => b.status !== "pending" && b.status !== "accepted",
    ).length;

    return {
      active: {
        summarySections: [
          {
            title: `New donation offers (${newOffers})`,
            description:
              "Facilities or programs proposing slots — respond before the window closes.",
          },
          {
            title: `Follow-ups (${followUps})`,
            description:
              "Confirm timing, location, or upload any documents the facility asked for.",
          },
        ],
        mainListTitle: "Requests & bookings in progress",
        columnLabels: ["Requested", "Request / booking", "Status"],
        rows: rowsFor("active"),
        actionsColumnLabel: "Actions",
        tableEmptyMessage: "No open requests or bookings.",
      },
      referrals: {
        summarySections: [
          {
            title: "Donors you referred (0)",
            description:
              "People who joined Blivap through your link or invite.",
          },
          {
            title: "Referral milestones (0)",
            description:
              "Credits or benefits may apply when referrals complete verification or a first donation.",
          },
        ],
        mainListTitle: "Referrals",
        columnLabels: ["Started", "Referral", "Status"],
        rows: [],
        actionsColumnLabel: "Actions",
        tableEmptyMessage: "You haven’t referred anyone yet.",
      },
      archived: {
        summarySections: [
          {
            title: `Past requests (${archivedCount})`,
            description:
              "Completed donations, cancelled bookings, or requests that could not be matched.",
          },
          {
            title: "Draft requests (0)",
            description:
              "Incomplete requests you can finish and send later.",
          },
        ],
        mainListTitle: "Past requests & bookings",
        columnLabels: ["Date", "Request / booking", "Outcome"],
        rows: rowsFor("archived"),
        actionsColumnLabel: "Record",
        tableEmptyMessage: "Nothing in your archive yet.",
      },
    };
  }, [
    bookings,
    cancelBooking,
    highlightBookingId,
    mutatingId,
    showSnackbar,
    hospitalLabel,
  ]);

  if (!user?.id) {
    return (
      <p className="text-sm text-text-secondary">
        Sign in to see your bookings.
      </p>
    );
  }

  if (loadState === "loading") {
    return (
      <div className="flex min-h-[200px] items-center justify-center gap-2 text-sm text-text-secondary">
        <Loader2 className="size-5 animate-spin text-primary" />
        Loading bookings…
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-[#1a1a22]">
        <p className="text-sm font-medium text-text-primary">
          {loadError ?? "Something went wrong."}
        </p>
        <button
          type="button"
          onClick={() => void loadData()}
          className="mt-3 text-xs font-medium text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <BookingsShell
      tabPanels={tabPanels}
      tabLabels={{
        active: "Requests & bookings",
        referrals: "Referrals",
        archived: "Past activity",
      }}
    />
  );
}
