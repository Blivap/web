"use client";

import { useEffect, useMemo } from "react";
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
import { useDebouncedSearch } from "@/hooks/navigation/useDebouncedSearch.hook";
import { usePageSize } from "@/hooks/navigation/usePageSize.hook";
import {
  useQueryParam,
  useQueryParamNumber,
  useSetQueryParams,
} from "@/hooks/navigation/useQueryParamState.hook";
import type { WalletLedgerEntry } from "@/types/wallet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSizeSelect } from "@/components/ui/page-size-select.component";
import { WalletLedgerRowsSkeleton } from "./wallet-page-skeleton.component";

const LEDGER_TYPE_VALUES = [
  "all",
  "topup",
  "welfare_payment",
  "welfare_refund",
  "welfare_reimbursement",
  "withdrawal",
  "withdrawal_reversal",
] as const;


type TypeFilter =
  | "all"
  | "topup"
  | "welfare_payment"
  | "welfare_refund"
  | "welfare_reimbursement"
  | "withdrawal"
  | "withdrawal_reversal";

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
      return "Booking welfare";
    case "welfare_refund":
      return "Booking refund";
    case "welfare_reimbursement":
      return "Welfare reimbursement";
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
  if (type === "welfare_refund") {
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
    return ref ? `Meetup welfare · ${ref}` : "Meetup welfare";
  }
  if (entry.type === "welfare_refund") {
    return ref ? `Cancelled booking · ${ref}` : "Cancelled booking";
  }
  if (entry.type === "welfare_reimbursement") {
    return ref ? `Completed donation · ${ref}` : "Completed donation";
  }
  return walletEntryCopy(entry.type, entry.label).description;
}

