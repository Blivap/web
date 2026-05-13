"use client";

import {
  BookingsShellSkeleton,
  BookingsShell,
} from "./bookings-shell.view";
import { BookingReportModal } from "./booking-report-modal.component";
import { useBuyerBookings } from "@/hooks/bookings/useBuyerBookings.hook";

export function BuyerBookingsView() {
  const {
    user,
    loadState,
    loadError,
    loadData,
    reportBookingId,
    setReportBookingId,
    submitReport,
    shellTabs,
    skeletonTabLabels,
  } = useBuyerBookings();

  if (!user?.id) {
    return (
      <p className="text-sm text-text-secondary">
        Sign in to see your bookings.
      </p>
    );
  }

  if (loadState === "loading") {
    return <BookingsShellSkeleton tabLabels={skeletonTabLabels} />;
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
    <>
      <BookingReportModal
        open={reportBookingId !== null}
        bookingId={reportBookingId}
        onClose={() => setReportBookingId(null)}
        onSubmit={submitReport}
      />
      <BookingsShell defaultTab="sent" tabs={shellTabs} />
    </>
  );
}
