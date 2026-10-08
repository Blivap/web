"use client";

import { useCallback, useMemo, useState } from "react";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import { buildWalletReceipt } from "@/lib/wallet/buildWalletReceipt";
import {
  downloadWalletReceipt,
  shareWalletReceipt,
} from "@/lib/wallet/shareWalletReceipt";
import type { WalletLedgerEntry } from "@/types/wallet";

export function useWalletReceipt(currency: string) {
  const { showSnackbar } = useSnackbar();
  const { user } = useDashboard();
  const [selected, setSelected] = useState<{
    entry: WalletLedgerEntry;
    index: number;
  } | null>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  const accountLabel = useMemo(() => {
    const name = [user?.firstname, user?.lastname].filter(Boolean).join(" ");
    if (name && user?.email) return `${name} · ${user.email}`;
    if (user?.email) return user.email;
    if (name) return name;
    return undefined;
  }, [user?.email, user?.firstname, user?.lastname]);

  const receipt = useMemo(() => {
    if (!selected) return null;
    return buildWalletReceipt(selected.entry, {
      currency,
      accountLabel,
      index: selected.index,
    });
  }, [accountLabel, currency, selected]);

  const openReceipt = useCallback((entry: WalletLedgerEntry, index: number) => {
    setSelected({ entry, index });
  }, []);

  const closeReceipt = useCallback(() => {
    setSelected(null);
  }, []);

  const download = useCallback(async () => {
    if (!receipt) return;
    setBusy("download");
    try {
      const kind = await downloadWalletReceipt(receipt);
      showSnackbar(
        kind === "html"
          ? "Receipt downloaded. Open the HTML file to print or save as PDF."
          : "Receipt downloaded.",
        "success",
      );
    } catch {
      showSnackbar("Could not download receipt.", "error");
    } finally {
      setBusy(null);
    }
  }, [receipt, showSnackbar]);

  const share = useCallback(async () => {
    if (!receipt) return;
    setBusy("share");
    try {
      const result = await shareWalletReceipt(receipt);
      if (result === "shared") {
        showSnackbar("Receipt shared.", "success");
      } else if (result === "copied") {
        showSnackbar("Receipt copied to clipboard.", "success");
      } else if (result === "unsupported") {
        showSnackbar("Sharing is not available on this device.", "error");
      }
    } catch {
      showSnackbar("Could not share receipt.", "error");
    } finally {
      setBusy(null);
    }
  }, [receipt, showSnackbar]);

  return {
    receipt,
    open: Boolean(selected),
    openReceipt,
    closeReceipt,
    download,
    share,
    busy,
  };
}
