"use client";

import { cn } from "@/lib/utils";
import { useBookingsDonorFlowToggle } from "@/hooks/bookings/useBookingsDonorFlowToggle.hook";
import { BuyerBookingsView } from "./buyer-bookings.view";
import { DonorBookingsView } from "./donor-bookings.view";

export function DonorBookingsFlowToggle() {
  const { bookingFlow, applyBookingFlow } = useBookingsDonorFlowToggle();

  const pill = (flow: "incoming" | "outgoing") =>
    cn(
      "rounded-full px-5 py-2 text-sm font-medium transition-colors duration-150",
      bookingFlow === flow
        ? "bg-primary text-white shadow-sm"
        : "text-text-secondary hover:text-text-primary",
    );

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Bookings: requests you received versus requests you sent"
        className="sticky top-0 z-30 w-fit rounded-full border border-border bg-muted/50 p-1 dark:border-white/10 dark:bg-white/5"
      >
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            role="tab"
            aria-selected={bookingFlow === "incoming"}
            className={pill("incoming")}
            onClick={() => applyBookingFlow("incoming")}
          >
            Incoming
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={bookingFlow === "outgoing"}
            className={pill("outgoing")}
            onClick={() => applyBookingFlow("outgoing")}
          >
            Outgoing
          </button>
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
