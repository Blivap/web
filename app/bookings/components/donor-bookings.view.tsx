"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import {
  BookingsShell,
  type BookingsShellRow,
  type BookingsShellTabPanels,
} from "./bookings-shell.view";
import type { BookingPillVariant } from "./booking-status-pill";

type DonorTab = "active" | "referrals" | "archived";

type DonorBookingEntity = {
  id: string;
  tab: DonorTab;
  date: string;
  appointmentTitle: string;
  facility: string;
  detailLine: string;
  /** Base status before user actions */
  baseStatus: "action_needed" | "confirmed" | "scheduled_intro" | "completed" | "declined" | "expired";
  needsConfirmation: boolean;
};

const DONOR_ENTITIES: DonorBookingEntity[] = [
  {
    id: "d-a1",
    tab: "active",
    date: "Apr 18, 2026",
    appointmentTitle: "Follow-up whole blood",
    facility: "Lagos Regional Hospital",
    detailLine: "Proposed slot: Tue · 2:30 PM · Est. 45 min",
    baseStatus: "action_needed",
    needsConfirmation: true,
  },
  {
    id: "d-a2",
    tab: "active",
    date: "Apr 22, 2026",
    appointmentTitle: "Platelet donation",
    facility: "Blivap Partner Lab",
    detailLine: "Facility requests confirmation by Apr 10",
    baseStatus: "action_needed",
    needsConfirmation: true,
  },
  {
    id: "d-a3",
    tab: "active",
    date: "Apr 2, 2026",
    appointmentTitle: "Whole blood donation",
    facility: "City Medical Center",
    detailLine: "Morning slot · 9:00 AM · Check-in opens 8:30",
    baseStatus: "confirmed",
    needsConfirmation: false,
  },
  {
    id: "d-r1",
    tab: "referrals",
    date: "Mar 28, 2026",
    appointmentTitle: "Intro: Regional plasma program",
    facility: "Referred by City Medical Center",
    detailLine: "Partner lab: Northside Collection Site",
    baseStatus: "scheduled_intro",
    needsConfirmation: false,
  },
  {
    id: "d-r2",
    tab: "referrals",
    date: "Mar 15, 2026",
    appointmentTitle: "Specialist screening pathway",
    facility: "Referred by Blivap care team",
    detailLine: "Next step: upload travel history form",
    baseStatus: "scheduled_intro",
    needsConfirmation: false,
  },
  {
    id: "d-z1",
    tab: "archived",
    date: "Mar 12, 2026",
    appointmentTitle: "Platelet appointment",
    facility: "Blivap Partner Lab",
    detailLine: "Completed · Thank you for donating",
    baseStatus: "completed",
    needsConfirmation: false,
  },
  {
    id: "d-z2",
    tab: "archived",
    date: "Feb 3, 2026",
    appointmentTitle: "Screening visit",
    facility: "City Medical Center",
    detailLine: "You declined this proposed date",
    baseStatus: "declined",
    needsConfirmation: false,
  },
  {
    id: "d-z3",
    tab: "archived",
    date: "Jan 8, 2026",
    appointmentTitle: "Whole blood — pop-up drive",
    facility: "Community Drive (Ikeja)",
    detailLine: "Booking expired — no response in 7 days",
    baseStatus: "expired",
    needsConfirmation: false,
  },
];

function basePill(
  e: DonorBookingEntity,
): { label: string; variant: BookingPillVariant } {
  switch (e.baseStatus) {
    case "action_needed":
      return { label: "Action needed", variant: "pending" };
    case "confirmed":
      return { label: "Confirmed", variant: "accepted" };
    case "scheduled_intro":
      return { label: "Intro scheduled", variant: "profile" };
    case "completed":
      return { label: "Completed", variant: "accepted" };
    case "declined":
      return { label: "Declined", variant: "rejected" };
    case "expired":
      return { label: "Expired", variant: "rejected" };
    default:
      return { label: "—", variant: "profile" };
  }
}

const actionBtnClass =
  "rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/[0.06]";
const dangerBtnClass =
  "rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50";
const ghostBtnClass =
  "rounded-md px-2.5 py-1.5 text-xs font-medium text-[#6B7280] underline-offset-2 hover:text-primary hover:underline";

