"use client";

import { Button } from "@/components/button/button.component";
import { BookingsShellSkeleton, BookingsShell } from "./bookings-shell.view";
import { DonationRatingModal } from "./donation-rating-modal.component";
import { useBuyerBookings } from "@/hooks/bookings/useBuyerBookings.hook";

export function BuyerBookingsView() {
  const {
    user,
    loadState,
    loadError,
    loadData,
    shellTabs,
    skeletonTabLabels,
    ratingOpen,
    activeRatingBooking,
    activeRatingDonorLabel,
    closeRating,
    handleRatingSuccess,
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
      <BookingsShell defaultTab="sent" tabs={shellTabs} />
      {activeRatingBooking ? (
        <DonationRatingModal
          open={ratingOpen}
          onClose={closeRating}
          bookingId={activeRatingBooking.id}
          donorLabel={activeRatingDonorLabel}
          onSuccess={handleRatingSuccess}
        />
      ) : null}
    </>
  );
}
