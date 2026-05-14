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
      const sel = `[data-booking-row-id="${CSS.escape(highlightBookingId)}"]`;
      const candidates = document.querySelectorAll<HTMLElement>(sel);
      const visible = Array.from(candidates).find(
        (el) => el.offsetWidth > 0 && el.offsetHeight > 0,
      );
      visible?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 300);
    return () => window.clearTimeout(t);
  }, [highlightBookingId, loadState, rowIdsFingerprint]);
}
