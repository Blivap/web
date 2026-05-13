import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Send } from "lucide-react";
import type { BookingsShellRow, BookingsTabPanel } from "@/app/(users)/bookings/components/bookings-shell.view";
import { stashMeetupCodeFromBookingRow } from "@/lib/meetups/meetupSessionStorageKeys";
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
import type { IUser } from "@/types";

export type BuyerPanelKey = "sent" | "confirmed" | "past";

export const BUYER_TAB_ORDER: readonly BuyerPanelKey[] = [
  "sent",
  "confirmed",
  "past",
];

const sentPanelBanner = (
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
);

export type BuyerBookingsTabPanelsInput = {
  bookings: Booking[];
  hospitalLabel: (hospitalId: string) => string;
  user: IUser | null;
  highlightBookingId: string;
  mutatingId: string | null;
  remindingId: string | null;
  withdrawBooking: (id: string) => void;
  remindDonor: (id: string) => void;
  setReportBookingId: (id: string | null) => void;
};

export function buildBuyerBookingsTabPanels(
  input: BuyerBookingsTabPanelsInput,
): Record<BuyerPanelKey, BookingsTabPanel> {
  const {
    bookings,
    hospitalLabel,
    user,
    highlightBookingId,
    mutatingId,
    remindingId,
    withdrawBooking,
    remindDonor,
    setReportBookingId,
  } = input;

  const mapRow = (b: Booking, ctx: BuyerPanelKey): BookingsShellRow => {
    const pill = statusToPill(b.status);
    const title = bookingTitleForViewer(b, "requester");
    const subtitle = bookingSubtitleRequester(b, hospitalLabel(b.hospitalId));
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
            onClick={() => withdrawBooking(b.id)}
          >
            {busyWithdraw ? "Withdrawing…" : "Withdraw"}
          </button>
          <button
            type="button"
            className={buyerBtnReminder}
            disabled={busyWithdraw || busyRemind}
            onClick={() => remindDonor(b.id)}
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
      const ninOk = user?.nationalIdentificationNumberVerified === true;
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {ninOk ? (
            <Link
              href={`/bookings/meetup?bookingId=${encodeURIComponent(b.id)}`}
              className={buyerBtnSecondary}
              onClick={() => stashMeetupCodeFromBookingRow(b.id, b.meetingCode)}
            >
              Meetup room
            </Link>
          ) : (
            <span className="text-xs text-amber-800 dark:text-amber-300">
              Verify your NIN to open the meetup room.
            </span>
          )}
          <button
            type="button"
            className={buyerBtnSecondary}
            disabled={busy}
            onClick={() => withdrawBooking(b.id)}
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
      .filter((b) => {
        if (t === "confirmed") return b.status === "accepted";
        return b.status !== "pending" && b.status !== "accepted";
      })
      .map((b) => mapRow(b, t));

  const rowsSent = () => bookings.map((b) => mapRow(b, "sent"));

  return {
    sent: {
      panelBanner: sentPanelBanner,
      bannerInListCard: true,
      summarySections: [],
      mainListTitle: "Sent",
      columnLabels: ["Scheduled", "Booking", "Status"],
      rows: rowsSent(),
      actionsColumnLabel: "Actions",
      tableEmptyMessage: "No outbound requests yet.",
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
}
