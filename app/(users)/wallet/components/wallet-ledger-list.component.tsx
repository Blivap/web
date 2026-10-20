"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
  RefreshCcw,
  Search,
} from "lucide-react";
import classNames from "classnames";
import { formatWalletSignedAmount } from "@/lib/wallet/formatWalletDisplay";
import { downloadWalletStatementCsv } from "@/lib/wallet/exportWalletStatement";
import { walletEntryCopy } from "@/lib/wallet/walletEntryPresentation";
import type { WalletLedgerEntry } from "@/types/wallet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WalletLedgerRowsSkeleton } from "./wallet-page-skeleton.component";

const PAGE_SIZE = 6;

type TypeFilter =
  | "all"
  | "topup"
  | "welfare_payment"
  | "welfare_refund"
  | "welfare_reimbursement"
  | "withdrawal"
  | "withdrawal_reversal";

type EntryStatus = "completed" | "pending";

type WalletLedgerListProps = {
  entries: WalletLedgerEntry[];
  currency: string;
  loading?: boolean;
  previewLimit?: number;
  showMoreLink?: boolean;
  onSelectEntry?: (entry: WalletLedgerEntry, index: number) => void;
};

function displayTitle(type: string, fallbackLabel: string): string {
  switch (type) {
    case "topup":
      return "Wallet top-up";
    case "welfare_payment":
      return "Booking payment";
    case "welfare_refund":
    case "welfare_reimbursement":
      return "Booking refund";
    case "withdrawal":
      return "Bank withdrawal";
    case "withdrawal_reversal":
      return "Withdrawal returned";
    default:
      return walletEntryCopy(type, fallbackLabel).title;
  }
}

function entryIcon(type: string, isCredit: boolean) {
  const cls = "size-[15px] text-[#6B7280]";
  if (type === "welfare_payment") {
    return <Calendar className={cls} strokeWidth={1.75} />;
  }
  if (type === "welfare_refund" || type === "welfare_reimbursement") {
    return <RefreshCcw className={cls} strokeWidth={1.75} />;
  }
  if (type === "topup" || isCredit) {
    return <ArrowDownLeft className={cls} strokeWidth={1.75} />;
  }
  return <ArrowUpRight className={cls} strokeWidth={1.75} />;
}

