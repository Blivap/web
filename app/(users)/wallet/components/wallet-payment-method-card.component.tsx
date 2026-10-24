"use client";

import Link from "next/link";
import { Check, CircleAlert } from "lucide-react";
import { routes } from "@/config/routes";
import type { WalletBankAccount } from "@/types/wallet";
import { WalletNoPaymentMethodArt } from "./wallet-no-payment-method-art.component";
import { WalletPaymentMethodSkeleton } from "./wallet-page-skeleton.component";

type WalletPaymentMethodCardProps = {
  /** Primary (or first) saved bank account for withdrawals. */
  account?: WalletBankAccount | null;
  loading?: boolean;
};

/**
 * Default payment method panel — visual match to wallet mock.
 * Card body is header + details only; actions sit below the card.
 */
export function WalletPaymentMethodCard({
  account = null,
  loading = false,
}: WalletPaymentMethodCardProps) {
  const digits = account?.accountNumber.replace(/\D/g, "") ?? "";
  const last4 = digits.length >= 4 ? digits.slice(-4) : digits;
  const hasAccount = Boolean(account && last4);

  if (loading) {
    return <WalletPaymentMethodSkeleton />;
  }

  return (
    <div className="flex h-full flex-col gap-2.5 sm:gap-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
        <div className="border-b border-[#EBEBEB] px-4 py-3 dark:border-white/10 sm:px-5 sm:py-3.5">
          <p className="text-[13px] text-[#757575] dark:text-white/55 sm:text-[14px]">
            Default payment method
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 py-4 sm:px-5 sm:py-5">
          {hasAccount && account ? (
            <>
              <p className="truncate text-[18px] font-medium leading-none tracking-tight text-[#111111] dark:text-white sm:text-[22px]">
                {account.bankName}{" "}
                <span className="tracking-[0.18em]" aria-hidden>
                  ••••
                </span>{" "}
                {last4}
              </p>
              <p className="mt-2 truncate text-[12px] leading-snug text-[#8A8A8A] dark:text-white/55 sm:text-[13px]">
                {account.accountName} · Saved securely
              </p>
            </>
          ) : (
            <WalletNoPaymentMethodArt className="mx-auto h-auto w-full max-w-[13.5rem] sm:max-w-[17.5rem]" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={routes.settingsBankDetails}
          className="inline-flex h-8 items-center rounded-[8px] border border-[#D6D6D6] bg-white px-3 text-[12px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] sm:h-9 sm:px-3.5 sm:text-[13px] dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          {hasAccount ? "Manage methods" : "Add account"}
        </Link>
        {hasAccount ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-[#1B5E20] dark:text-emerald-300">
            <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[12px] text-[#8A8A8A] dark:text-white/50">
            <CircleAlert className="size-3.5" strokeWidth={2.25} aria-hidden />
            Not verified
          </span>
        )}
      </div>
    </div>
  );
}
