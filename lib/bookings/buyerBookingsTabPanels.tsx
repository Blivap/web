import type { ReactNode } from "react";
import { Bell, Flag, Send, Star, Undo2, Video, X } from "lucide-react";
import { bookingNeedsRequesterRating } from "@/lib/ratings/ratedBookingsStorage";
import type {
  BookingsShellRow,
  BookingsTabPanel,
} from "@/app/(users)/bookings/components/bookings-shell.view";
import {
  BookingIconActions,
  BookingIconButton,
} from "@/app/(users)/bookings/components/booking-icon-button.component";
import {
  bookingRowDetailPartsForViewer,
  formatScheduledShort,
  statusToPill,
} from "@/lib/bookings/formatBookingDisplay";
import type { Booking } from "@/types/bookings";
import type { IUser } from "@/types";

export type BuyerPanelKey = "sent" | "confirmed" | "past";

export const BUYER_TAB_ORDER: readonly BuyerPanelKey[] = [
  "sent",
  "confirmed",
  "past",
];

const sentPanelBanner = (
  <div className="flex flex-col items-start gap-3 rounded-lg border border-primary/25 bg-primary/6 px-3 py-2.5 sm:flex-row sm:items-center dark:border-primary/35 dark:bg-primary/10">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary dark:bg-primary/20">
      <Send className="size-4" aria-hidden />
    </div>
    <p className="min-w-0 text-xs text-text-secondary sm:text-sm">
      <span className="font-medium text-text-primary">Sent</span>
      {" · "}
      Requests you have made and their status.
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
  openRatingForBooking: (id: string) => void;
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
    openRatingForBooking,
  } = input;

  const mapRow = (b: Booking, ctx: BuyerPanelKey): BookingsShellRow => {
    const pill = statusToPill(b.status);
    const parts = bookingRowDetailPartsForViewer(
      b,
      "requester",
      hospitalLabel(b.hospitalId),
    );
    const ninOk = user?.nationalIdentificationNumberVerified === true;

    let actionsSlot: ReactNode;

    const pendingActions = () => {
      const busyWithdraw = mutatingId === b.id;
      const busyRemind = remindingId === b.id;
      const busy = busyWithdraw || busyRemind;
      return (
        <BookingIconActions>
          <BookingIconButton
            label={busyWithdraw ? "Withdrawing…" : "Withdraw request"}
            icon={<Undo2 className="size-4" />}
            variant="default"
            disabled={busy}
            onClick={() => withdrawBooking(b.id)}
          />
          <BookingIconButton
            label={busyRemind ? "Sending reminder…" : "Remind donor"}
            icon={<Bell className="size-4" />}
            variant="primary"
            disabled={busy}
            onClick={() => remindDonor(b.id)}
          />
          <BookingIconButton
            label="Report issue"
            icon={<Flag className="size-3.5" />}
            variant="ghost"
            disabled={busy}
            onClick={() => setReportBookingId(b.id)}
          />
        </BookingIconActions>
      );
    };

    const confirmedActions = () => {
      const busy = mutatingId === b.id;
      return (
        <BookingIconActions hint={!ninOk ? "Verify NIN for meetup" : undefined}>
          <BookingIconButton
            label="Open meetup"
            icon={<Video className="size-4" />}
            variant="primary"
            disabled={!ninOk}
            href={
              ninOk
                ? `/bookings/meetup?bookingId=${encodeURIComponent(b.id)}`
                : undefined
            }
          />
          <BookingIconButton
            label={busy ? "Cancelling…" : "Cancel booking"}
            icon={<X className="size-4" strokeWidth={2.5} />}
            variant="danger"
            disabled={busy}
            onClick={() => withdrawBooking(b.id)}
          />
          <BookingIconButton
            label="Report issue"
            icon={<Flag className="size-3.5" />}
            variant="ghost"
            disabled={busy}
            onClick={() => setReportBookingId(b.id)}
          />
        </BookingIconActions>
      );
    };

    const reportOnly = () => (
      <BookingIconActions>
        <BookingIconButton
          label="Report issue"
          icon={<Flag className="size-3.5" />}
          variant="ghost"
          onClick={() => setReportBookingId(b.id)}
        />
      </BookingIconActions>
    );

    const pastActions = () => {
      const canRate =
        b.status === "completed" && bookingNeedsRequesterRating(b);
      return (
        <BookingIconActions>
          {canRate ? (
            <BookingIconButton
              label="Rate donor"
              icon={<Star className="size-4" />}
              variant="primary"
              onClick={() => openRatingForBooking(b.id)}
            />
          ) : null}
          <BookingIconButton
            label="Report issue"
            icon={<Flag className="size-3.5" />}
            variant="ghost"
            onClick={() => setReportBookingId(b.id)}
          />
        </BookingIconActions>
      );
    };

    if (ctx === "sent") {
      if (b.status === "pending") actionsSlot = pendingActions();
      else if (b.status === "accepted") actionsSlot = confirmedActions();
      else if (b.status === "completed" && bookingNeedsRequesterRating(b)) {
        actionsSlot = pastActions();
      } else actionsSlot = reportOnly();
    } else if (ctx === "confirmed" && b.status === "accepted") {
      actionsSlot = confirmedActions();
    } else if (ctx === "past" && b.status === "completed") {
      actionsSlot = pastActions();
    } else {
      actionsSlot = reportOnly();
    }

    return {
      id: b.id,
      dateCol: formatScheduledShort(b.scheduledAt),
      title: parts.who,
      subtitle: parts.hospital,
      pillLabel: pill.label,
      pillVariant: pill.variant,
      reported: (b.reportsCount ?? 0) > 0,
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

  const columns = ["When", "Donor", "Status"] as const;

  return {
    sent: {
      panelBanner: sentPanelBanner,
      bannerInListCard: true,
      summarySections: [],
      mainListTitle: "Sent",
      columnLabels: columns,
      rows: rowsSent(),
      actionsColumnLabel: "Actions",
      tableEmptyMessage: "No outbound requests yet.",
    },
    confirmed: {
      summarySections: [],
      mainListTitle: "Confirmed",
      columnLabels: columns,
      rows: rowsFor("confirmed"),
      actionsColumnLabel: "Actions",
      tableEmptyMessage: "No confirmed bookings yet.",
    },
    past: {
      summarySections: [],
      mainListTitle: "Past",
      columnLabels: columns,
      rows: rowsFor("past"),
      actionsColumnLabel: "Actions",
      tableEmptyMessage: "No past bookings.",
    },
  };
}
