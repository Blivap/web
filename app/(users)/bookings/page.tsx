"use client";

import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { BuyerBookingsView } from "./components/buyer-bookings.view";
import { DonorBookingsView } from "./components/donor-bookings.view";

/** Toggle donor vs requester (non-donor) UI; replace with user / API when `IUser` exposes role. */
const SHOW_DONOR_BOOKING_UI = true;

export default function BookingsPage() {
  return (
    <Layout>
      <div className="-mx-4 min-h-[min(100%,480px)]  px-4 py-6 xl:-mx-7 xl:px-7 xl:py-8">
        <Suspense
          fallback={
            <div className="flex min-h-[320px] flex-col gap-6 animate-pulse">
              <div className="h-9 w-48 rounded-md bg-[#E5E7EB] dark:bg-white/10" />
              <div className="h-10 w-full max-w-md border-b border-[#E5E7EB] dark:border-white/10" />
              <div className="h-24 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
              <div className="h-24 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
              <div className="h-64 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
            </div>
          }
        >
          {SHOW_DONOR_BOOKING_UI ? (
            <DonorBookingsView />
          ) : (
            <BuyerBookingsView />
          )}
        </Suspense>
      </div>
    </Layout>
  );
}
