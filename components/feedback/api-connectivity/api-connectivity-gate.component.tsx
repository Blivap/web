"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { RefreshCw, WifiOff, X } from "lucide-react";
import { config } from "@/config/env";
import {
  getApiUnreachable,
  probeApiReachability,
  reportApiReachable,
  reportApiUnreachable,
  subscribeApiConnectivity,
} from "@/lib/api/apiConnectivity";
import { isNetworkFailure } from "@/lib/api/networkFailure";

function useApiUnreachable(): boolean {
  return useSyncExternalStore(
    subscribeApiConnectivity,
    getApiUnreachable,
    () => false,
  );
}

/**
 * Top status line when the Blivap API is unreachable.
 * Also swallows unhandled Axios network rejections so Next.js does not show
 * the red runtime overlay for “Network Error”.
 */
export function ApiConnectivityGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreachable = useApiUnreachable();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      if (!isNetworkFailure(event.reason)) return;
      event.preventDefault();
      reportApiUnreachable();
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  const onDismiss = () => {
    reportApiReachable();
  };

  const onRetry = () => {
    void (async () => {
      setRetrying(true);
      const ok = await probeApiReachability(config.apiUrl);
      setRetrying(false);
      if (ok) {
        window.location.reload();
      }
    })();
  };

  return (
    <>
      {unreachable ? (
        <div
          role="status"
          aria-live="polite"
          className="sticky top-0 z-[100] w-full border-b border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D] dark:border-red-500/30 dark:bg-red-950/90 dark:text-red-100"
        >
          <div className="mx-auto flex w-full max-w-[100rem] items-center gap-3 px-3 py-2.5 sm:px-5">
            <WifiOff className="size-4 shrink-0" aria-hidden strokeWidth={2.25} />
            <p className="min-w-0 flex-1 text-[12px] leading-snug sm:text-[13px]">
              <span className="font-semibold">Can&apos;t reach the server.</span>{" "}
              <span className="text-[#9B2C2C] dark:text-red-200/90">
                The app is open, but Blivap&apos;s API is down or unreachable.
                Check your connection, then try again.
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#960018] px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#7d0014] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`size-3 ${retrying ? "animate-spin" : ""}`}
                  aria-hidden
                />
                {retrying ? "Checking…" : "Try again"}
              </button>
              <button
                type="button"
                aria-label="Dismiss server status"
                onClick={onDismiss}
                disabled={retrying}
                className="inline-flex size-7 items-center justify-center rounded-md text-[#9B2C2C] transition-colors hover:bg-[#FEE2E2] disabled:opacity-50 dark:text-red-200 dark:hover:bg-white/10"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {children}
    </>
  );
}