function StatusPill({ status }: { status: WalletLedgerEntry["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex rounded-full bg-[#FFF1E6] px-2.5 py-1 text-[11px] font-semibold text-[#C2410C] dark:bg-orange-500/15 dark:text-orange-300">
        Pending
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex rounded-full bg-[#FEECEC] px-2.5 py-1 text-[11px] font-semibold text-[#B42318] dark:bg-red-500/15 dark:text-red-300">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-[#E8F6EE] px-2.5 py-1 text-[11px] font-semibold text-[#1B7A3F] dark:bg-emerald-500/15 dark:text-emerald-300">
      Successful
    </span>
  );
}

export function WalletLedgerList({
  entries,
  currency,
  loading = false,
  onSelectEntry,
}: WalletLedgerListProps) {
  const setParams = useSetQueryParams();
  const [urlQuery] = useQueryParam("q", "", { omitWhen: "" });
  const [typeFilter] = useQueryParam("type", "all", {
    omitWhen: "all",
    allowed: LEDGER_TYPE_VALUES,
  });
  const [monthFilter] = useQueryParam("month", "all", { omitWhen: "all" });
  const [page, setPage] = useQueryParamNumber("page", 1, { omitWhen: 1 });
  const [pageSize, setPageSize] = usePageSize();

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

  const resolvedType = (
    LEDGER_TYPE_VALUES.includes(typeFilter as TypeFilter)
      ? typeFilter
      : "all"
  ) as TypeFilter;
  const resolvedMonth =
    monthFilter === "all" || monthOptions.includes(monthFilter)
      ? monthFilter
      : "all";

  const filtered = useMemo(() => {
    const q = urlQuery.trim().toLowerCase();
    return sorted.filter((entry) => {
      if (resolvedType !== "all" && entry.type !== resolvedType) return false;
      if (resolvedMonth !== "all") {
        const key = monthKey(entry.createdAt);
        if (key !== resolvedMonth) return false;
      }
      if (!q) return true;
      const hay =
        `${displayTitle(String(entry.type), entry.label)} ${entrySubtitle(entry)} ${entry.bookingId ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sorted, urlQuery, resolvedType, resolvedMonth]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * pageSize;
  const pageEntries = filtered.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount, setPage]);

  const resetFilters = (updates: {
    q?: string | null;
    type?: string | null;
    month?: string | null;
  }) => {
    setParams({
      q: updates.q === undefined ? undefined : updates.q || null,
      type:
        updates.type === undefined
          ? undefined
          : updates.type === "all"
            ? null
            : updates.type,
      month:
        updates.month === undefined
          ? undefined
          : updates.month === "all"
            ? null
            : updates.month,
      page: null,
    });
  };

  const [query, setQuery] = useDebouncedSearch(urlQuery, (trimmed) => {
    resetFilters({ q: trimmed || null });
  });

  const pageButtons =
    pageCount <= 1
      ? []
      : Array.from({ length: Math.min(pageCount, 8) }, (_, i) => i + 1);

  return (
    <section className="mt-6 flex min-w-0 flex-col gap-4 sm:mt-8 sm:gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <h2 className="text-[16px] font-semibold tracking-tight text-[#111111] dark:text-white sm:text-[18px]">
          Transaction history
        </h2>
        <button
          type="button"
          disabled={loading || entries.length === 0}
          onClick={() => downloadWalletStatementCsv(filtered, currency)}
          className="inline-flex h-8 items-center rounded-[8px] border border-[#D4D4D4] bg-white px-3 text-[13px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:px-3.5 sm:text-[14px] dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          Export statement
        </button>
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9A9A9A] sm:left-3.5"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            name="transactionSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="h-10 w-full rounded-[10px] border border-[#E0E0E0] bg-white pr-3 pl-9 text-[13px] text-[#111111] outline-none placeholder:text-[#9A9A9A] focus:border-[#C4C4C4] focus:ring-2 focus:ring-[#960018]/10 sm:h-11 sm:pr-3.5 sm:pl-10 sm:text-[14px] dark:border-white/12 dark:bg-[#1a1a22] dark:text-white dark:placeholder:text-white/40"
          />
        </label>

        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
          <Select
            value={resolvedType}
            onValueChange={(v) => {
              resetFilters({ type: v });
            }}
          >
            <SelectTrigger className="h-10 w-full min-w-0 rounded-[10px] border-[#E0E0E0] bg-white text-[12px] font-medium text-[#111111] shadow-none sm:h-11 sm:w-[10.75rem] sm:text-[13px] dark:border-white/12 dark:bg-[#1a1a22] dark:text-white [&>span]:min-w-0 [&>span]:truncate">
              <SelectValue placeholder="All transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All transactions</SelectItem>
              <SelectItem value="topup">Wallet top-ups</SelectItem>
              <SelectItem value="welfare_payment">Booking welfare</SelectItem>
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
            value={resolvedMonth}
            onValueChange={(v) => {
              resetFilters({ month: v });
            }}
          >
            <SelectTrigger className="h-10 w-full min-w-0 rounded-[10px] border-[#E0E0E0] bg-white text-[12px] font-medium text-[#111111] shadow-none sm:h-11 sm:w-[10.75rem] sm:text-[13px] dark:border-white/12 dark:bg-[#1a1a22] dark:text-white [&>span]:min-w-0 [&>span]:truncate">
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
              ? "No wallet activity yet. Top-ups and welfare will appear here."
              : "No transactions match your filters."}
          </p>
        </div>
      ) : null}

      {!loading && pageEntries.length > 0 ? (
        <div className="min-w-0 overflow-hidden rounded-[14px] border border-[#E8E8E8] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#1a1a22]">
          <div className="overflow-x-auto px-3 pt-3 sm:px-6 sm:pt-4">
            <table className="w-full min-w-[40rem] border-collapse text-left sm:min-w-[52rem]">
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
                  const absoluteIndex = pageStart + index;
                  const key = `${entry.type}-${entry.createdAt ?? "x"}-${entry.reference ?? entry.bookingId ?? absoluteIndex}-${entry.amountKobo}`;
                  const canOpenReceipt = entry.status === "success";

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
                        <StatusPill status={entry.status} />
                      </td>
                      <td
                        className={classNames(
                          "py-[18px] pr-4 align-middle text-[14px] font-semibold tabular-nums",
                          entry.status === "failed"
                            ? "text-[#9A9A9A] line-through dark:text-white/40"
                            : isCredit
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
                        {canOpenReceipt ? (
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
                        ) : (
                          <span className="text-[13px] text-[#9A9A9A]">
                            {entry.status === "pending"
                              ? "Processing"
                              : "Unavailable"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEFEF] px-5 py-4 sm:px-6 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] text-[#8A8A8A]">
                Page{" "}
                <span className="font-semibold text-[#111111] dark:text-white">
                  {safePage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#111111] dark:text-white">
                  {pageCount}
                </span>
              </p>
              <PageSizeSelect value={pageSize} onChange={setPageSize} />
            </div>
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
