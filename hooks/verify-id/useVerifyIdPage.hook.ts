"use client";

import Cookies from "js-cookie";
import { navigateOutAfterSuccess } from "@/lib/navigation/navigateOutAfterSuccess";
import { useNin } from "@/hooks/nin/useNin.hooks";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppSelector } from "@/store/hooks";
import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NIN_LENGTH = 11;

export function useVerifyIdPage() {
  const [mounted, setMounted] = useState(false);
  const [nin, setNin] = useState("");

  const { showSnackbar } = useSnackbar();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const {
    isLoading: isNinVerifying,
    error: ninError,
    clearError: clearNinError,
    verifyNin,
  } = useNin();

  const router = useRouter();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  const cookieToken =
    mounted && typeof window !== "undefined"
      ? Cookies.get("auth_token")
      : undefined;
  const hasSession = Boolean(token || cookieToken);

  const isVerified = user?.nationalIdentificationNumberVerified === true;

  /** Session still resolving — block the form until profile is loaded. */
  const awaitingProfile = hasSession && user === null;
  const showGateLoader = !mounted || awaitingProfile;

  const handleNinChange = useCallback(
    (value: string) => {
      clearNinError();
      const digits = value.replace(/\D/g, "").slice(0, NIN_LENGTH);
      setNin(digits);
    },
    [clearNinError],
  );

  const handleConfirmNin = useCallback(async () => {
    if (nin.length !== NIN_LENGTH) return;
    const ok = await verifyNin(nin);
    if (ok) {
      showSnackbar("Identity verified successfully.", "success");
      queueMicrotask(() => navigateOutAfterSuccess(router));
    }
  }, [nin, verifyNin, showSnackbar, router]);

  return {
    showGateLoader,
    isVerified,
    user,
    nin,
    isNinVerifying,
    ninError,
    canSubmit: nin.length === NIN_LENGTH,
    handleNinChange,
    handleConfirmNin,
  };
}
