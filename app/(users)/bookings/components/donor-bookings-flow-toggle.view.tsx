"use client";

import { Button } from "@/components/button/button.component";
import { useBookingsDonorFlowToggle } from "@/hooks/bookings/useBookingsDonorFlowToggle.hook";
import { BuyerBookingsView } from "./buyer-bookings.view";
import { DonorBookingsView } from "./donor-bookings.view";

export function DonorBookingsFlowToggle() {
  const { bookingFlow, applyBookingFlow } = useBookingsDonorFlowToggle();

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Bookings: requests you received versus requests you sent"
        className="sticky top-0 z-30 w-fit rounded-full border border-border bg-muted/50 p-1 dark:border-white/10 dark:bg-white/5"
      >
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            role="tab"
            aria-selected={bookingFlow === "incoming"}
            variant={bookingFlow === "incoming" ? "default" : "outline"}
            size="sm"
            className="rounded-full px-5 shadow-none"
            onClick={() => applyBookingFlow("incoming")}
          >
            Incoming
          </Button>
          <Button
            type="button"
            role="tab"
            aria-selected={bookingFlow === "outgoing"}
            variant={bookingFlow === "outgoing" ? "default" : "outline"}
            size="sm"
            className="rounded-full px-5 shadow-none"
            onClick={() => applyBookingFlow("outgoing")}
          >
            Outgoing
          </Button>
        </div>
      </div>
      {bookingFlow === "incoming" ? (
        <DonorBookingsView />
      ) : (
        <BuyerBookingsView />
      )}
    </div>
  );
}
