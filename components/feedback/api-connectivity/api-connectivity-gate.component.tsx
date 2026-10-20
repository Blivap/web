"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff, X } from "lucide-react";
import { Button } from "@/components/button/button.component";
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
 * Soft full-page state when the Blivap API is unreachable.
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

  useEffect(() => {
    if (!unreachable) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        reportApiReachable();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [unreachable]);

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

  if (!unreachable) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[100dvh]">
      <div
        className="pointer-events-none select-none opacity-[0.35]"
        aria-hidden
      >
        {children}
      </div>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#100F14]/55 px-4 backdrop-blur-sm dark:bg-black/70"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="api-down-title"
        aria-describedby="api-down-desc"
        onClick={onDismiss}
      >
        <div
          className="relative w-full max-w-md rounded-2xl border border-[#E8E6E3] bg-white p-6 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-[#1a1a22]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onDismiss}
            disabled={retrying}
            className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-[#F4F4F5] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-50 dark:hover:bg-white/10"
          >
            <X className="size-4" aria-hidden />
          </button>
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF5F5] text-primary dark:bg-primary/15">
            <WifiOff className="size-5" aria-hidden />
          </div>
          <h2
            id="api-down-title"
            className="mt-4 pr-8 text-lg font-semibold text-text-primary"
          >
            Can&apos;t reach Blivap
          </h2>
          <p
            id="api-down-desc"
            className="mt-2 text-sm leading-relaxed text-text-secondary"
          >
            The app is running, but we can&apos;t talk to the server right now.
            Check your internet connection, make sure the API is up, then try
            again.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-md px-4 text-xs font-semibold"
              loading={retrying}
              onClick={onRetry}
            >
              {retrying ? "Checking…" : "Try again"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-md px-4 text-xs font-semibold"
              disabled={retrying}
              onClick={onDismiss}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
