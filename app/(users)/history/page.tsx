"use client";

import { Suspense } from "react";
import { Button } from "@/components/button/button.component";
import { Layout } from "@/layout/layout.component";
import { useWallet } from "@/hooks/wallet/useWallet.hook";
import { useWalletReceipt } from "@/hooks/wallet/useWalletReceipt.hook";
import { WalletLedgerList } from "@/app/(users)/wallet/components/wallet-ledger-list.component";
import { WalletLedgerSkeleton } from "@/app/(users)/wallet/components/wallet-page-skeleton.component";
import { WalletReceiptDialog } from "@/app/(users)/wallet/components/wallet-receipt-dialog.component";
import Link from "next/link";
import { routes } from "@/config/routes";

function HistoryPageContent() {
  const { wallet, loading, error, reload } = useWallet();
  const { receipt, open, openReceipt, closeReceipt, download, share, busy } =
    useWalletReceipt(wallet.currency);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-text-primary sm:text-2xl mt-12">
          History
        </h1>
        <p className="text-sm text-text-secondary">
          Full wallet activity, newest first. Open any entry for a receipt.
        </p>
        <Link
          href={routes.wallet}
          className="mt-1 w-fit text-sm font-semibold text-primary hover:underline"
        >
          Back to wallet
        </Link>
      </header>

      {error && !loading ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/20 bg-[#FFF9F9] px-4 py-4 dark:bg-primary/10">
          <p className="text-sm text-text-secondary">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-md px-4 text-xs font-semibold"
            onClick={() => {
              void reload();
            }}
          >
            Try again
          </Button>
        </div>
      ) : null}

      <WalletLedgerList
        entries={wallet.entries}
        currency={wallet.currency}
        loading={loading}
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

export default function HistoryPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex w-full min-w-0 flex-col gap-6 pb-10">
            <div className="flex flex-col gap-1">
              <div className="h-7 w-32 animate-pulse rounded-md bg-[#E8E6E3] sm:h-8 dark:bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded-md bg-[#E8E6E3] dark:bg-white/10" />
            </div>
            <WalletLedgerSkeleton />
          </div>
        }
      >
        <HistoryPageContent />
      </Suspense>
    </Layout>
  );
}
