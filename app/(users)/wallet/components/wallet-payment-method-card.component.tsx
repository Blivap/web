"use client";

import Link from "next/link";
import { Check, CircleAlert } from "lucide-react";
import { routes } from "@/config/routes";
import { WalletPaymentMethodSkeleton } from "./wallet-page-skeleton.component";

type WalletPaymentMethodCardProps = {
  /** Saved card brand, e.g. "Visa". Omit when no card is on file. */
  brand?: string | null;
  last4?: string | null;
  expires?: string | null;
  loading?: boolean;
};

/**
 * Default payment method panel — visual match to wallet mock.
 * Card body is header + details only; actions sit below the card.
 */
export function WalletPaymentMethodCard({
  brand,
  last4,
  expires,
  loading = false,
}: WalletPaymentMethodCardProps) {
  const hasCard = Boolean(brand?.trim() && last4?.trim());

  if (loading) {
    return <WalletPaymentMethodSkeleton />;
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
        <div className="border-b border-[#EBEBEB] px-5 py-3.5 dark:border-white/10">
          <p className="text-[14px] text-[#757575] dark:text-white/55">
            Default payment method
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 py-5">
          {hasCard ? (
            <>
              <p className="text-[22px] font-medium leading-none tracking-tight text-[#111111] dark:text-white">
                {brand}{" "}
                <span className="tracking-[0.18em]" aria-hidden>
                  ••••
                </span>{" "}
                {last4}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-[#8A8A8A] dark:text-white/55">
                {expires ? `Expires ${expires} · ` : null}
                Saved securely
              </p>
            </>
          ) : (
            <>
              <p className="text-[22px] font-medium leading-none tracking-tight text-[#111111] dark:text-white">
                No card added
              </p>
              <p className="mt-2 text-[13px] leading-snug text-[#8A8A8A] dark:text-white/55">
                Add a bank account to withdraw and get reimbursed.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={routes.settingsBankDetails}
          className="inline-flex h-9 items-center rounded-[8px] border border-[#D6D6D6] bg-white px-3.5 text-[13px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          {hasCard ? "Manage methods" : "Add account"}
        </Link>
        {hasCard ? (
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
