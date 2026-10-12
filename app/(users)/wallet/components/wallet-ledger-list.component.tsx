"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import classNames from "classnames";
import {
  formatKoboAsNaira,
  formatWalletEntryWhen,
} from "@/lib/wallet/formatWalletMoney";
import { walletEntryCopy } from "@/lib/wallet/walletEntryPresentation";
import type { WalletLedgerEntry } from "@/types/wallet";
import { Skeleton } from "@/components/ui/skeleton.component";
import { routes } from "@/config/routes";

type WalletLedgerListProps = {
  entries: WalletLedgerEntry[];
  currency: string;
  loading?: boolean;
  /** When set, only this many newest entries are shown (e.g. wallet preview). */
  previewLimit?: number;
  showMoreLink?: boolean;
  onSelectEntry?: (entry: WalletLedgerEntry, index: number) => void;
};

export function WalletLedgerList({
  entries,
  currency,
  loading = false,
  previewLimit,
  showMoreLink = false,
  onSelectEntry,
}: WalletLedgerListProps) {
  const recentEntries = [...entries].sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  });
  const visibleEntries =
    typeof previewLimit === "number" && previewLimit >= 0
      ? recentEntries.slice(0, previewLimit)
      : recentEntries;
  const hasMore =
    showMoreLink &&
    typeof previewLimit === "number" &&
    entries.length > previewLimit;

  return (
    <section className="rounded-xl border border-[#E8E6E3] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-primary">
        {typeof previewLimit === "number" ? "Recent activity" : "Activity"}
      </h2>

      {loading ? (
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={`wallet-entry-sk-${i}`}
              className="h-16 w-full rounded-xl"
            />
          ))}
        </div>
      ) : null}

      {!loading && visibleEntries.length === 0 ? (
        <p className="mt-6 py-4 text-center text-sm text-text-secondary">
          No wallet activity yet. Top-ups and welfare payments will appear here.
        </p>
      ) : null}

      {!loading && visibleEntries.length > 0 ? (
        <ul className="mt-3 -mx-2 flex flex-col gap-0.5">
          {visibleEntries.map((entry, index) => {
            const copy = walletEntryCopy(entry.type, entry.label);
            const isCredit = entry.direction === "credit";
            const key = `${entry.type}-${entry.createdAt ?? "x"}-${entry.bookingId ?? index}-${entry.amountKobo}`;
            return (
              <li key={key}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#FAFAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:hover:bg-white/5"
                  onClick={() => onSelectEntry?.(entry, index)}
                >
                  <span
                    className={classNames(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      isCredit
                        ? "bg-[#DCFCE8] text-[#166534] dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-[#FFF5F5] text-primary dark:bg-primary/15",
                    )}
                    aria-hidden
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="size-4" strokeWidth={2} />
                    ) : (
                      <ArrowUpRight className="size-4" strokeWidth={2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        {copy.title}
                      </p>
                      <p
                        className={classNames(
                          "text-sm font-semibold tabular-nums",
                          isCredit
                            ? "text-[#166534] dark:text-emerald-300"
                            : "text-primary",
                        )}
                      >
                        {`${isCredit ? "+" : "−"}${formatKoboAsNaira(entry.amountKobo, { currency })}`}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {copy.description}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
                      <span>{formatWalletEntryWhen(entry.createdAt)}</span>
                      {entry.bookingId ? (
                        <span className="font-medium">
                          Booking {entry.bookingId.slice(0, 8)}…
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {hasMore ? (
        <div className="mt-4 border-t border-[#F0EEEB] pt-4 dark:border-white/10">
          <Link
            href={routes.history}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            More
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
