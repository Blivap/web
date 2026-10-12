"use client";

import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { useWallet } from "@/hooks/wallet/useWallet.hook";
import { useWalletTopup } from "@/hooks/wallet/useWalletTopup.hook";
import { WalletPageView } from "./components/wallet-page.view";
import { Skeleton } from "@/components/ui/skeleton.component";

function WalletPageContent() {
  const { wallet, loading, error, reload, applyWallet } = useWallet();
  const { startTopup, starting, verifying } = useWalletTopup({
    onWalletUpdated: applyWallet,
  });

  return (
    <WalletPageView
      wallet={wallet}
      loading={loading}
      error={error}
      startingTopup={starting}
      verifyingTopup={verifying}
      onRetry={() => {
        void reload();
      }}
      onStartTopup={startTopup}
    />
  );
}

export default function WalletPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-10">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        }
      >
        <WalletPageContent />
      </Suspense>
    </Layout>
  );
}
