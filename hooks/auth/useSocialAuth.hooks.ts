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

function messageFromBody(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const body = data as { message?: unknown; error?: unknown };
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message.trim();
  }
  if (typeof body.error === "string" && body.error.trim()) {
    return body.error.trim();
  }
  return null;
}

/** Maps POST /authentication/social failures to a user-facing message. */
function socialApiErrorMessage(
  status: number | undefined,
  data: unknown,
  fallback?: string | null,
): string {
  const fromBody = messageFromBody(data);
  // Old backend path — account is now created on first social sign-in.
  if (
    fromBody &&
    /registration\s*required|sign\s*up\s*required|complete\s*registration/i.test(
      fromBody,
    )
  ) {
    return "Could not finish signing in. Please try again.";
  }
  if (fromBody) return fromBody;
  if (status === 400) {
    return "This account could not be signed in. Check that the provider shared an email address.";
  }
  if (status === 409) {
    return "This email is already linked to a different sign-in method.";
  }
  if (status === 503) {
    return "Social sign-in is temporarily unavailable. Please try again shortly.";
  }
  return fallback?.trim() || "Could not sign in with that account";
}

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
    try {
      const { data, status, message, error } = await $api.auth.social({
        idToken,
      });
      if (status >= 200 && status < 300) {
        trackSuccess("login", { method });
        showSnackbar("Login successful!", "success");
        await applyAuthSession({
          authData: readAuthEnvelope(data),
          dispatch,
          router,
          searchParams,
          // Backend creates social users as verified — never send OTP.
          skipEmailVerification: true,
        });
        return true;
      }
      trackFailure("login", "api", { method });
      showSnackbar(
        socialApiErrorMessage(status, data, error || message),
        "error",
      );
      return false;
    } catch (error) {
      if (error instanceof AxiosError) {
        trackFailure("login", classifyAnalyticsError(error), { method });
        showSnackbar(
          socialApiErrorMessage(
            error.response?.status,
            error.response?.data,
            error.message,
          ),
          "error",
        );
        return false;
      }
      throw error;
    }
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
    if (provider === "facebook") {
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
