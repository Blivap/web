"use client";

import Link from "next/link";
import { ArrowLeft, Check, Info, Lock } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { formatWalletAmount } from "@/lib/wallet/formatWalletDisplay";
import { formatWalletBankLabel } from "@/lib/wallet/parseBankAccountResponse";
import type { WalletBankAccount } from "@/types/wallet";
import { routes } from "@/config/routes";
import { WalletWithdrawBalanceCard } from "./wallet-withdraw-balance-card.component";

type WalletWithdrawReviewViewProps = {
  availableKobo: number;
  heldKobo: number;
  currency: string;
  loading?: boolean;
  bank: WalletBankAccount;
  amountKobo: number;
  afterBalanceKobo: number;
  submitting?: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function WalletWithdrawReviewView({
  availableKobo,
  heldKobo,
  currency,
  loading = false,
  bank,
  amountKobo,
  afterBalanceKobo,
  submitting = false,
  onBack,
  onConfirm,
}: WalletWithdrawReviewViewProps) {
  return (
    <div className="mx-auto flex w-full flex-col pb-10 sm:p-12">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#960018] hover:underline"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
          Back to edit
        </button>

        <header className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <h1 className="text-[28px] leading-tight font-bold tracking-tight text-[#111111] dark:text-white sm:text-[26px]">
              Review withdrawal
            </h1>
            <p className="mt-1.5 text-[14px] leading-snug text-[#6B6B6B] dark:text-white/60">
              Check your withdrawal details. We will email a code before any
              money moves.
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
            availableKobo={availableKobo}
            heldKobo={heldKobo}
            currency={currency}
            loading={loading}
          />

          <section className="rounded-[14px] border border-[#E5E5E5] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#1a1a22] sm:px-6 sm:py-6">
            <h2 className="text-[16px] font-bold tracking-tight text-[#111111] dark:text-white">
              Withdrawal details
            </h2>

            <div className="mt-4 rounded-[10px] bg-[#F5F5F5] px-4 py-3 dark:bg-white/6">
              <p className="text-[12px] text-[#6B6B6B] dark:text-white/55">
                Withdraw to
              </p>
              <p className="mt-1 text-[14px] font-semibold text-[#111111] dark:text-white">
                {bank.accountName}
              </p>
              <p className="mt-0.5 text-[12px] text-[#6B6B6B] dark:text-white/55">
                {formatWalletBankLabel(bank)}
              </p>
            </div>

            <dl className="mt-2 text-[13px]">
              <div className="flex justify-between gap-3 border-b border-[#EFEFEF] py-3 dark:border-white/10">
                <dt className="text-[#6B6B6B] dark:text-white/55">From</dt>
                <dd className="font-semibold text-[#111111] dark:text-white">
                  Blivap wallet
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[#EFEFEF] py-3 dark:border-white/10">
                <dt className="text-[#6B6B6B] dark:text-white/55">
                  Withdrawal amount
                </dt>
                <dd className="font-semibold tabular-nums text-[#111111] dark:text-white">
                  {formatWalletAmount(amountKobo)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-3">
                <dt className="text-[#6B6B6B] dark:text-white/55">Currency</dt>
                <dd className="font-semibold text-[#111111] dark:text-white">
                  {currency || "NGN"}
                </dd>
              </div>
            </dl>

            <div className="mt-2 flex items-start gap-2.5 rounded-[10px] bg-[#F5F5F5] px-3.5 py-3 dark:bg-white/6">
              <Info
                className="mt-0.5 size-4 shrink-0 text-[#8A8A8A]"
                aria-hidden
              />
              <p className="text-[12px] leading-relaxed text-[#6B6B6B] dark:text-white/60">
                Next we email a one-time code. Your balance is not moved until
                you confirm that code.
              </p>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[14px] border border-[#E5E5E5] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#1a1a22] sm:px-6 sm:py-6">
            <h2 className="text-[16px] font-bold tracking-tight text-[#111111] dark:text-white">
              Confirm withdrawal
            </h2>
            <p className="mt-4 text-[28px] leading-none font-bold tracking-tight tabular-nums text-[#111111] dark:text-white">
              {formatWalletAmount(amountKobo)}
            </p>
            <p className="mt-2 text-[13px] text-[#6B6B6B] dark:text-white/55">
              To {formatWalletBankLabel(bank)}
            </p>

            <div className="mt-5 border-t border-[#EFEFEF] pt-4 dark:border-white/10">
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
                loading={submitting}
                disabled={submitting}
                onClick={onConfirm}
              >
                Send verification code
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-[8px] border-[#D6D6D6] bg-white text-[14px] font-semibold text-[#111111] hover:bg-[#FAFAFA] dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
                disabled={submitting}
                onClick={onBack}
              >
                Back to edit
              </Button>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#8A8A8A] dark:text-white/45">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Nothing is sent until you confirm the email code.
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
  );
}
