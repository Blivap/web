"use client";

import { Layout } from "@/layout/layout.component";
import { WalletPageView } from "./components/wallet-page.view";

export default function WalletPage() {
  return (
    <Layout>
      <div className="-mx-4 min-h-[min(100%,480px)] px-4 py-6 xl:-mx-7 xl:px-7 xl:py-8">
        <header className="mb-6 max-w-lg">
          <h1 className="font-helvetica text-2xl font-bold text-text-primary">
            Wallet
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Support and appreciation for donors — ethical, transparent, and
            aligned with voluntary donation in Nigeria.
          </p>
        </header>
        <WalletPageView />
      </div>
    </Layout>
  );
}
