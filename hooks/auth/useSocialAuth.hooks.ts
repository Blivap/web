"use client";

import { AxiosError } from "axios";
import { useState } from "react";
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
  signInForIdToken,
  socialAuthErrorMessage,
  SocialProvider,
} from "@/lib/firebase/auth";
import { useAppDispatch } from "@/store/hooks";

export function useSocialAuth() {
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const signIn = async (provider: SocialProvider) => {
    if (pending) return;
    setPending(provider);
    try {
      const idToken = await signInForIdToken(provider);
      const { data, status, message, error } = await $api.auth.social({
        idToken,
      });
      if (status >= 200 && status < 300) {
        trackSuccess("login", { method: provider });
        showSnackbar("Signed in", "success");
        await applyAuthSession({
          authData: readAuthEnvelope(data),
          dispatch,
          router,
          searchParams,
        });
        return;
      }
      trackFailure("login", "api", { method: provider });
      showSnackbar(
        error || message || "Could not sign in with that account",
        "error",
      );
    } catch (error) {
      const firebaseMessage = socialAuthErrorMessage(error);
      if (!firebaseMessage) return;
      if (error instanceof AxiosError) {
        trackFailure("login", classifyAnalyticsError(error), { method: provider });
        const responseData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        showSnackbar(
          responseData?.message ||
            responseData?.error ||
            firebaseMessage,
          "error",
        );
        return;
      }
      trackFailure("login", classifyAnalyticsError(error), { method: provider });
      showSnackbar(firebaseMessage, "error");
    } finally {
      setPending(null);
    }
  };

  return { signIn, pending };
}
