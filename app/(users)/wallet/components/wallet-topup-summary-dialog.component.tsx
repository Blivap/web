"use client";

import { Building2, CreditCard, Hash, Landmark } from "lucide-react";
import classNames from "classnames";
import { Button } from "@/components/button/button.component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatKoboAsNaira } from "@/lib/wallet/formatWalletMoney";
import type { WalletTopupFeeBreakdown } from "@/lib/wallet/estimateTopupFees";
import {
  WALLET_PAYMENT_METHODS,
  type WalletPaymentMethodId,
} from "@/lib/wallet/walletPaymentMethods";

const METHOD_ICON: Record<WalletPaymentMethodId, typeof CreditCard> = {
  card: CreditCard,
  bank: Building2,
  ussd: Hash,
  bank_transfer: Landmark,
};

type WalletTopupSummaryDialogProps = {
  open: boolean;
  currency: string;
  breakdown: WalletTopupFeeBreakdown | null;
  paymentMethod: WalletPaymentMethodId;
  confirming?: boolean;
  onPaymentMethodChange: (method: WalletPaymentMethodId) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function WalletTopupSummaryDialog({
  open,
  currency,
  breakdown,
  paymentMethod,
  confirming = false,
  onPaymentMethodChange,
  onOpenChange,
  onConfirm,
}: WalletTopupSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-[#F0EEEB] px-5 py-4 pr-12 dark:border-white/10">
          <DialogTitle>Payment summary</DialogTitle>
        </DialogHeader>

        {breakdown ? (
          <div className="flex flex-col gap-5 px-5 py-5">
            <div className="rounded-xl border border-[#E8E6E3] bg-[#FAFAF9] px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <SummaryRow
                label="Top-up amount"
                value={formatKoboAsNaira(breakdown.amountKobo, { currency })}
              />
              <SummaryRow
                label="Processing fee (est.)"
                value={formatKoboAsNaira(breakdown.processingFeeKobo, {
                  currency,
                })}
              />
              <SummaryRow
                label="VAT 7.5% (est.)"
                value={formatKoboAsNaira(breakdown.taxKobo, { currency })}
              />
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3 dark:border-white/10">
                <span className="text-sm font-semibold text-text-primary">
                  Amount charged
                </span>
                <span className="text-base font-bold tabular-nums text-primary">
                  {formatKoboAsNaira(breakdown.totalPayableKobo, { currency })}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-primary">
                Payment method
              </p>

              <ul className="mt-3 flex flex-col gap-2">
                {WALLET_PAYMENT_METHODS.map((method) => {
                  const Icon = METHOD_ICON[method.id];
                  const selected = paymentMethod === method.id;
                  return (
                    <li key={method.id}>
                      <button
                        type="button"
                        disabled={confirming}
                        onClick={() => onPaymentMethodChange(method.id)}
                        className={classNames(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-[#FFF5F5] dark:bg-primary/15"
                            : "border-[#E8E6E3] bg-white hover:border-primary/30 dark:border-white/10 dark:bg-[#1a1a22]",
                        )}
                      >
                        <span
                          className={classNames(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            selected
                              ? "bg-primary text-white"
                              : "bg-[#F4F4F5] text-text-secondary dark:bg-white/10",
                          )}
                        >
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-text-primary">
                            {method.label}
                          </span>
                          <span className="block text-xs text-text-secondary">
                            {method.description}
                          </span>
                        </span>
                        <span
                          className={classNames(
                            "size-4 shrink-0 rounded-full border-2",
                            selected
                              ? "border-primary bg-primary"
                              : "border-[#D1D5DB] bg-transparent",
                          )}
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}

        <DialogFooter className="border-t border-[#F0EEEB] px-5 py-4 dark:border-white/10 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md px-4 text-xs font-semibold"
            disabled={confirming}
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-md px-4 text-xs font-semibold"
            disabled={!breakdown || confirming}
            loading={confirming}
            onClick={onConfirm}
          >
            {confirming ? "Redirecting…" : "Continue to pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold tabular-nums text-text-primary">
        {value}
      </span>
    </div>
  );
}
