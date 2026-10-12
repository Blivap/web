"use client";

import { Download, Share2 } from "lucide-react";
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
import type { WalletReceipt } from "@/lib/wallet/buildWalletReceipt";

type WalletReceiptDialogProps = {
  open: boolean;
  receipt: WalletReceipt | null;
  busy?: "download" | "share" | null;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
  onShare: () => void;
};

export function WalletReceiptDialog({
  open,
  receipt,
  busy = null,
  onOpenChange,
  onDownload,
  onShare,
}: WalletReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md" showCloseButton>
        <DialogHeader className="border-b border-[#F0EEEB] px-5 py-4 pr-12 dark:border-white/10">
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        {receipt ? (
          <div className="px-5 py-5">
            <article className="rounded-2xl border border-dashed border-[#D4D0CB] bg-[#FFFEFA] px-5 py-6 shadow-inner dark:border-white/15 dark:bg-[#14141a]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                Blivap Wallet
              </p>
              <h3 className="mt-2 text-xl font-semibold text-text-primary">
                {receipt.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {receipt.description}
              </p>

              <p
                className={classNames(
                  "mt-5 font-helvetica text-3xl font-bold tracking-tight tabular-nums",
                  receipt.direction === "credit"
                    ? "text-[#166534] dark:text-emerald-300"
                    : "text-primary",
                )}
              >
                {receipt.signedAmountLabel}
              </p>
              <span
                className={classNames(
                  "mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  receipt.direction === "credit"
                    ? "bg-[#DCFCE8] text-[#166534] dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-[#FFF5F5] text-primary dark:bg-primary/15",
                )}
              >
                {receipt.directionLabel}
              </span>

              <dl className="mt-6 flex flex-col gap-0 border-t border-dashed border-[#E5E7EB] pt-2 dark:border-white/15">
                <ReceiptRow label="Date" value={receipt.whenLabel} />
                <ReceiptRow label="Type" value={receipt.typeLabel} />
                <ReceiptRow label="Currency" value={receipt.currency} />
                <ReceiptRow label="Account" value={receipt.accountLabel} />
                {receipt.bookingLabel ? (
                  <ReceiptRow label="Booking" value={receipt.bookingLabel} />
                ) : null}
                <ReceiptRow label="Reference" value={receipt.referenceHint} />
              </dl>

              <p className="mt-5 text-[11px] leading-relaxed text-text-tertiary">
                Generated from your Blivap wallet activity. Support credits
                follow Nigerian voluntary donation principles.
              </p>
            </article>
          </div>
        ) : null}

        <DialogFooter className="border-t border-[#F0EEEB] px-5 py-4 dark:border-white/10 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md px-4 text-xs font-semibold"
            disabled={!receipt || busy === "share"}
            loading={busy === "share"}
            onClick={onShare}
          >
            <Share2 className="size-3.5" aria-hidden />
            Share
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-md px-4 text-xs font-semibold"
            disabled={!receipt || busy === "download"}
            loading={busy === "download"}
            onClick={onDownload}
          >
            <Download className="size-3.5" aria-hidden />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] py-2.5 text-xs last:border-b-0 dark:border-white/10">
      <dt className="shrink-0 text-text-tertiary">{label}</dt>
      <dd className="text-right font-semibold break-all text-text-primary">
        {value}
      </dd>
    </div>
  );
}
