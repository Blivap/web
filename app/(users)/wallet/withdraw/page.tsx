"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Info, Lock, Plus } from "lucide-react";
import { Layout } from "@/layout/layout.component";
import { Button } from "@/components/button/button.component";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useWallet } from "@/hooks/wallet/useWallet.hook";
import { useWalletBankAccounts } from "@/hooks/wallet/useWalletBankAccounts.hook";
import { useQueryParam } from "@/hooks/navigation/useQueryParamState.hook";
import { $api } from "@/app/api";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import { formatWalletAmount } from "@/lib/wallet/formatWalletDisplay";
import { formatWalletBankLabel } from "@/lib/wallet/parseBankAccountResponse";
import { parseWalletPayoutResponse } from "@/lib/wallet/parseWalletPayoutResponse";
import { nairaToKobo, parseNairaInput } from "@/lib/wallet/walletTopupAmounts";
import { MIN_WALLET_PAYOUT_KOBO, type WalletPayout } from "@/types/wallet";
import { routes } from "@/config/routes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WalletWithdrawBalanceCard } from "./components/wallet-withdraw-balance-card.component";
import { WalletWithdrawReviewView } from "./components/wallet-withdraw-review.view";
import { WalletWithdrawOtpView } from "./components/wallet-withdraw-otp.view";

type Step = "form" | "review" | "otp";

const WITHDRAW_STEPS = ["form", "review", "otp"] as const;

