"use client";

import { Button } from "@/components/button/button.component";
import { BookingsShellSkeleton, BookingsShell } from "./bookings-shell.view";
import { BookingReportModal } from "./booking-report-modal.component";
import { useDonorBookings } from "@/hooks/bookings/useDonorBookings.hook";
import { CalendarDays } from "lucide-react";

export function DonorBookingsView() {
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
  } = useDonorBookings();

  if (!user?.id) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
          <CalendarDays className="size-5" aria-hidden />
        </div>
        <h3 className="mt-3 text-base font-semibold text-text-primary">
          Your donor bookings
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          Sign in to view and manage your booking requests.
        </p>
      </div>
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
        <Button
          type="button"
          variant="link"
          size="xs"
          className="mt-3 h-auto p-0 text-xs"
          onClick={() => void loadData()}
        >
          Try again
        </Button>
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
      <BookingsShell defaultTab="pending" tabs={shellTabs} />
    </>
  );
}