function monthKey(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function formatDateTwoLine(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "—", time: "" };
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
    return {
      date: d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

function entrySubtitle(entry: WalletLedgerEntry): string {
  const ref = entry.bookingId
    ? `BLV-${
        entry.bookingId
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 4)
          .toUpperCase() || entry.bookingId.slice(0, 4).toUpperCase()
      }`
    : null;

  if (entry.type === "topup") {
    return ref ? `Visa •••• 4242 · ${ref}` : "Visa •••• 4242 · Paystack";
  }
  if (entry.type === "welfare_payment") {
    return ref ? `Meetup booking · ${ref}` : "Meetup booking";
  }
  if (
    entry.type === "welfare_refund" ||
    entry.type === "welfare_reimbursement"
  ) {
    return ref ? `Cancelled booking · ${ref}` : "Cancelled booking";
  }
  return walletEntryCopy(entry.type, entry.label).description;
}

/** Ledger API has no status yet — treat all settled entries as completed. */
function entryStatus(): EntryStatus {
  return "completed";
}

export function WalletLedgerList({
  entries,
  currency,
  loading = false,
  onSelectEntry,
}: WalletLedgerListProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return (
        (Number.isFinite(bTime) ? bTime : 0) -
        (Number.isFinite(aTime) ? aTime : 0)
      );
    });
  }, [entries]);

  const monthOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const e of sorted) {
      const key = monthKey(e.createdAt);
      if (key) keys.add(key);
    }
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [sorted]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((entry) => {
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      if (monthFilter !== "all") {
        const key = monthKey(entry.createdAt);
        if (key !== monthFilter) return false;
      }
      if (!q) return true;
      const hay =
        `${displayTitle(String(entry.type), entry.label)} ${entrySubtitle(entry)} ${entry.bookingId ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sorted, query, typeFilter, monthFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1);
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEntries = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const resetPage = () => setPage(1);

  const pageButtons =
    pageCount <= 1
      ? []
      : Array.from({ length: Math.min(pageCount, 8) }, (_, i) => i + 1);

  return (
    <section className="flex flex-col gap-5 mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold tracking-tight text-[#111111] dark:text-white">
          Transaction history
        </h2>
        <button
          type="button"
          disabled={loading || entries.length === 0}
          onClick={() => downloadWalletStatementCsv(filtered, currency)}
          className="inline-flex h-9 items-center rounded-[8px] border border-[#D4D4D4] bg-white px-3.5 text-[14px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          Export statement
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9A9A9A]"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            name="transactionSearch"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="h-11 w-full rounded-[10px] border border-[#E0E0E0] bg-white pr-3.5 pl-10 text-[14px] text-[#111111] outline-none placeholder:text-[#9A9A9A] focus:border-[#C4C4C4] focus:ring-2 focus:ring-[#960018]/10 dark:border-white/12 dark:bg-[#1a1a22] dark:text-white dark:placeholder:text-white/40"
          />
        </label>

        <div className="flex flex-wrap gap-2.5">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as TypeFilter);
              resetPage();
            }}
          >
            <SelectTrigger className="h-11 w-[10.75rem] rounded-[10px] border-[#E0E0E0] bg-white text-[13px] font-medium text-[#111111] shadow-none dark:border-white/12 dark:bg-[#1a1a22] dark:text-white">
              <SelectValue placeholder="All transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All transactions</SelectItem>
              <SelectItem value="topup">Wallet top-ups</SelectItem>
              <SelectItem value="welfare_payment">Booking payments</SelectItem>
              <SelectItem value="welfare_refund">Booking refunds</SelectItem>
              <SelectItem value="welfare_reimbursement">
                Reimbursements
              </SelectItem>
              <SelectItem value="withdrawal">Bank withdrawals</SelectItem>
              <SelectItem value="withdrawal_reversal">
                Withdrawal returns
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={monthFilter}
            onValueChange={(v) => {
              setMonthFilter(v);
              resetPage();
            }}
          >
            <SelectTrigger className="h-11 w-[10.75rem] rounded-[10px] border-[#E0E0E0] bg-white text-[13px] font-medium text-[#111111] shadow-none dark:border-white/12 dark:bg-[#1a1a22] dark:text-white">
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {monthOptions.map((key) => (
                <SelectItem key={key} value={key}>
                  {monthLabel(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <WalletLedgerRowsSkeleton /> : null}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-[14px] border border-[#E8E8E8] bg-white px-5 py-12 text-center dark:border-white/10 dark:bg-[#1a1a22]">
          <p className="text-sm text-[#6B6B6B]">
            {entries.length === 0
              ? "No wallet activity yet. Top-ups and welfare payments will appear here."
              : "No transactions match your filters."}
          </p>
        </div>
      ) : null}

      {!loading && pageEntries.length > 0 ? (
        <div className="overflow-hidden rounded-[14px] border border-[#E8E8E8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#1a1a22]">
          <div className="overflow-x-auto px-5 pt-4 sm:px-6">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#EFEFEF] dark:border-white/10">
                  {(
                    [
                      ["Transaction", "w-[38%]"],
                      ["Date & time", "w-[16%]"],
                      ["Status", "w-[14%]"],
                      ["Amount", "w-[16%]"],
                      ["Receipt", "w-[16%]"],
                    ] as const
                  ).map(([label, width]) => (
                    <th
                      key={label}
                      className={classNames(
                        "pb-3.5 text-[12px] font-medium text-[#9A9A9A]",
                        width,
                        label !== "Receipt" ? "pr-4" : "",
                      )}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageEntries.map((entry, index) => {
                  const isCredit = entry.direction === "credit";
                  const when = formatDateTwoLine(entry.createdAt);
                  const status = entryStatus();
                  const absoluteIndex = pageStart + index;
                  const key = `${entry.type}-${entry.createdAt ?? "x"}-${entry.bookingId ?? absoluteIndex}-${entry.amountKobo}`;
                  const pending = status === "pending";

                  return (
                    <tr
                      key={key}
                      className="border-b border-[#F0F0F0] last:border-b-0 dark:border-white/8"
                    >
                      <td className="py-[18px] pr-4 align-middle">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#F4F4F5] dark:bg-white/8"
                            aria-hidden
                          >
                            {entryIcon(String(entry.type), isCredit)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-[#111111] dark:text-white">
                              {displayTitle(String(entry.type), entry.label)}
                            </p>
                            <p className="mt-0.5 truncate text-[12px] text-[#8A8A8A]">
                              {entrySubtitle(entry)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-[18px] pr-4 align-middle">
                        <p className="text-[13px] leading-snug text-[#3F3F3F] dark:text-white/80">
                          {when.date}
                        </p>
                        {when.time ? (
                          <p className="mt-0.5 text-[12px] leading-snug text-[#8A8A8A]">
                            {when.time}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-[18px] pr-4 align-middle">
                        {pending ? (
                          <span className="inline-flex rounded-full bg-[#FFF1E6] px-2.5 py-1 text-[11px] font-semibold text-[#C2410C] dark:bg-orange-500/15 dark:text-orange-300">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#E8F6EE] px-2.5 py-1 text-[11px] font-semibold text-[#1B7A3F] dark:bg-emerald-500/15 dark:text-emerald-300">
                            Completed
                          </span>
                        )}
                      </td>
                      <td
                        className={classNames(
                          "py-[18px] pr-4 align-middle text-[14px] font-semibold tabular-nums",
                          isCredit
                            ? "text-[#1B7A3F] dark:text-emerald-300"
                            : "text-[#111111] dark:text-white",
                        )}
                      >
                        {formatWalletSignedAmount(
                          entry.amountKobo,
                          isCredit ? "credit" : "debit",
                        )}
                      </td>
                      <td className="py-[18px] align-middle">
                        {pending ? (
                          <span className="text-[13px] text-[#9A9A9A]">
                            Processing
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#960018] hover:underline"
                            onClick={() =>
                              onSelectEntry?.(entry, absoluteIndex)
                            }
                          >
                            Receipt
                            <Download
                              className="size-3.5"
                              strokeWidth={2}
                              aria-hidden
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEFEF] px-5 py-4 sm:px-6 dark:border-white/10">
            <p className="text-[13px] text-[#8A8A8A]">
              Showing {pageStart + 1}–{pageStart + pageEntries.length} of{" "}
              {filtered.length} transaction
              {filtered.length === 1 ? "" : "s"}
            </p>
            {pageButtons.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {pageButtons.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Page ${n}`}
                    aria-current={n === safePage ? "page" : undefined}
                    onClick={() => setPage(n)}
                    className={classNames(
                      "inline-flex size-8 items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors",
                      n === safePage
                        ? "bg-[#960018] text-white"
                        : "border border-[#E0E0E0] bg-white text-[#4B4B4B] hover:bg-[#FAFAFA] dark:border-white/12 dark:bg-transparent dark:text-white dark:hover:bg-white/5",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
