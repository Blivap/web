"use client";

import { Button } from "@/components/button/button.component";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatKoboAsNaira } from "@/lib/wallet/formatWalletMoney";
import type { WalletTopupFeeBreakdown } from "@/lib/wallet/estimateTopupFees";

type WalletTopupSummaryDialogProps = {
  open: boolean;
  currency: string;
  breakdown: WalletTopupFeeBreakdown | null;
  confirming?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function WalletTopupSummaryDialog({
  open,
  currency,
  breakdown,
  confirming = false,
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
