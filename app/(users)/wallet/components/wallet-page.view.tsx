"use client";

import { Button } from "@/components/button/button.component";
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import { useWalletReceipt } from "@/hooks/wallet/useWalletReceipt.hook";
import type { WalletSummary } from "@/types/wallet";
import { WalletBalanceHero } from "./wallet-balance-hero.component";
import { WalletInfoContent } from "./wallet-info-content.component";
import { WalletLedgerList } from "./wallet-ledger-list.component";
import { WalletReceiptDialog } from "./wallet-receipt-dialog.component";
import { WalletTopupForm } from "./wallet-topup-form.component";

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
  const {
    receipt,
    open,
    openReceipt,
    closeReceipt,
    download,
    share,
    busy,
  } = useWalletReceipt(wallet.currency);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-10">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">
            Wallet
          </h1>
          <InfoHint
            title="About your wallet"
            description="How Blivap wallet funds work for donor welfare."
            label="Wallet information"
          >
            <WalletInfoContent />
          </InfoHint>
        </div>
        <p className="text-sm text-text-secondary">
          Track available balance, held welfare funds, and ledger activity.
        </p>
      </header>

      {verifyingTopup ? (
        <div className="rounded-xl border border-primary/20 bg-[#FFF9F9] px-4 py-3 text-sm text-text-secondary dark:bg-primary/10">
          Confirming your Paystack payment…
        </div>
      ) : null}

      <WalletBalanceHero
        availableKobo={wallet.availableKobo}
        heldKobo={wallet.heldKobo}
        currency={wallet.currency}
        loading={loading && !verifyingTopup}
      />

      <WalletTopupForm
        currency={wallet.currency}
        starting={startingTopup}
        disabled={loading || verifyingTopup}
        onSubmit={onStartTopup}
      />

      {error && !loading ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/20 bg-[#FFF9F9] px-4 py-4 dark:bg-primary/10">
          <p className="text-sm text-text-secondary">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-md px-4 text-xs font-semibold"
            onClick={onRetry}
          >
            Try again
          </Button>
        </div>
      ) : null}

      <WalletLedgerList
        entries={wallet.entries}
        currency={wallet.currency}
        loading={loading && !verifyingTopup}
        previewLimit={3}
        showMoreLink
        onSelectEntry={openReceipt}
      />

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
