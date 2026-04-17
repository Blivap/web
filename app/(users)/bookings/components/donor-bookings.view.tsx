"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { $api } from "@/app/api";
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
  bookingSubtitleDonor,
  bookingTitleForViewer,
  formatScheduledLabel,
  statusToPill,
} from "@/lib/bookings/formatBookingDisplay";
import type { Booking } from "@/types/bookings";

type DonorTab = "active" | "referrals" | "archived";

const actionBtnClass =
  "rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/6";
const dangerBtnClass =
  "rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50";
const ghostBtnClass =
  "rounded-md px-2.5 py-1.5 text-xs font-medium text-[#6B7280] underline-offset-2 hover:text-primary hover:underline";

function tabForBooking(b: Booking): DonorTab {
  if (b.status === "pending" || b.status === "accepted") return "active";
  return "archived";
}

export function DonorBookingsView() {
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

      if (
        mineRes.status < 200 ||
        mineRes.status >= 300 ||
        mineRes.data === undefined
      ) {
        setBookings([]);
        setLoadState("error");
        setLoadError("Could not load bookings.");
        return;
      }
      const parsed = parseBookingsMineResponse(mineRes.data);
      const mine = parsed.filter((b) => b.donorUserId === user.id);
      setBookings(mine);

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
    (hospitalId: string) =>
      hospitalNames[hospitalId] ?? `Hospital ${hospitalId.slice(0, 8)}…`,
    [hospitalNames],
  );

  const respond = useCallback(
    async (id: string, accept: boolean) => {
      setMutatingId(id);
      try {
        const { status } = await $api.bookings.respond(id, { accept });
        if (status < 200 || status >= 300) {
          showSnackbar("Could not update this booking.");
          return;
        }
        showSnackbar(
          accept
            ? "You accepted this booking. You can share the meeting code when you meet."
            : "You declined this booking. The slot may be offered to others.",
        );
        await loadData();
      } catch (e) {
        showSnackbar(
          getAxiosErrorMessage(
            e,
            "Could not update this booking. Please try again.",
          ),
        );
      } finally {
        setMutatingId(null);
      }
    },
    [loadData, showSnackbar],
  );

  const report = useCallback(
    (id: string) => {
      void id;
      showSnackbar(
        "Thanks — we’ve logged your report. Our team may follow up if needed.",
      );
    },
    [showSnackbar],
  );

  const tabPanels = useMemo((): BookingsShellTabPanels => {
    const pendingCount = bookings.filter((b) => b.status === "pending").length;

    const mapRow = (b: Booking, tab: DonorTab): BookingsShellRow => {
      const pill = statusToPill(b.status);
      const title = bookingTitleForViewer(b, "donor");
      const subtitle = bookingSubtitleDonor(b, hospitalLabel(b.hospitalId));
      const dateCol = formatScheduledLabel(b.scheduledAt);

      let actionsSlot: ReactNode;

      if (tab === "active" && b.status === "pending") {
        const busy = mutatingId === b.id;
        actionsSlot = (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              className={actionBtnClass}
              disabled={busy}
              onClick={() => void respond(b.id, true)}
            >
              Accept
            </button>
            <button
              type="button"
              className={dangerBtnClass}
              disabled={busy}
              onClick={() => void respond(b.id, false)}
            >
              Decline
            </button>
            <button
              type="button"
              className={ghostBtnClass}
              onClick={() => report(b.id)}
            >
              Report issue
            </button>
          </div>
        );
      } else if (tab === "active" && b.status === "accepted") {
        actionsSlot = (
          <span className="text-xs text-emerald-700 dark:text-emerald-400">
            {b.meetingCode
              ? `Use meeting code ${b.meetingCode} when you meet in person.`
              : "Accepted — details in notifications."}
          </span>
        );
      } else if (tab === "referrals") {
        actionsSlot = <span className="text-xs text-[#9CA3AF]">—</span>;
      } else {
        actionsSlot = <span className="text-xs text-[#9CA3AF]">—</span>;
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

    const byTab = (t: DonorTab) =>
      bookings.filter((b) => tabForBooking(b) === t).map((b) => mapRow(b, t));

    return {
      active: {
        summarySections: [
          {
            title: `Pending your confirmation (${pendingCount})`,
            description:
              pendingCount === 0
                ? "No facilities are waiting on you right now."
                : "Review proposed times below. Accept to lock your slot, or decline to release it.",
          },
          {
            title: `Pre-donation steps (0)`,
            description:
              "You have no outstanding health questionnaires or ID checks before your next visit.",
          },
        ],
        mainListTitle: "Active appointments & requests",
        columnLabels: ["Initiated", "Appointment", "Status"],
        rows: byTab("active"),
        actionsColumnLabel: "Actions",
        tableEmptyMessage: "You have no active donation bookings.",
      },
      referrals: {
        summarySections: [
          {
            title: "Partner referrals (0)",
            description:
              "Introductions from facilities or Blivap to additional programs and sites.",
          },
          {
            title: "Cross-facility matches (0)",
            description:
              "When another site needs your blood type, matches will appear here.",
          },
        ],
        mainListTitle: "Referrals & introductions",
        columnLabels: ["Started", "Referral", "Progress"],
        rows: [],
        actionsColumnLabel: "Next step",
        tableEmptyMessage: "No referrals yet — your matches will show here.",
      },
      archived: {
        summarySections: [
          {
            title: `Completed visits (${bookings.filter((b) => b.status === "completed").length})`,
            description: "Past donations that were completed successfully.",
          },
          {
            title: `Declined or expired (${bookings.filter((b) => b.status === "rejected" || b.status === "cancelled" || b.status === "no_show").length})`,
            description:
              "Bookings you declined or that the requester cancelled.",
          },
        ],
        mainListTitle: "Past activity",
        columnLabels: ["Date", "Appointment", "Outcome"],
        rows: byTab("archived"),
        actionsColumnLabel: "Record",
        tableEmptyMessage: "No archived bookings yet.",
      },
    };
  }, [
    bookings,
    hospitalLabel,
    highlightBookingId,
    mutatingId,
    report,
    respond,
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
        active: "Upcoming & confirmations",
        referrals: "Partner referrals",
        archived: "Past visits",
      }}
    />
  );
}
