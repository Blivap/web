"use client";

import { Suspense } from "react";
import { Layout } from "@/layout/layout.component";
import { useWallet } from "@/hooks/wallet/useWallet.hook";
import { useWalletTopup } from "@/hooks/wallet/useWalletTopup.hook";
import { WalletPageView } from "./components/wallet-page.view";
import { WalletPageSkeleton } from "./components/wallet-page-skeleton.component";

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
      <Suspense fallback={<WalletPageSkeleton />}>
        <WalletPageContent />
      </Suspense>
    </Layout>
  );
}
