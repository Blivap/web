"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { parseWalletSummaryResponse } from "@/lib/wallet/parseWalletResponse";
import {
  parseWalletTopupSessionResponse,
  pickPaystackReferenceFromSearch,
} from "@/lib/wallet/parseWalletTopupResponse";
import {
  isValidTopupAmountKobo,
  walletTopupCallbackUrl,
} from "@/lib/wallet/walletTopupAmounts";
import type { WalletSummary } from "@/types/wallet";

type UseWalletTopupOptions = {
  onWalletUpdated: (wallet: WalletSummary) => void;
};

export function useWalletTopup({ onWalletUpdated }: UseWalletTopupOptions) {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [starting, setStarting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const verifiedRef = useRef<string | null>(null);

  const clearPaystackQuery = useCallback(() => {
    router.replace(pathname || "/wallet");
  }, [pathname, router]);

  const verifyTopup = useCallback(
    async (reference: string) => {
      if (!reference || verifiedRef.current === reference) return false;
      verifiedRef.current = reference;
      setVerifying(true);
      try {
        const res = await $api.wallet.verifyTopup(reference);
        if (res.status < 200 || res.status >= 300) {
          showSnackbar(
            res.error ?? res.message ?? "Could not verify wallet top-up",
            "error",
          );
          verifiedRef.current = null;
          return false;
        }
        const wallet = parseWalletSummaryResponse(res.data ?? res);
        onWalletUpdated(wallet);
        showSnackbar(
          (typeof res.data?.message === "string" && res.data.message) ||
            "Wallet funded",
          "success",
        );
        clearPaystackQuery();
        return true;
      } catch (err) {
        verifiedRef.current = null;
        showSnackbar(
          getAxiosErrorMessage(err, "Could not verify wallet top-up"),
          "error",
        );
        return false;
      } finally {
        setVerifying(false);
      }
    },
    [clearPaystackQuery, onWalletUpdated, showSnackbar],
  );

  useEffect(() => {
    const reference = pickPaystackReferenceFromSearch(searchParams);
    if (!reference) return;
    void verifyTopup(reference);
  }, [searchParams, verifyTopup]);

  const startTopup = useCallback(
    async (amountKobo: number): Promise<boolean> => {
      if (!isValidTopupAmountKobo(amountKobo)) {
        showSnackbar("Minimum top-up is ₦100", "error");
        return false;
      }
      setStarting(true);
      try {
        const res = await $api.wallet.startTopup({
          amountKobo,
          callbackUrl: walletTopupCallbackUrl(),
        });
        if (res.status < 200 || res.status >= 300) {
          showSnackbar(
            res.error ?? res.message ?? "Could not start wallet top-up",
            "error",
          );
          return false;
        }
        const session = parseWalletTopupSessionResponse(res.data ?? res);
        if (!session?.authorizationUrl) {
          showSnackbar("Payment link was missing. Try again.", "error");
          return false;
        }
        window.location.assign(session.authorizationUrl);
        return true;
      } catch (err) {
        showSnackbar(
          getAxiosErrorMessage(err, "Could not start wallet top-up"),
          "error",
        );
        return false;
      } finally {
        setStarting(false);
      }
    },
    [showSnackbar],
  );

  return {
    startTopup,
    verifying,
    starting,
  };
}
