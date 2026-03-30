"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import {
  BookingsShell,
  type BookingsShellRow,
  type BookingsShellTabPanels,
} from "./bookings-shell.view";
import type { BookingPillVariant } from "./booking-status-pill";

/** Non-donor: manages incoming donation/booking requests, referrals, and history. */
type RequesterTab = "active" | "referrals" | "archived";

type RequesterEntity = {
  id: string;
  tab: RequesterTab;
  date: string;
  title: string;
  subtitle: string;
  pillLabel: string;
  pillVariant: BookingPillVariant;
};

const REQUESTER_ENTITIES: RequesterEntity[] = [
  {
    id: "r-a1",
    tab: "active",
    date: "Mar 28, 2026",
    title: "Whole blood — O+ · urgent window",
    subtitle:
      "Request from: City Medical Center · Estimated collection within 48h",
    pillLabel: "Awaiting you",
    pillVariant: "pending",
  },
  {
    id: "r-a2",
    tab: "active",
    date: "Mar 22, 2026",
    title: "Home visit — donor screening & sample",
    subtitle: "Request from: Lagos Regional Hospital · Proposed Tue morning",
    pillLabel: "Facility confirming",
    pillVariant: "profile",
  },
  {
    id: "r-a3",
    tab: "active",
    date: "Mar 18, 2026",
    title: "Matched donor program — follow-up booking",
    subtitle: "Via Blivap matching · Platelet appointment",
    pillLabel: "Scheduled",
    pillVariant: "accepted",
  },
  {
    id: "r-ref1",
    tab: "referrals",
    date: "Feb 10, 2026",
    title: "Family member joined as donor",
    subtitle: "You referred them · Blood donation · Profile verified",
    pillLabel: "Active donor",
    pillVariant: "accepted",
  },
  {
    id: "r-ref2",
    tab: "referrals",
    date: "Jan 4, 2026",
    title: "Friend registered — first visit pending",
    subtitle: "You referred them · Sperm donation program",
    pillLabel: "Onboarding",
    pillVariant: "pending",
  },
  {
    id: "r-z1",
    tab: "archived",
    date: "Dec 2, 2025",
    title: "Blood unit request — general ward",
    subtitle: "Request closed · No matching slot in time window",
    pillLabel: "Unfulfilled",
    pillVariant: "rejected",
  },
  {
    id: "r-z2",
    tab: "archived",
    date: "Nov 8, 2025",
    title: "Donation booking — pop-up drive",
    subtitle: "You cancelled this request before confirmation",
    pillLabel: "Cancelled",
    pillVariant: "profile",
  },
  {
    id: "r-z3",
    tab: "archived",
    date: "Oct 14, 2025",
    title: "Scheduled donation — completed",
    subtitle: "Facility confirmed receipt · Thank-you note sent",
    pillLabel: "Completed",
    pillVariant: "accepted",
  },
];

const btnSecondary =
  "rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/6";
const btnGhost =
  "rounded-md px-2.5 py-1.5 text-xs font-medium text-[#6B7280] underline-offset-2 hover:text-primary hover:underline";

export function BuyerBookingsView() {
  const { showSnackbar } = useSnackbar();
  const [cancelledRequestIds, setCancelledRequestIds] = useState<Set<string>>(
    () => new Set(),
  );

  const cancelRequest = useCallback(
    (id: string) => {
      setCancelledRequestIds((prev) => new Set(prev).add(id));
      showSnackbar("This request was cancelled.");
    },
    [showSnackbar],
  );

  const tabPanels = useMemo((): BookingsShellTabPanels => {
    const newOffers = 1;
    const followUps = 1;

    const mapRow = (
      e: RequesterEntity,
      tab: RequesterTab,
    ): BookingsShellRow => {
      let actionsSlot: ReactNode;

      if (cancelledRequestIds.has(e.id)) {
        return {
          id: e.id,
          dateCol: e.date,
          title: e.title,
          subtitle: e.subtitle,
          pillLabel: "Cancelled",
          pillVariant: "profile",
          actionsSlot: (
            <span className="text-xs text-[#6B7280]">Cancelled</span>
          ),
        };
      }

      if (tab === "active") {
        actionsSlot = (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className={btnSecondary}
              onClick={() =>
                showSnackbar(
                  "Full request details will open here when connected to your account.",
                )
              }
            >
              View request
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => cancelRequest(e.id)}
            >
              Cancel request
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
        actionsSlot = (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className={btnSecondary}
              onClick={() =>
                showSnackbar(
                  "Referral progress will sync with your wallet and notifications.",
                )
              }
            >
              View status
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() =>
                showSnackbar(
                  "A gentle reminder will be sent when messaging is enabled.",
                )
              }
            >
              Remind contact
            </button>
          </div>
        );
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
        id: e.id,
        dateCol: e.date,
        title: e.title,
        subtitle: e.subtitle,
        pillLabel: e.pillLabel,
        pillVariant: e.pillVariant,
        actionsSlot,
      };
    };

    const rowsFor = (t: RequesterTab) =>
      REQUESTER_ENTITIES.filter((e) => e.tab === t).map((e) => mapRow(e, t));

    const referralCount = REQUESTER_ENTITIES.filter(
      (e) => e.tab === "referrals",
    ).length;
    const archivedCount = REQUESTER_ENTITIES.filter(
      (e) => e.tab === "archived",
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
            title: `Donors you referred (${referralCount})`,
            description:
              "People who joined Blivap through your link or invite.",
          },
          {
            title: `Referral milestones (0)`,
            description:
              "Credits or benefits may apply when referrals complete verification or a first donation.",
          },
        ],
        mainListTitle: "Referrals",
        columnLabels: ["Started", "Referral", "Status"],
        rows: rowsFor("referrals"),
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
            title: `Draft requests (0)`,
            description: "Incomplete requests you can finish and send later.",
          },
        ],
        mainListTitle: "Past requests & bookings",
        columnLabels: ["Date", "Request / booking", "Outcome"],
        rows: rowsFor("archived"),
        actionsColumnLabel: "Record",
        tableEmptyMessage: "Nothing in your archive yet.",
      },
    };
  }, [cancelRequest, cancelledRequestIds, showSnackbar]);

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