function WalletWithdrawPageContent() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { wallet, loading, reload } = useWallet();
  const { accounts, loading: banksLoading } = useWalletBankAccounts();

  const [stepParam, setStepParam] = useQueryParam("step", "form", {
    omitWhen: "form",
    allowed: WITHDRAW_STEPS,
  });
  const step = (
    WITHDRAW_STEPS.includes(stepParam as Step) ? stepParam : "form"
  ) as Step;
  const setStep = (next: Step) => setStepParam(next);

  const [bankAccountId, setBankAccountId] = useState("");
  const [amountNaira, setAmountNaira] = useState("");
  const [amountFocused, setAmountFocused] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resending, setResending] = useState(false);
  const [payout, setPayout] = useState<WalletPayout | null>(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (step === "otp" && !payout) {
      setStepParam("form");
    }
  }, [step, payout, setStepParam]);

  useEffect(() => {
    if (!bankAccountId && accounts.length) {
      const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];
      setBankAccountId(primary?.id ?? "");
    }
  }, [accounts, bankAccountId]);

  const selectedBank = useMemo(
    () => accounts.find((b) => b.id === bankAccountId) ?? null,
    [accounts, bankAccountId],
  );

  const amountKobo = nairaToKobo(parseNairaInput(amountNaira));
  const amountValid =
    amountKobo >= MIN_WALLET_PAYOUT_KOBO && amountKobo <= wallet.availableKobo;
  const canReview = Boolean(selectedBank) && amountValid;
  const afterBalanceKobo = Math.max(0, wallet.availableKobo - amountKobo);

  const amountInputValue = (() => {
    if (amountFocused) return amountNaira;
    if (!amountNaira.trim() || amountKobo <= 0) return "";
    return formatWalletAmount(amountKobo);
  })();

  const goToReview = () => {
    if (!selectedBank) {
      showSnackbar("Add a bank account before withdrawing.", "error");
      return;
    }
    if (amountKobo < MIN_WALLET_PAYOUT_KOBO) {
      showSnackbar("Minimum withdrawal is ₦100.", "error");
      return;
    }
    if (amountKobo > wallet.availableKobo) {
      showSnackbar("Amount exceeds available balance.", "error");
      return;
    }
    setStep("review");
  };

  const requestPayout = async () => {
    if (!selectedBank) return;
    setRequesting(true);
    try {
      const res = await $api.wallet.requestPayout({
        amountKobo,
        bankAccountId: selectedBank.id,
      });
      if (res.status < 200 || res.status >= 300) {
        showSnackbar(
          res.error ?? res.message ?? "Could not start withdrawal",
          "error",
        );
        return;
      }
      const next = parseWalletPayoutResponse(res.data ?? res);
      if (!next) {
        showSnackbar("Could not start withdrawal", "error");
        return;
      }
      setPayout(next);
      setOtp("");
      setStep("otp");
      showSnackbar(
        (typeof (res.data as { message?: string } | undefined)?.message ===
          "string" &&
          (res.data as { message: string }).message) ||
          "Enter the code we sent to your email",
        "success",
      );
    } catch (err) {
      showSnackbar(
        getAxiosErrorMessage(err, "Could not start withdrawal"),
        "error",
      );
    } finally {
      setRequesting(false);
    }
  };

  const goToWalletAfterMessage = async (
    message: string,
    tone: "success" | "error" | "info" = "success",
  ) => {
    showSnackbar(message, tone);
    // Let the snackbar paint before leaving the page.
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    await reload();
    router.push(routes.wallet);
  };

  const confirmPayout = async () => {
    if (!payout) return;
    setConfirming(true);
    try {
      const res = await $api.wallet.confirmPayout(payout.id, otp);
      if (res.status < 200 || res.status >= 300) {
        await goToWalletAfterMessage(
          res.error ?? res.message ?? "Could not confirm withdrawal",
          "error",
        );
        return;
      }
      const next = parseWalletPayoutResponse(res.data ?? res);
      if (!next) {
        await goToWalletAfterMessage("Could not confirm withdrawal", "error");
        return;
      }
      const apiMessage =
        typeof (res.data as { message?: string } | undefined)?.message ===
        "string"
          ? (res.data as { message: string }).message
          : null;
      if (next.status === "paid") {
        await goToWalletAfterMessage(
          apiMessage || "Withdrawal sent",
          "success",
        );
        return;
      }
      if (next.status === "failed") {
        await goToWalletAfterMessage(
          apiMessage || "Withdrawal failed",
          "error",
        );
        return;
      }
      // processing / awaiting_otp / expired — still leave OTP and return home
      await goToWalletAfterMessage(
        apiMessage || "Withdrawal is on the way",
        next.status === "expired" ? "error" : "success",
      );
    } catch (err) {
      await goToWalletAfterMessage(
        getAxiosErrorMessage(err, "Could not confirm withdrawal"),
        "error",
      );
    } finally {
      setConfirming(false);
    }
  };

  const resendOtp = async () => {
    if (!payout) return;
    setResending(true);
    try {
      const res = await $api.wallet.resendPayoutOtp(payout.id);
      if (res.status < 200 || res.status >= 300) {
        showSnackbar(
          res.error ?? res.message ?? "Could not resend code",
          "error",
        );
        return;
      }
      const next = parseWalletPayoutResponse(res.data ?? res);
      if (next) setPayout(next);
      showSnackbar("Enter the new code we sent to your email", "success");
    } catch (err) {
      showSnackbar(getAxiosErrorMessage(err, "Could not resend code"), "error");
    } finally {
      setResending(false);
    }
  };

  if (step === "otp" && payout) {
    return (
      <Layout>
        <WalletWithdrawOtpView
          payout={payout}
          otp={otp}
          confirming={confirming}
          resending={resending}
          onOtpChange={setOtp}
          onConfirm={() => {
            void confirmPayout();
          }}
          onResend={() => {
            void resendOtp();
          }}
          onBack={() => setStep("review")}
        />
      </Layout>
    );
  }

  if (step === "review" && selectedBank) {
    return (
      <Layout>
        <WalletWithdrawReviewView
          availableKobo={wallet.availableKobo}
          heldKobo={wallet.heldKobo}
          currency={wallet.currency}
          loading={loading}
          bank={selectedBank}
          amountKobo={amountKobo}
          afterBalanceKobo={afterBalanceKobo}
          submitting={requesting}
          onBack={() => setStep("form")}
          onConfirm={() => {
            void requestPayout();
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto flex w-full flex-col pb-10 sm:p-12">
        <div>
          <Link
            href={routes.wallet}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#960018] hover:underline"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
            Back to wallet
          </Link>

          <header className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div>
              <h1 className="text-[28px] leading-tight font-bold tracking-tight text-[#111111] dark:text-white sm:text-[26px]">
                Withdraw funds
              </h1>
              <p className="mt-1.5 text-[14px] leading-snug text-[#6B6B6B] dark:text-white/60">
                Move money from your Blivap wallet to your bank account.
              </p>
            </div>
            <p className="inline-flex shrink-0 items-center gap-1.5 pt-1 text-[12px] font-medium text-[#1F7A3F] dark:text-emerald-300">
              <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
              Your wallet is secure
            </p>
          </header>
        </div>

        <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.65fr_1fr]">
          <div className="flex flex-col gap-5">
            <WalletWithdrawBalanceCard
              availableKobo={wallet.availableKobo}
              heldKobo={wallet.heldKobo}
              currency={wallet.currency}
              loading={loading}
            />

            <section className="rounded-[14px] border border-[#E5E5E5] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#1a1a22] sm:px-6 sm:py-6">
              <h2 className="text-[16px] font-bold tracking-tight text-[#111111] dark:text-white">
                Withdrawal details
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-[#6B6B6B] dark:text-white/55">
                Choose where to send your funds and enter an amount.
              </p>

              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#111111] dark:text-white">
                    Withdraw to
                  </label>
                  {accounts.length === 0 && !banksLoading ? (
                    <div className="rounded-[8px] border border-dashed border-[#D6D6D6] px-3.5 py-3 text-[13px] text-[#6B6B6B] dark:border-white/15 dark:text-white/55">
                      No saved bank accounts yet.
                    </div>
                  ) : (
                    <Select
                      value={bankAccountId || undefined}
                      onValueChange={setBankAccountId}
                      disabled={banksLoading}
                    >
                      <SelectTrigger className="h-11 w-full rounded-[8px] border-[#D6D6D6] bg-white px-3.5 text-[14px] font-medium text-[#111111] shadow-none dark:border-white/15 dark:bg-transparent dark:text-white">
                        <SelectValue placeholder="Select a bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.accountName} · {formatWalletBankLabel(bank)}
                            {bank.isPrimary ? " (Primary)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <span className="text-[#8A8A8A] dark:text-white/45">
                      Bank account
                    </span>
                    <Link
                      href={routes.settingsBankDetails}
                      className="inline-flex items-center gap-1 font-semibold text-[#960018] hover:underline"
                    >
                      <Plus
                        className="size-3.5"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      Add bank account
                    </Link>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="withdrawAmount"
                    className="mb-1.5 block text-[13px] font-semibold text-[#111111] dark:text-white"
                  >
                    Withdrawal amount
                  </label>
                  <input
                    id="withdrawAmount"
                    name="withdrawAmount"
                    inputMode="decimal"
                    placeholder="₦0.00"
                    value={amountInputValue}
                    onFocus={() => {
                      setAmountFocused(true);
                      if (amountKobo > 0) {
                        setAmountNaira(String(amountKobo / 100));
                      }
                    }}
                    onBlur={() => setAmountFocused(false)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d.]/g, "");
                      setAmountNaira(raw);
                    }}
                    className="h-11 w-full rounded-[8px] border border-[#D6D6D6] bg-white px-3.5 text-[14px] font-medium text-[#111111] outline-none transition-[border-color,box-shadow] placeholder:text-[#A3A3A3] focus:border-[#960018] focus:ring-2 focus:ring-[#960018]/15 dark:border-white/15 dark:bg-transparent dark:text-white"
                  />
                  <p className="mt-2 text-[12px] text-[#8A8A8A] dark:text-white/45">
                    Available to withdraw:{" "}
                    {formatWalletAmount(wallet.availableKobo)}
                    {wallet.payoutHeldKobo > 0
                      ? ` · ${formatWalletAmount(wallet.payoutHeldKobo)} held for a withdrawal in progress`
                      : ""}
                  </p>
                </div>

                <div className="flex items-start gap-2.5 rounded-[10px] bg-[#F5F5F5] px-3.5 py-3 dark:bg-white/6">
                  <Info
                    className="mt-0.5 size-4 shrink-0 text-[#8A8A8A]"
                    aria-hidden
                  />
                  <p className="text-[12px] leading-relaxed text-[#6B6B6B] dark:text-white/60">
                    Check your bank details before continuing. We email a code
                    before any transfer starts.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[14px] border border-[#E5E5E5] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#1a1a22] sm:px-6 sm:py-6">
              <h2 className="text-[16px] font-bold tracking-tight text-[#111111] dark:text-white">
                Withdrawal summary
              </h2>

              <p className="mt-4 text-[28px] leading-none font-bold tracking-tight tabular-nums text-[#111111] dark:text-white">
                {amountKobo > 0
                  ? formatWalletAmount(amountKobo)
                  : formatWalletAmount(0)}
              </p>
              <p className="mt-2 text-[13px] text-[#6B6B6B] dark:text-white/55">
                {selectedBank
                  ? `To ${formatWalletBankLabel(selectedBank)}`
                  : "Select a bank account"}
              </p>

              <dl className="mt-5 text-[13px]">
                <div className="flex items-center justify-between gap-3 border-t border-[#EFEFEF] py-3 dark:border-white/10">
                  <dt className="text-[#6B6B6B] dark:text-white/55">From</dt>
                  <dd className="font-semibold text-[#111111] dark:text-white">
                    Blivap wallet
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[#EFEFEF] py-3 dark:border-white/10">
                  <dt className="text-[#6B6B6B] dark:text-white/55">
                    Currency
                  </dt>
                  <dd className="font-semibold text-[#111111] dark:text-white">
                    {wallet.currency || "NGN"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[#EFEFEF] py-3 dark:border-white/10">
                  <dt className="text-[#6B6B6B] dark:text-white/55">Fees</dt>
                  <dd className="font-semibold text-[#111111] dark:text-white">
                    None from Blivap
                  </dd>
                </div>
              </dl>

              <div className="border-t border-[#EFEFEF] pt-4 dark:border-white/10">
                <p className="text-[12px] text-[#6B6B6B] dark:text-white/55">
                  Wallet balance after withdrawal amount
                </p>
                <p className="mt-2 text-[24px] leading-none font-bold tracking-tight tabular-nums text-[#111111] dark:text-white">
                  {formatWalletAmount(afterBalanceKobo)}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <Button
                  type="button"
                  className="h-11 w-full rounded-[8px] bg-[#960018] text-[14px] font-semibold text-white hover:bg-[#7d0014]"
                  disabled={!canReview || loading || banksLoading}
                  onClick={goToReview}
                >
                  Review withdrawal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-[8px] border-[#D6D6D6] bg-white text-[14px] font-semibold text-[#111111] hover:bg-[#FAFAFA] dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
                  onClick={() => router.push(routes.wallet)}
                >
                  Cancel
                </Button>
              </div>

              <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#8A8A8A] dark:text-white/45">
                <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                Nothing is sent until you review and confirm with an email code.
              </p>
            </div>

            <p className="text-center text-[13px] leading-relaxed text-[#6B6B6B] dark:text-white/55">
              Have a question about a withdrawal?
              <br />
              <Link
                href={routes.settingsHelpSupport}
                className="font-semibold text-[#960018] hover:underline"
              >
                Contact support
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

export default function WalletWithdrawPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="mx-auto flex w-full flex-col pb-10 sm:p-12">
            <p className="text-sm text-text-secondary">Loading…</p>
          </div>
        </Layout>
      }
    >
      <WalletWithdrawPageContent />
    </Suspense>
  );
}
