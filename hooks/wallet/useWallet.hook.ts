"use client";

import { useCallback, useEffect, useState } from "react";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  EMPTY_WALLET_SUMMARY,
  parseWalletSummaryResponse,
} from "@/lib/wallet/parseWalletResponse";
import type { WalletSummary } from "@/types/wallet";

export function useWallet() {
  const { showSnackbar } = useSnackbar();
  const [wallet, setWallet] = useState<WalletSummary>(EMPTY_WALLET_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await $api.wallet.summary();
      if (res.status < 200 || res.status >= 300) {
        const msg = res.error ?? res.message ?? "Could not load wallet";
        setWallet(EMPTY_WALLET_SUMMARY);
        setError(msg);
        showSnackbar(msg, "error");
        return;
      }
      setWallet(parseWalletSummaryResponse(res.data ?? res));
    } catch (err) {
      const msg = getAxiosErrorMessage(err, "Could not load wallet");
      setWallet(EMPTY_WALLET_SUMMARY);
      setError(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyWallet = useCallback((next: WalletSummary) => {
    setWallet(next);
    setError(null);
  }, []);

  return {
    wallet,
    loading,
    error,
    reload: load,
    applyWallet,
  };
}
