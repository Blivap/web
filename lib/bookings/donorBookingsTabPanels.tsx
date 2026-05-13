import type { ReactNode } from "react";
import Link from "next/link";
import type { BookingsShellRow, BookingsTabPanel } from "@/app/(users)/bookings/components/bookings-shell.view";
import { stashMeetupCodeFromBookingRow } from "@/lib/meetups/meetupSessionStorageKeys";
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
import type { IUser } from "@/types";

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

export type DonorBookingsTabPanelsInput = {
  bookings: Booking[];
  hospitalLabel: (hospitalId: string) => string;
  user: IUser | null;
  highlightBookingId: string;
  mutatingId: string | null;
  acceptBooking: (id: string) => void;
  declineBooking: (id: string) => void;
  setReportBookingId: (id: string | null) => void;
};

export function buildDonorBookingsTabPanels(
  input: DonorBookingsTabPanelsInput,
): Record<DonorPanelKey, BookingsTabPanel> {
  const {
    bookings,
    hospitalLabel,
    user,
    highlightBookingId,
    mutatingId,
    acceptBooking,
    declineBooking,
    setReportBookingId,
  } = input;

  const mapRow = (b: Booking, tab: DonorPanelKey): BookingsShellRow => {
    const pill = statusToPill(b.status);
    const title = bookingTitleForViewer(b, "donor");
    const subtitle = bookingSubtitleDonor(b, hospitalLabel(b.hospitalId));
    const dateCol = formatScheduledLabel(b.scheduledAt);

    let actionsSlot: ReactNode;

    if (tab === "pending" && b.status === "pending") {
      const busy = mutatingId === b.id;
      const ninOk = user?.nationalIdentificationNumberVerified === true;
      actionsSlot = (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            className={donorActionBtnClass}
            disabled={busy || !ninOk}
            onClick={() => acceptBooking(b.id)}
          >
            Accept
          </button>
          <button
            type="button"
            className={donorDangerBtnClass}
            disabled={busy}
            onClick={() => declineBooking(b.id)}
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
          {!ninOk ? (
            <span className="text-xs text-amber-800 dark:text-amber-300">
              Verify your NIN before you can accept.
            </span>
          ) : null}
        </div>
      );
    } else if (tab === "confirmed" && b.status === "accepted") {
      const ninOk = user?.nationalIdentificationNumberVerified === true;
      actionsSlot = (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-xs text-emerald-700 dark:text-emerald-400">
            {b.meetingCode ? `Code: ${b.meetingCode}` : "Accepted"}
          </span>
          {ninOk ? (
            <Link
              href={`/bookings/meetup?bookingId=${encodeURIComponent(b.id)}`}
              className={donorActionBtnClass}
              onClick={() =>
                stashMeetupCodeFromBookingRow(b.id, b.meetingCode)
              }
            >
              Open meetup
            </Link>
          ) : (
            <span className="text-xs text-amber-800 dark:text-amber-300">
              Verify your NIN to open the meetup room.
            </span>
          )}
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
}
