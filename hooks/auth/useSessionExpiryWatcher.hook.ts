"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { forceSessionEnd } from "@/lib/auth/forceSessionEnd";
import {
  isExpiresAtPast,
  msUntilSessionExpiry,
} from "@/lib/auth/sessionExpiry";
import { readStoredTokenExpires } from "@/lib/auth/authCookies";

/**
 * When `accessTokenExpires` elapses, clear the session and leave protected
 * routes — without waiting for an API 401.
 */
export function useSessionExpiryWatcher() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const tokenExpiresAt = useAppSelector((s) => s.auth.tokenExpiresAt);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const endSession = () => {
      clearTimer();
      forceSessionEnd({
        replace: (path) => router.replace(path),
      });
    };

    const expiresAt = tokenExpiresAt ?? readStoredTokenExpires();
    if (!token && !expiresAt) {
      clearTimer();
      return;
    }

    if (!expiresAt) {
      clearTimer();
      return;
    }

    if (isExpiresAtPast(expiresAt)) {
      endSession();
      return;
    }

    const delay = msUntilSessionExpiry(expiresAt);
    if (delay == null) {
      clearTimer();
      return;
    }

    clearTimer();
    timerRef.current = setTimeout(endSession, delay);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const latest = tokenExpiresAt ?? readStoredTokenExpires();
      if (isExpiresAtPast(latest)) {
        endSession();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimer();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, tokenExpiresAt, router]);
}
