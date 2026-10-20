"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import { useWalletReceipt } from "@/hooks/wallet/useWalletReceipt.hook";
import { routes } from "@/config/routes";
import type { WalletSummary } from "@/types/wallet";
import { WalletBalanceHero } from "./wallet-balance-hero.component";
import { WalletInfoContent } from "./wallet-info-content.component";
import { WalletLedgerList } from "./wallet-ledger-list.component";
import { WalletPaymentMethodCard } from "./wallet-payment-method-card.component";
import { WalletReceiptDialog } from "./wallet-receipt-dialog.component";
import { WalletTopupForm } from "./wallet-topup-form.component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WalletPageViewProps = {
  wallet: WalletSummary;
  loading: boolean;
  error: string | null;
  startingTopup?: boolean;
  verifyingTopup?: boolean;
  onRetry: () => void;
  onStartTopup: (amountKobo: number) => void | Promise<boolean>;
};

export function WalletPageView({
  wallet,
  loading,
  error,
  startingTopup = false,
  verifyingTopup = false,
  onRetry,
  onStartTopup,
}: WalletPageViewProps) {
  const [topupOpen, setTopupOpen] = useState(false);
  const { receipt, open, openReceipt, closeReceipt, download, share, busy } =
    useWalletReceipt(wallet.currency);

  const openTopup = () => setTopupOpen(true);

  return (
    <div className="mx-auto flex w-full flex-col sm:p-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-tight font-bold tracking-tight text-[#111111] dark:text-white sm:text-[26px]">
            Wallet
          </h1>
          <p className="mt-1.5 text-[14px] leading-snug text-[#6B6B6B] dark:text-white/60">
            Manage your balance, payment methods and booking payments.
          </p>
        </div>
        <p className="inline-flex shrink-0 items-center gap-1.5 pt-1 text-[12px] font-medium text-[#1F7A3F] dark:text-emerald-300">
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
          Your wallet is secure
        </p>
      </header>

      {verifyingTopup ? (
        <div className="rounded-[12px] border border-[#960018]/20 bg-[#FFF9F9] px-4 py-3 text-sm text-[#5A403F] dark:bg-primary/10 dark:text-white/80 mt-7">
          Confirming your Paystack payment…
        </div>
      ) : null}

      {error && !loading ? (
        <div className="flex flex-col items-start gap-3 rounded-[12px] border border-[#960018]/20 bg-[#FFF9F9] px-4 py-4 dark:bg-primary/10 mt-7">
          <p className="text-sm text-[#5A403F] dark:text-white/80">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-[8px] px-4 text-xs font-semibold"
            onClick={onRetry}
          >
            Try again
          </Button>
        </div>
      ) : null}

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
        <WalletBalanceHero
          availableKobo={wallet.availableKobo}
          heldKobo={wallet.heldKobo}
          currency={wallet.currency}
          loading={loading && !verifyingTopup}
          onFundWallet={openTopup}
        />
        <WalletPaymentMethodCard loading={loading && !verifyingTopup} />
      </div>

      <WalletLedgerList
        entries={wallet.entries}
        currency={wallet.currency}
        loading={loading && !verifyingTopup}
        onSelectEntry={openReceipt}
      />

      <p className="pt-2 text-center text-[14px] text-[#6B6B6B] dark:text-white/55 mt-5">
        Have a question about a payment?{" "}
        <Link
          href={routes.settingsHelpSupport}
          className="font-semibold text-[#960018] hover:underline"
        >
          Contact support
        </Link>
      </p>

      <Dialog
        open={topupOpen}
        onOpenChange={(next) => {
          if (!startingTopup) setTopupOpen(next);
        }}
      >
        <DialogContent
          className="max-w-md gap-0 p-0 sm:max-w-md"
          showCloseButton
        >
          <DialogHeader className="border-b border-[#F0EEEB] px-5 py-4 pr-12 dark:border-white/10">
            <DialogTitle>Add money</DialogTitle>
            <DialogDescription>
              Fund your Blivap wallet with Paystack.
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 py-5">
            <WalletTopupForm
              currency={wallet.currency}
              starting={startingTopup}
              disabled={loading || verifyingTopup}
              embedded
              onSubmit={async (amountKobo) => {
                const ok = await onStartTopup(amountKobo);
                if (ok) setTopupOpen(false);
                return ok;
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <WalletReceiptDialog
        open={open}
        receipt={receipt}
        busy={busy}
        onOpenChange={(next) => {
          if (!next) closeReceipt();
        }}
        onDownload={() => {
          void download();
        }}
        onShare={() => {
          void share();
        }}
      />
    </div>
  );
}
