"use client";

import { useCallback, useEffect, useState } from "react";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  parseBankResolveResult,
  parseWalletBankAccount,
  parseWalletBankAccounts,
} from "@/lib/wallet/parseBankAccountResponse";
import { parseWalletBanksResponse } from "@/lib/wallet/parseWalletBanksResponse";
import type { WalletBankOption } from "@/lib/wallet/nigerianBanks";
import type {
  WalletBankAccount,
  WalletBankResolveResult,
  WalletResolvedBankAccount,
} from "@/types/wallet";

export function useWalletBankAccounts() {
  const { showSnackbar } = useSnackbar();
  const [accounts, setAccounts] = useState<WalletBankAccount[]>([]);
  const [banks, setBanks] = useState<WalletBankOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [banksLoading, setBanksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await $api.wallet.listBankAccounts();
      if (res.status < 200 || res.status >= 300) {
        const msg = res.error ?? res.message ?? "Could not load bank accounts";
        setAccounts([]);
        setError(msg);
        return;
      }
      setAccounts(parseWalletBankAccounts(res.data ?? res));
    } catch (err) {
      const msg = getAxiosErrorMessage(err, "Could not load bank accounts");
      setAccounts([]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBanks = useCallback(async () => {
    try {
      setBanksLoading(true);
      const res = await $api.wallet.listBanks();
      if (res.status < 200 || res.status >= 300) {
        setBanks([]);
        return;
      }
      setBanks(parseWalletBanksResponse(res.data ?? res));
    } catch {
      setBanks([]);
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadBanks();
  }, [load, loadBanks]);

  const resolveAccount = useCallback(
    async (accountNumber: string, bank?: string) => {
      try {
        const res = await $api.wallet.resolveBankAccount({
          accountNumber,
          bank,
        });
        if (res.status < 200 || res.status >= 300) {
          throw new Error(
            res.error ?? res.message ?? "Could not verify this account",
          );
        }
        const parsed = parseBankResolveResult(res.data ?? res);
        if (!parsed) {
          throw new Error("Could not verify this account");
        }
        return parsed;
      } catch (err) {
        throw new Error(
          getAxiosErrorMessage(err, "Could not verify this account"),
        );
      }
    },
    [],
  );

  const addAccount = useCallback(
    async (payload: { accountNumber: string; bank?: string }) => {
      try {
        const res = await $api.wallet.addBankAccount(payload);
        if (res.status < 200 || res.status >= 300) {
          throw new Error(
            res.error ?? res.message ?? "Could not save bank account",
          );
        }
        const saved = parseWalletBankAccount(res.data ?? res);
        await load();
        return saved;
      } catch (err) {
        throw new Error(
          getAxiosErrorMessage(err, "Could not save bank account"),
        );
      }
    },
    [load],
  );

  const setPrimary = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        const res = await $api.wallet.setPrimaryBankAccount(id);
        if (res.status < 200 || res.status >= 300) {
          showSnackbar(
            res.error ?? res.message ?? "Could not update primary account",
            "error",
          );
          return false;
        }
        await load();
        showSnackbar("Primary account updated", "success");
        return true;
      } catch (err) {
        showSnackbar(
          getAxiosErrorMessage(err, "Could not update primary account"),
          "error",
        );
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [load, showSnackbar],
  );

  const removeAccount = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        const res = await $api.wallet.deleteBankAccount(id);
        if (res.status < 200 || res.status >= 300) {
          showSnackbar(
            res.error ?? res.message ?? "Could not remove bank account",
            "error",
          );
          return false;
        }
        await load();
        showSnackbar("Bank account removed", "success");
        return true;
      } catch (err) {
        showSnackbar(
          getAxiosErrorMessage(err, "Could not remove bank account"),
          "error",
        );
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [load, showSnackbar],
  );

  return {
    accounts,
    banks,
    banksLoading,
    loading,
    error,
    busyId,
    reload: load,
    resolveAccount,
    addAccount,
    setPrimary,
    removeAccount,
  };
}

export type { WalletBankResolveResult, WalletResolvedBankAccount };
