"use client";

import Link from "next/link";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { formatWalletAmount } from "@/lib/wallet/formatWalletDisplay";
import type { WalletPayout } from "@/types/wallet";
import { routes } from "@/config/routes";

type WalletWithdrawOtpViewProps = {
  payout: WalletPayout;
  otp: string;
  confirming: boolean;
  resending: boolean;
  onOtpChange: (value: string) => void;
  onConfirm: () => void;
  onResend: () => void;
  onBack: () => void;
};

export function WalletWithdrawOtpView({
  payout,
  otp,
  confirming,
  resending,
  onOtpChange,
  onConfirm,
  onResend,
  onBack,
}: WalletWithdrawOtpViewProps) {
  const otpValid = /^[A-Za-z0-9]{6}$/.test(otp);

  return (
    <div className="mx-auto flex w-full flex-col pb-10 sm:p-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#960018] hover:underline"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
        Back to review
      </button>

      <header className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h1 className=" text-2xl leading-tight font-bold tracking-tight text-[#111111] dark:text-white sm:text-[26px]">
            Confirm withdrawal
          </h1>
        </div>
        <p className="inline-flex shrink-0 items-center gap-1.5 pt-1 text-[12px] font-medium text-[#1F7A3F] dark:text-emerald-300">
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
          Your wallet is secure
        </p>
      </header>

      <section className="mt-7 rounded-[14px] border border-[#E5E5E5] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#1a1a22] sm:px-6 sm:py-6">
        <p className="text-[28px] leading-none font-bold tracking-tight tabular-nums text-[#111111] dark:text-white">
          {formatWalletAmount(payout.amountKobo)}
        </p>
        <p className="mt-2 text-[13px] text-[#6B6B6B] dark:text-white/55">
          To {payout.accountName} · {payout.bankName} •••• {payout.accountLast4}
        </p>

        <label
          htmlFor="payoutOtp"
          className="mt-6 mb-1.5 block text-[13px] font-semibold text-[#111111] dark:text-white"
        >
          Verification code
        </label>
        <input
          id="payoutOtp"
          name="payoutOtp"
          inputMode="text"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            onOtpChange(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 6))
          }
          placeholder="••••••"
          className="h-11 w-full rounded-[8px] border border-[#D6D6D6] bg-white px-3.5 text-center text-[18px] font-semibold tracking-[0.35em] text-[#111111] outline-none focus:border-[#960018] focus:ring-2 focus:ring-[#960018]/15 dark:border-white/15 dark:bg-transparent dark:text-white"
        />

        <div className="mt-5 flex flex-col gap-2.5">
          <Button
            type="button"
            className="h-11 w-full rounded-[8px] bg-[#960018] text-[14px] font-semibold text-white hover:bg-[#7d0014]"
            disabled={!otpValid || confirming}
            loading={confirming}
            onClick={onConfirm}
          >
            Confirm and send
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-[8px] border-[#D6D6D6] text-[14px] font-semibold"
            disabled={confirming || resending}
            loading={resending}
            onClick={onResend}
          >
            Resend code
          </Button>
        </div>

        <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#8A8A8A] dark:text-white/45">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Money stays in your wallet until this code is confirmed.
        </p>
      </section>

      <p className="mt-6 text-center text-[13px] text-[#6B6B6B] dark:text-white/55">
        Have a question about a withdrawal?
        <br />
        <Link
          href={routes.settingsHelpSupport}
          className="font-semibold text-[#960018] hover:underline"
        >
          Contact support
        </Link>
      </p>
    </div>
  );
}
