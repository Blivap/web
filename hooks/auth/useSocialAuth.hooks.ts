"use client";

import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import {
  applyAuthSession,
  readAuthEnvelope,
} from "@/lib/auth/applyAuthSession";
import {
  classifyAnalyticsError,
  trackFailure,
  trackSuccess,
} from "@/lib/analytics/ga";
import {
  completeSocialRedirect,
  isFirebaseAuthConfigured,
  signInForIdToken,
  socialAuthErrorMessage,
  SocialProvider,
} from "@/lib/firebase/auth";
import { useAppDispatch } from "@/store/hooks";

export function useSocialAuth(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const configured = isFirebaseAuthConfigured();
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectHandled = useRef(false);

  const finishWithIdToken = async (
    idToken: string,
    method: SocialProvider | "redirect",
  ) => {
    const { data, status, message, error } = await $api.auth.social({
      idToken,
    });
    if (status >= 200 && status < 300) {
      trackSuccess("login", { method });
      showSnackbar("Signed in", "success");
      await applyAuthSession({
        authData: readAuthEnvelope(data),
        dispatch,
        router,
        searchParams,
      });
      return true;
    }
    trackFailure("login", "api", { method });
    showSnackbar(
      error || message || "Could not sign in with that account",
      "error",
    );
    return false;
  };

  useEffect(() => {
    if (!configured || redirectHandled.current) return;
    redirectHandled.current = true;
    void (async () => {
      try {
        const idToken = await completeSocialRedirect();
        if (!idToken) return;
        setPending("google");
        await finishWithIdToken(idToken, "redirect");
      } catch (error) {
        const firebaseMessage = socialAuthErrorMessage(error);
        if (firebaseMessage) {
          trackFailure("login", classifyAnalyticsError(error), {
            method: "redirect",
          });
          showSnackbar(firebaseMessage, "error");
        }
      } finally {
        setPending(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for redirect return
  }, [configured]);

  const signIn = async (provider: SocialProvider) => {
    if (provider === "apple" || provider === "facebook") {
      showSnackbar("Still under construction", "info");
      return;
    }
    if (pending) return;
    if (!enabled) {
      showSnackbar("Accept the terms and conditions to continue", "error");
      return;
    }
    if (!configured) {
      showSnackbar("Social sign-in is not configured on this app", "error");
      return;
    }
    setPending(provider);
    try {
      const idToken = await signInForIdToken(provider);
      await finishWithIdToken(idToken, provider);
    } catch (error) {
      const firebaseMessage = socialAuthErrorMessage(error);
      if (!firebaseMessage) return;
      if (error instanceof AxiosError) {
        trackFailure("login", classifyAnalyticsError(error), {
          method: provider,
        });
        const responseData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        showSnackbar(
          responseData?.message || responseData?.error || firebaseMessage,
          "error",
        );
        return;
      }
      trackFailure("login", classifyAnalyticsError(error), {
        method: provider,
      });
      showSnackbar(firebaseMessage, "error");
    } finally {
      setPending(null);
    }
  };

  return {
    signIn,
    pending,
    configured,
    enabled: enabled && configured,
  };
}
