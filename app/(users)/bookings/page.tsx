"use client";

import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { BuyerBookingsView } from "./components/buyer-bookings.view";
import { DonorBookingsFlowToggle } from "./components/donor-bookings-flow-toggle.view";
import { useAppSelector } from "@/store/hooks";

function BookingsContent() {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  if (token && !user) {
    return (
      <div className="flex min-h-[320px] flex-col gap-6 animate-pulse">
        <div className="h-9 w-48 rounded-md bg-[#E5E7EB] dark:bg-white/10" />
        <div className="flex h-10 w-56 items-center gap-0.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] p-1 dark:border-white/10 dark:bg-white/5">
          <div className="h-full flex-1 rounded-full bg-primary/25 dark:bg-primary/30" />
          <div className="h-full flex-1 rounded-full bg-transparent" />
        </div>
        <div className="h-24 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
        <div className="h-24 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
        <div className="h-64 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
      </div>
    );
  }

  /** Incoming vs outgoing for anyone with a resolved profile (roles alone are unreliable from `/me`). */
  return user ? <DonorBookingsFlowToggle /> : <BuyerBookingsView />;
}

export default function BookingsPage() {
  return (
    <Layout>
      <div className="-mx-4 min-h-[min(100%,480px)]  px-4 py-6 xl:-mx-7 xl:px-7 xl:py-8">
        <Suspense
          fallback={
            <div className="flex min-h-[320px] flex-col gap-6 animate-pulse">
              <div className="h-9 w-48 rounded-md bg-[#E5E7EB] dark:bg-white/10" />
              <div className="flex h-10 w-56 items-center gap-0.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] p-1 dark:border-white/10 dark:bg-white/5">
                <div className="h-full flex-1 rounded-full bg-primary/25 dark:bg-primary/30" />
                <div className="h-full flex-1 rounded-full bg-transparent" />
              </div>
              <div className="h-24 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
              <div className="h-24 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
              <div className="h-64 rounded-lg border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#1a1a22]" />
            </div>
          }
        >
          <BookingsContent />
        </Suspense>
      </div>
    </Layout>
  );
}
