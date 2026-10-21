"use client";

import { Skeleton } from "@/components/ui/skeleton.component";

/** Full-page wallet placeholder matching the live layout. */
export function WalletPageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full min-w-0 flex-col sm:p-8 lg:p-12"
      aria-busy="true"
      aria-label="Loading wallet"
    >
      <header className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
          <Skeleton className="h-7 w-24 sm:h-8 sm:w-28" />
          <Skeleton className="h-3.5 w-64 max-w-full sm:mt-1 sm:h-4 sm:w-72" />
        </div>
        <Skeleton className="mt-0.5 h-3.5 w-32 sm:mt-1 sm:h-4 sm:w-36" />
      </header>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:mt-7 sm:gap-6 lg:grid-cols-[1.55fr_1fr]">
        <WalletBalanceHeroSkeleton />
        <WalletPaymentMethodSkeleton />
      </div>

      <WalletLedgerSkeleton />
    </div>
  );
}

export function WalletBalanceHeroSkeleton() {
  return (
    <div className="relative h-full min-h-[160px] overflow-hidden rounded-[14px] bg-[#960018] px-4 py-5 sm:min-h-[188px] sm:rounded-[16px] sm:px-7 sm:py-7">
      <div className="relative flex h-full min-h-[120px] flex-col sm:min-h-[140px]">
        <Skeleton className="h-4 w-32 bg-white/20 sm:h-6 sm:w-44" />
        <div className="mt-2.5 flex items-center gap-2 sm:mt-3 sm:gap-3">
          <Skeleton className="h-8 w-36 bg-white/25 sm:h-12 sm:w-56" />
          <Skeleton className="size-7 shrink-0 rounded-full bg-white/20 sm:size-8" />
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5 sm:gap-4 sm:pt-8">
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <Skeleton className="h-8 w-[5.75rem] rounded-full bg-white/20 sm:h-9 sm:w-[6.5rem]" />
            <Skeleton className="h-8 w-[6.5rem] rounded-full bg-white/20 sm:h-9 sm:w-[7.25rem]" />
          </div>
          <Skeleton className="h-3.5 w-24 bg-white/20 sm:h-4 sm:w-28" />
        </div>
      </div>
    </div>
  );
}

export function WalletPaymentMethodSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2.5 sm:gap-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
        <div className="border-b border-[#EBEBEB] px-4 py-3 dark:border-white/10 sm:px-5 sm:py-3.5">
          <Skeleton className="h-3.5 w-36 sm:h-4 sm:w-40" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2.5 px-4 py-4 sm:px-5 sm:py-5">
          <Skeleton className="h-6 w-40 sm:h-7 sm:w-48" />
          <Skeleton className="h-3.5 w-48 max-w-full sm:h-4 sm:w-56" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-[6.75rem] rounded-[8px] sm:h-9 sm:w-[7.5rem]" />
        <Skeleton className="h-3.5 w-20 sm:h-4 sm:w-24" />
      </div>
    </div>
  );
}

export function WalletLedgerRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E8E8E8] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
      <div className="hidden border-b border-[#F0F0F0] px-5 py-3 sm:grid sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)] sm:gap-4 dark:border-white/10">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
      <ul className="divide-y divide-[#F0F0F0] dark:divide-white/10">
        {Array.from({ length: rows }).map((_, i) => (
          <li
            key={`wallet-ledger-sk-${i}`}
            className="flex items-center gap-3 px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)] sm:gap-4 sm:px-5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36 max-w-full" />
                <Skeleton className="h-3 w-44 max-w-[85%]" />
              </div>
            </div>
            <div className="hidden sm:block">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </div>
            <div className="hidden sm:block">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="ml-auto space-y-1.5 text-right">
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="ml-auto h-3 w-14 sm:hidden" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WalletLedgerSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className="mt-8 flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-9 w-36 rounded-[8px]" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-11 min-w-0 flex-1 rounded-[10px]" />
        <div className="flex flex-wrap gap-2.5">
          <Skeleton className="h-11 w-[10.75rem] rounded-[10px]" />
          <Skeleton className="h-11 w-[10.75rem] rounded-[10px]" />
        </div>
      </div>

      <WalletLedgerRowsSkeleton rows={rows} />
    </section>
  );
}
