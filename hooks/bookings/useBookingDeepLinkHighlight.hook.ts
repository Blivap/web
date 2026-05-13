import { useEffect } from "react";

/**
 * When `?bookingId=` is present and rows are loaded, scroll that row into view.
 */
export function useBookingDeepLinkHighlight(
  highlightBookingId: string,
  loadState: "idle" | "loading" | "ok" | "error",
  /** Dependency so the effect re-runs when row ids change (e.g. after refetch). */
  rowIdsFingerprint: string,
) {
  useEffect(() => {
    if (!highlightBookingId || loadState !== "ok") return;
    const t = window.setTimeout(() => {
      document
        .getElementById(`booking-row-${highlightBookingId}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 300);
    return () => window.clearTimeout(t);
  }, [highlightBookingId, loadState, rowIdsFingerprint]);
}
