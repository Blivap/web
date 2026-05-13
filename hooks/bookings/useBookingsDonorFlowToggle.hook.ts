"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type BookingFlow = "incoming" | "outgoing";

const BOOKINGS_DONOR_FLOW_KEY = "blivap:bookings:donor-flow";

function readBookingFlowFromLocation(): BookingFlow {
  if (typeof window === "undefined") return "incoming";
  return new URLSearchParams(window.location.search).get("view") === "outgoing"
    ? "outgoing"
    : "incoming";
}

function readPersistedDonorFlow(): BookingFlow | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(BOOKINGS_DONOR_FLOW_KEY);
    if (v === "incoming" || v === "outgoing") return v;
  } catch {
    /* private mode */
  }
  return null;
}

function persistDonorFlow(flow: BookingFlow) {
  try {
    sessionStorage.setItem(BOOKINGS_DONOR_FLOW_KEY, flow);
  } catch {
    /* private mode */
  }
}

function initialDonorBookingFlow(): BookingFlow {
  if (typeof window === "undefined") return "incoming";
  return readPersistedDonorFlow() ?? readBookingFlowFromLocation();
}

/**
 * Donor accounts: Incoming vs Outgoing URL + session persistence (see bookings page).
 */
export function useBookingsDonorFlowToggle() {
  const pathname = usePathname();
  const router = useRouter();

  const [bookingFlow, setBookingFlow] =
    useState<BookingFlow>(initialDonorBookingFlow);

  useEffect(() => {
    if (readPersistedDonorFlow() === null) {
      persistDonorFlow(readBookingFlowFromLocation());
    }
  }, []);

  useEffect(() => {
    function onPopState() {
      const next = readBookingFlowFromLocation();
      persistDonorFlow(next);
      setBookingFlow(next);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function applyBookingFlow(next: BookingFlow) {
    persistDonorFlow(next);
    setBookingFlow(next);
    const params = new URLSearchParams(window.location.search);
    if (next === "incoming") {
      params.set("view", "incoming");
      if (params.get("tab") === "sent") {
        params.delete("tab");
      }
    } else {
      params.set("view", "outgoing");
    }
    const q = params.toString();
    const href = q.length > 0 ? `${pathname}?${q}` : pathname;
    void router.replace(href, { scroll: false });
  }

  return { bookingFlow, applyBookingFlow };
}
