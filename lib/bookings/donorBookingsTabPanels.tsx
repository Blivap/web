import type { ReactNode } from "react";
import { Check, Flag, Video, X } from "lucide-react";
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
    const parts = bookingRowDetailPartsForViewer(
      b,
      "donor",
      hospitalLabel(b.hospitalId),
    );
    const ninOk = user?.nationalIdentificationNumberVerified === true;

    let actionsSlot: ReactNode;

    if (tab === "pending" && b.status === "pending") {
      const busy = mutatingId === b.id;
      actionsSlot = (
        <BookingIconActions hint={!ninOk ? "Verify NIN to accept" : undefined}>
          <BookingIconButton
            label="Accept booking"
            icon={<Check className="size-4" strokeWidth={2.5} />}
            variant="primary"
            disabled={busy || !ninOk}
            onClick={() => acceptBooking(b.id)}
          />
          <BookingIconButton
            label="Decline booking"
            icon={<X className="size-4" strokeWidth={2.5} />}
            variant="danger"
            disabled={busy}
            onClick={() => declineBooking(b.id)}
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
    } else if (tab === "confirmed" && b.status === "accepted") {
      actionsSlot = (
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
            label="Report issue"
            icon={<Flag className="size-3.5" />}
            variant="ghost"
            onClick={() => setReportBookingId(b.id)}
          />
        </BookingIconActions>
      );
    } else {
      actionsSlot = (
        <BookingIconActions>
          <BookingIconButton
            label="Report issue"
            icon={<Flag className="size-3.5" />}
            variant="ghost"
            onClick={() => setReportBookingId(b.id)}
          />
        </BookingIconActions>
      );
    }

    return {
      id: b.id,
      dateCol: formatScheduledShort(b.scheduledAt),
      title: parts.who,
      subtitle: parts.hospital,
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

  const columns = ["When", "Request", "Status"] as const;

  return {
    pending: {
      summarySections: [],
      mainListTitle: "Open",
      columnLabels: columns,
      rows: byTab("pending"),
      actionsColumnLabel: "Actions",
      tableEmptyMessage: "You're all caught up.",
    },
    confirmed: {
      summarySections: [],
      mainListTitle: "Confirmed",
      columnLabels: columns,
      rows: byTab("confirmed"),
      actionsColumnLabel: "Actions",
      tableEmptyMessage: "Nothing confirmed yet.",
    },
    past: {
      summarySections: [],
      mainListTitle: "Past",
      columnLabels: columns,
      rows: byTab("past"),
      actionsColumnLabel: "Actions",
      tableEmptyMessage: "No past bookings.",
    },
  };
}
