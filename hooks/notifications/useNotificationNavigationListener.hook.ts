"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Handles `postMessage` from `public/firebase-messaging-sw.js` when a push
 * notification is clicked and an app tab is focused (SPA navigation).
 */
export function useNotificationNavigationListener() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.serviceWorker) return;

    const onMessage = (e: MessageEvent) => {
      if (
        e.data?.type === "blivap-notification-navigate" &&
        typeof e.data.href === "string"
      ) {
        router.push(e.data.href);
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);
}
