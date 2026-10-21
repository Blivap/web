"use client";

import { useMemo, useState } from "react";
import { Building2, Loader2, Star, Trash2 } from "lucide-react";
import { Input } from "@/components/forms/inputs/input.component";
import { BankSearchSelect } from "@/components/forms/bank-search-select/bank-search-select.component";
import { Button } from "@/components/button/button.component";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useWalletBankAccounts } from "@/hooks/wallet/useWalletBankAccounts.hook";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { formatWalletBankLabel } from "@/lib/wallet/parseBankAccountResponse";
import {
  MAX_SAVED_BANK_ACCOUNTS,
  type WalletResolvedBankAccount,
} from "@/types/wallet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsShell } from "../components/settings-shell";
import {
  SettingsCard,
  SettingsSectionLabel,
} from "../components/settings-card";

type ResolveUi =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      accountNumber: string;
      accountName: string;
      bankName: string;
      bankCode: string;
    }
  | {
      status: "choose";
      accountNumber: string;
      matches: WalletResolvedBankAccount[];
      bankName: string;
    }
  | { status: "error"; message: string };

export default function BankDetailsPage() {
  const { showSnackbar } = useSnackbar();
  const {
    accounts,
    banks: catalogBanks,
    banksLoading,
    loading,
    busyId,
    resolveAccount,
    addAccount,
    setPrimary,
    removeAccount,
  } = useWalletBankAccounts();

  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [resolveUi, setResolveUi] = useState<ResolveUi>({ status: "idle" });
  const [saving, setSaving] = useState(false);

  const banks = useMemo(() => {
    const extras: { bank: string; code: string }[] =
      resolveUi.status === "choose"
        ? resolveUi.matches.map((m) => ({
            bank: m.bankName,
            code: m.bankCode,
          }))
        : resolveUi.status === "ready"
          ? [{ bank: resolveUi.bankName, code: resolveUi.bankCode }]
          : [];
    if (!extras.length) return catalogBanks;
    const names = new Set(extras.map((b) => b.bank.toLowerCase()));
    return [
      ...extras,
      ...catalogBanks.filter((b) => !names.has(b.bank.toLowerCase())),
    ];
  }, [catalogBanks, resolveUi]);

  const atLimit = accounts.length >= MAX_SAVED_BANK_ACCOUNTS;
  const canSave =
    resolveUi.status === "ready" &&
    Boolean(resolveUi.accountName && resolveUi.bankName) &&
    !atLimit;

  const runResolve = async (digits: string, bankName?: string) => {
    if (digits.length !== 10) {
      setResolveUi({ status: "idle" });
      return;
    }
    setResolveUi({ status: "loading" });
    try {
      const result = await resolveAccount(digits, bankName || undefined);
      if ("matches" in result) {
        setResolveUi({
          status: "choose",
          accountNumber: result.accountNumber,
          matches: result.matches,
          bankName: bankName || "",
        });
        return;
      }
      setBank(result.bankName);
      setResolveUi({
        status: "ready",
        accountNumber: result.accountNumber,
        accountName: result.accountName,
        bankName: result.bankName,
        bankCode: result.bankCode,
      });
    } catch (err) {
      setResolveUi({
        status: "error",
        message: getAxiosErrorMessage(err, "Could not verify this account"),
      });
    }
  };

  const onPickMatch = (bankName: string) => {
    if (resolveUi.status !== "choose") return;
    const chosen = resolveUi.matches.find((m) => m.bankName === bankName);
    setBank(bankName);
    if (!chosen) {
      setResolveUi({ ...resolveUi, bankName });
      void runResolve(resolveUi.accountNumber, bankName);
      return;
    }
    setResolveUi({
      status: "ready",
      accountNumber: chosen.accountNumber,
      accountName: chosen.accountName,
      bankName: chosen.bankName,
      bankCode: chosen.bankCode,
    });
  };

  const onBankChange = (bankName: string) => {
    setBank(bankName);
    const digits = accountNumber.replace(/\D/g, "");
    if (digits.length === 10) {
      void runResolve(digits, bankName);
      return;
    }
    setResolveUi({ status: "idle" });
  };

  const onSave = async () => {
    if (resolveUi.status !== "ready") return;
    setSaving(true);
    try {
      await addAccount({
        accountNumber: resolveUi.accountNumber,
        bank: resolveUi.bankName,
      });
      showSnackbar("Bank account saved", "success");
      setAccountNumber("");
      setBank("");
      setResolveUi({ status: "idle" });
    } catch (err) {
      showSnackbar(
        getAxiosErrorMessage(err, "Could not save bank account"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const resolvedName =
    resolveUi.status === "ready" ? resolveUi.accountName : "";

  return (
    <SettingsShell
      title="Bank Details"
      description="Save up to three Nigerian bank accounts for withdrawals. Only one can be primary."
    >
      <SettingsCard className="flex flex-col gap-4">
        <SettingsSectionLabel title="Saved accounts" />
        {loading ? (
          <p className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading accounts…
          </p>
        ) : accounts.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFE2E2] text-primary">
                <Building2 className="size-4" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-[#111827] dark:text-white/90">
                No bank account on file
              </p>
            </div>
            <p className="mt-3 text-xs text-[#6B7280] dark:text-white/50">
              Add an account below. Each account must be at a different bank.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827] dark:text-white/90">
                    {account.accountName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#6B7280] dark:text-white/50">
                    {formatWalletBankLabel(account)}
                    {account.isPrimary ? " · Primary" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!account.isPrimary ? (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      className="rounded-md"
                      aria-label="Make primary"
                      title="Make primary"
                      disabled={busyId === account.id}
                      loading={busyId === account.id}
                      onClick={() => {
                        void setPrimary(account.id);
                      }}
                    >
                      <Star className="size-3.5" aria-hidden />
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#1F7A3F] dark:bg-emerald-500/15 dark:text-emerald-300">
                      <Star className="size-3" strokeWidth={2.5} aria-hidden />
                      Primary
                    </span>
                  )}
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="rounded-md text-[#960018]"
                    aria-label="Remove"
                    title="Remove"
                    disabled={busyId === account.id}
                    onClick={() => {
                      void removeAccount(account.id);
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>

      <SettingsCard>
        <div className="flex max-w-md flex-col gap-5">
          <SettingsSectionLabel title="Add bank account" />
          {atLimit ? (
            <p className="text-sm text-[#6B7280] dark:text-white/55">
              You already have {MAX_SAVED_BANK_ACCOUNTS} accounts. Remove one to
              add another.
            </p>
          ) : (
            <>
              <Input
                name="accountNumber"
                label="Account Number"
                placeholder="0123456789"
                value={accountNumber}
                inputMode="numeric"
                maxLength={10}
                autoComplete="off"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setAccountNumber(digits);
                  setResolveUi({ status: "idle" });
                  if (digits.length === 10) {
                    void runResolve(digits, bank || undefined);
                  }
                }}
                labelClassName="text-[11px]"
                inputClassName="py-1.5"
                containerClassName="gap-1"
              />

              {resolveUi.status === "choose" ? (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-medium text-[#9794AA]">
                    Choose matched bank
                  </p>
                  <Select
                    value={resolveUi.bankName || undefined}
                    onValueChange={onPickMatch}
                  >
                    <SelectTrigger className="h-10 w-full rounded-md">
                      <SelectValue placeholder="Several banks matched — pick one" />
                    </SelectTrigger>
                    <SelectContent>
                      {resolveUi.matches.map((match) => (
                        <SelectItem key={match.bankCode} value={match.bankName}>
                          {match.bankName} · {match.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <BankSearchSelect
                  banks={banks}
                  value={bank}
                  loading={banksLoading}
                  label="Bank"
                  placeholder="Search bank name"
                  onChange={onBankChange}
                />
              )}

              <div className="flex flex-col gap-1">
                <Input
                  name="accountHolder"
                  label="Account Name"
                  placeholder={
                    resolveUi.status === "loading"
                      ? "Looking up account name…"
                      : "Resolved automatically"
                  }
                  value={resolvedName}
                  readOnly
                  tabIndex={-1}
                  onChange={() => undefined}
                  labelClassName="text-[11px]"
                  inputClassName="cursor-default bg-[#FAFAFA] py-1.5 dark:bg-white/5"
                  containerClassName="gap-1"
                  aria-readonly="true"
                />
                <div className="min-h-4">
                  {resolveUi.status === "loading" ? (
                    <p className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                      <Loader2 className="size-3 animate-spin" aria-hidden />
                      Verifying account number…
                    </p>
                  ) : null}
                  {resolveUi.status === "ready" ? (
                    <p className="text-[11px] font-medium text-[#1F7A3F]">
                      Account name verified
                    </p>
                  ) : null}
                  {resolveUi.status === "choose" ? (
                    <p className="text-[11px] text-[#6B7280]">
                      More than one bank matched. Choose the correct bank to
                      continue.
                    </p>
                  ) : null}
                  {resolveUi.status === "error" ? (
                    <p className="text-[11px] text-red-500">
                      {resolveUi.message}
                      {!bank ? " Select a bank and try again." : ""}
                    </p>
                  ) : null}
                  {resolveUi.status === "idle" &&
                  accountNumber.length === 10 &&
                  !bank ? (
                    <p className="text-[11px] text-[#6B7280]">
                      Optional: select a bank if lookup needs the bank name.
                    </p>
                  ) : null}
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                className="w-fit rounded-md px-5 text-xs font-semibold"
                disabled={!canSave || saving}
                loading={saving}
                onClick={() => {
                  void onSave();
                }}
              >
                Save account
              </Button>
            </>
          )}
        </div>
      </SettingsCard>
    </SettingsShell>
  );
}