export function DonorBookingsView() {
  const { showSnackbar } = useSnackbar();
  const [responseById, setResponseById] = useState<
    Record<string, "accepted" | "declined">
  >({});
  const [reportedIds, setReportedIds] = useState<Set<string>>(() => new Set());

  const accept = useCallback((id: string) => {
    setResponseById((prev) => ({ ...prev, [id]: "accepted" }));
    showSnackbar("You accepted this appointment. The facility has been notified.");
  }, [showSnackbar]);

  const decline = useCallback((id: string) => {
    setResponseById((prev) => ({ ...prev, [id]: "declined" }));
    showSnackbar("You declined this booking. The slot may be offered to others.");
  }, [showSnackbar]);

  const report = useCallback(
    (id: string) => {
      setReportedIds((prev) => new Set(prev).add(id));
      showSnackbar(
        "Thanks — we’ve logged your report. Our team may follow up if needed.",
      );
    },
    [showSnackbar],
  );

  const tabPanels = useMemo((): BookingsShellTabPanels => {
    const pendingCount = DONOR_ENTITIES.filter(
      (e) =>
        e.tab === "active" &&
        e.needsConfirmation &&
        responseById[e.id] === undefined,
    ).length;

    const mapEntityToRow = (
      e: DonorBookingEntity,
      tab: DonorTab,
    ): BookingsShellRow => {
      const response = responseById[e.id];
      let pillLabel: string;
      let pillVariant: BookingPillVariant;

      if (e.needsConfirmation && response === "accepted") {
        pillLabel = "Accepted";
        pillVariant = "accepted";
      } else if (e.needsConfirmation && response === "declined") {
        pillLabel = "Declined";
        pillVariant = "rejected";
      } else {
        const b = basePill(e);
        pillLabel = b.label;
        pillVariant = b.variant;
      }

      let actionsSlot: ReactNode;
      if (tab === "active" && e.needsConfirmation) {
        if (response === "accepted") {
          actionsSlot = (
            <span className="text-xs text-emerald-700">Confirmed — see email for details.</span>
          );
        } else if (response === "declined") {
          actionsSlot = (
            <span className="text-xs text-[#6B7280]">Declined</span>
          );
        } else {
          actionsSlot = (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                className={actionBtnClass}
                onClick={() => accept(e.id)}
              >
                Accept
              </button>
              <button
                type="button"
                className={dangerBtnClass}
                onClick={() => decline(e.id)}
              >
                Decline
              </button>
              <button
                type="button"
                className={ghostBtnClass}
                onClick={() => report(e.id)}
                disabled={reportedIds.has(e.id)}
              >
                {reportedIds.has(e.id) ? "Report submitted" : "Report issue"}
              </button>
            </div>
          );
        }
      } else if (tab === "active" && !e.needsConfirmation) {
        actionsSlot = (
          <span className="text-xs text-[#6B7280]">
            No action required before visit.
          </span>
        );
      } else if (tab === "referrals") {
        actionsSlot = (
          <button
            type="button"
            className={actionBtnClass}
            onClick={() =>
              showSnackbar("Opening referral details will be available soon.")
            }
          >
            View details
          </button>
        );
      } else if (tab === "archived" && e.baseStatus === "completed") {
        actionsSlot = (
          <button
            type="button"
            className={ghostBtnClass}
            onClick={() =>
              showSnackbar("Visit summary will be available from your history export.")
            }
          >
            Visit summary
          </button>
        );
      } else {
        actionsSlot = <span className="text-xs text-[#9CA3AF]">—</span>;
      }

      return {
        id: e.id,
        dateCol: e.date,
        title: e.appointmentTitle,
        subtitle: `At: ${e.facility} · ${e.detailLine}`,
        pillLabel,
        pillVariant,
        actionsSlot,
      };
    };

    const byTab = (t: DonorTab) =>
      DONOR_ENTITIES.filter((e) => e.tab === t).map((e) =>
        mapEntityToRow(e, t),
      );

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
            title: `Partner referrals (${DONOR_ENTITIES.filter((e) => e.tab === "referrals").length})`,
            description:
              "Introductions from facilities or Blivap to additional programs and sites.",
          },
          {
            title: `Cross-facility matches (0)`,
            description:
              "When another site needs your blood type, matches will appear here.",
          },
        ],
        mainListTitle: "Referrals & introductions",
        columnLabels: ["Started", "Referral", "Progress"],
        rows: byTab("referrals"),
        actionsColumnLabel: "Next step",
        tableEmptyMessage: "No referrals yet — your matches will show here.",
      },
      archived: {
        summarySections: [
          {
            title: `Completed visits (${DONOR_ENTITIES.filter((e) => e.tab === "archived" && e.baseStatus === "completed").length})`,
            description: "Past donations that were completed successfully.",
          },
          {
            title: `Declined or expired (${DONOR_ENTITIES.filter((e) => e.tab === "archived" && e.baseStatus !== "completed").length})`,
            description:
              "Bookings you declined or that timed out without a response.",
          },
        ],
        mainListTitle: "Past activity",
        columnLabels: ["Date", "Appointment", "Outcome"],
        rows: byTab("archived"),
        actionsColumnLabel: "Record",
        tableEmptyMessage: "No archived bookings yet.",
      },
    };
  }, [accept, decline, report, reportedIds, responseById, showSnackbar]);

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
