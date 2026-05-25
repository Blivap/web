"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BookingSectionCard } from "./booking-section-card";
import {
  BookingStatusPill,
  type BookingPillVariant,
} from "./booking-status-pill";

export type BookingsShellRow = {
  id: string;
  dateCol: string;
  title: string;
  subtitle?: ReactNode;
  pillLabel: string;
  pillVariant: BookingPillVariant;
  /** Trust & safety: show when API attached reports to this booking. */
  reported?: boolean;
  /** Other party’s photo (requester on donor view, donor on requester view). */
  avatarUrl?: string | null;
  /** Optional fourth column (e.g. donor actions). */
  actionsSlot?: ReactNode;
  /** Deep-link highlight (e.g. from notification `?bookingId=`). */
  highlight?: boolean;
};

export type BookingsShellSummary = {
  title: string;
  description: string;
};

export type BookingsTabPanel = {
  /** Optional hero / explainer (e.g. “sent · awaiting”). */
  panelBanner?: ReactNode;
  /** Render `panelBanner` at the top of the table card instead of above summary cards. */
  bannerInListCard?: boolean;
  /** Small uppercase label above the list title (e.g. “Sent bookings”). */
  listEyebrow?: string;
  summarySections: readonly BookingsShellSummary[];
  mainListTitle: string;
  columnLabels: readonly [string, string, string];
  rows: readonly BookingsShellRow[];
  /** Shown when `rows` is empty. */
  tableEmptyMessage?: string;
  /** When set, table renders a fourth column for `actionsSlot` on each row. */
  actionsColumnLabel?: string;
};

/** One tab: URL value, label, and panel content. */
export type BookingsShellTabItem = {
  value: string;
  label: string;
  panel: BookingsTabPanel;
};

/** Old bookmark URLs (?tab=active|referrals|archived) → slugs still used today. */
const LEGACY_TAB_QUERY: Record<string, string> = {
  active: "pending",
  referrals: "confirmed",
  archived: "past",
};

/** Rows per page; pagination footer still shows for shorter lists (single page). */
const BOOKINGS_TABLE_PAGE_SIZE = 8;

/** Page numbers + ellipsis for shadcn-style pagination controls. */
function bookingPaginationPages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev > 0 && p - prev > 1) {
      out.push("ellipsis");
    }
    out.push(p);
    prev = p;
  }
  return out;
}

const tabTriggerClass =
  "min-h-10 min-w-0 flex-1 basis-0 rounded-lg border-0 px-2 py-2.5 text-center text-xs font-medium transition-colors sm:px-3 sm:text-sm " +
  "border-b-0 data-[state=active]:border-b-0 " +
  "text-text-secondary hover:text-text-primary " +
  "data-[state=active]:border-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm " +
  "dark:data-[state=active]:bg-[#1a1a22] dark:data-[state=active]:text-primary " +
  "truncate";

type BookingsTabBodyProps = BookingsTabPanel;

type BookingsRowsTableProps = {
  rows: readonly BookingsShellRow[];
  colA: string;
  colB: string;
  colC: string;
  colCount: number;
  actionsColumnLabel?: string;
  tableEmptyMessage: string;
};

function bookingRowHighlightClass(highlight: boolean | undefined): string {
  return highlight
    ? "bg-primary/5 ring-2 ring-inset ring-primary/40"
    : "";
}

function BookingRowMeta({
  title,
  subtitle,
  avatarUrl,
}: {
  title: string;
  subtitle?: ReactNode;
  avatarUrl?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border dark:ring-white/10"
        />
      ) : (
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[10px] font-semibold uppercase text-text-tertiary dark:bg-white/8"
          aria-hidden
        >
          {title.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-text-tertiary">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BookingRowStatus({
  pillLabel,
  pillVariant,
  reported,
}: {
  pillLabel: string;
  pillVariant: BookingPillVariant;
  reported?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <BookingStatusPill variant={pillVariant}>{pillLabel}</BookingStatusPill>
      {reported ? (
        <span
          className="inline-flex size-5 items-center justify-center rounded-full bg-[#374151] text-[9px] font-bold text-white dark:bg-white/15"
          title="Reported"
        >
          !
        </span>
      ) : null}
    </div>
  );
}

function BookingsRowsTable({
  rows,
  colA,
  colB,
  colC,
  colCount,
  actionsColumnLabel,
  tableEmptyMessage,
}: BookingsRowsTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / BOOKINGS_TABLE_PAGE_SIZE),
  );
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedRows = useMemo(() => {
    if (rows.length <= BOOKINGS_TABLE_PAGE_SIZE) {
      return rows;
    }
    const start = (safePage - 1) * BOOKINGS_TABLE_PAGE_SIZE;
    return rows.slice(start, start + BOOKINGS_TABLE_PAGE_SIZE);
  }, [rows, safePage]);

  const pageItems = useMemo(
    () => bookingPaginationPages(safePage, totalPages),
    [safePage, totalPages],
  );

  const hasRows = rows.length > 0;
  const rangeFrom =
    rows.length === 0 ? 0 : (safePage - 1) * BOOKINGS_TABLE_PAGE_SIZE + 1;
  const rangeTo = Math.min(safePage * BOOKINGS_TABLE_PAGE_SIZE, rows.length);

  return (
    <>
      <div className="mt-3 border-t border-border pt-3 dark:border-white/10">
        <div className="flex flex-col gap-3 md:hidden">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-secondary">
              {tableEmptyMessage}
            </p>
          ) : (
            paginatedRows.map((row) => (
              <article
                key={row.id}
                data-booking-row-id={row.id}
                className={`rounded-xl border border-[#F3F4F6] bg-white p-3 dark:border-white/10 dark:bg-[#1a1a22] ${bookingRowHighlightClass(row.highlight)}`}
              >
                <div className="flex flex-col gap-2.5">
                  <p className="text-[11px] font-medium text-text-tertiary">
                    {row.dateCol}
                  </p>
                  <BookingRowMeta
                    title={row.title}
                    subtitle={row.subtitle}
                    avatarUrl={row.avatarUrl}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <BookingRowStatus
                      pillLabel={row.pillLabel}
                      pillVariant={row.pillVariant}
                      reported={row.reported}
                    />
                    {actionsColumnLabel ? (
                      <div className="flex shrink-0 items-center">
                        {row.actionsSlot ?? (
                          <span className="text-xs text-text-tertiary">—</span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table
            className={`w-full border-collapse text-left ${actionsColumnLabel ? "min-w-[520px]" : "min-w-[400px]"}`}
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[1%] whitespace-nowrap pb-2 pr-3 text-[11px] font-medium uppercase tracking-wide text-text-tertiary"
                >
                  {colA}
                </th>
                <th
                  scope="col"
                  className="pb-2 pr-3 text-[11px] font-medium uppercase tracking-wide text-text-tertiary"
                >
                  {colB}
                </th>
                <th
                  scope="col"
                  className="w-[1%] whitespace-nowrap pb-2 pr-3 text-[11px] font-medium uppercase tracking-wide text-text-tertiary"
                >
                  {colC}
                </th>
                {actionsColumnLabel ? (
                  <th
                    scope="col"
                    className="w-[1%] pb-2 text-end text-[11px] font-medium uppercase tracking-wide text-text-tertiary"
                  >
                    <span className="sr-only">{actionsColumnLabel}</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="py-10 text-center text-sm text-text-secondary"
                  >
                    {tableEmptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.id}
                    data-booking-row-id={row.id}
                    className={`border-t border-[#F3F4F6] dark:border-white/10 ${bookingRowHighlightClass(row.highlight)}`}
                  >
                    <td className="whitespace-nowrap py-3 pr-3 align-middle text-xs text-text-secondary">
                      {row.dateCol}
                    </td>
                    <td className="py-3 pr-3 align-middle">
                      <BookingRowMeta
                        title={row.title}
                        subtitle={row.subtitle}
                        avatarUrl={row.avatarUrl}
                      />
                    </td>
                    <td className="py-3 pr-3 align-middle">
                      <BookingRowStatus
                        pillLabel={row.pillLabel}
                        pillVariant={row.pillVariant}
                        reported={row.reported}
                      />
                    </td>
                    {actionsColumnLabel ? (
                      <td className="py-3 align-middle">
                        <div className="flex flex-row flex-nowrap items-center justify-end gap-1">
                          {row.actionsSlot ?? (
                            <span className="text-xs text-text-tertiary">—</span>
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {hasRows ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-[#F9FAFB] px-3 py-3 dark:border-white/10 dark:bg-white/6 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-center text-xs text-text-secondary sm:text-left">
            Showing{" "}
            <span className="font-semibold text-text-primary">
              {rangeFrom}–{rangeTo}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-text-primary">
              {rows.length}
            </span>
            {totalPages > 1 ? (
              <span className="text-text-tertiary">
                {" "}
                · Page {safePage} of {totalPages}
              </span>
            ) : null}
          </p>
          <Pagination className="mx-0 w-full min-w-0 shrink-0 sm:ms-auto sm:w-auto sm:justify-end">
            <PaginationContent className="flex-wrap justify-center gap-1.5 sm:justify-end">
              <PaginationItem>
                <PaginationPrevious
                  aria-label="Previous page"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              {totalPages > 1
                ? pageItems.map((item, idx) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`e-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={`page-${item}`}>
                        <PaginationLink
                          aria-label={`Page ${item}`}
                          isActive={item === safePage}
                          onClick={() => setPage(item)}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )
                : null}
              <PaginationItem>
                <PaginationNext
                  aria-label="Next page"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </>
  );
}

function BookingsTabBody({
  panelBanner,
  bannerInListCard,
  listEyebrow,
  summarySections,
  mainListTitle,
  columnLabels,
  rows,
  tableEmptyMessage = "Nothing here yet.",
  actionsColumnLabel,
}: BookingsTabBodyProps) {
  const [colA, colB, colC] = columnLabels;
  const colCount = actionsColumnLabel ? 4 : 3;
  const mainListCount = rows.length;

  const rowIdsKey = useMemo(() => rows.map((r) => r.id).join("|"), [rows]);

  const bannerBeforeSummaries =
    panelBanner && !bannerInListCard ? panelBanner : null;
  const bannerInsideCard = panelBanner && bannerInListCard ? panelBanner : null;

  return (
    <div className="flex flex-col gap-3">
      {bannerBeforeSummaries ? (
        <div className="w-full">{bannerBeforeSummaries}</div>
      ) : null}
      {summarySections.length > 0
        ? summarySections.map((section, i) => (
            <BookingSectionCard
              key={`${section.title}-${i}`}
              title={section.title}
            >
              {section.description}
            </BookingSectionCard>
          ))
        : null}

      <section className="rounded-xl border border-border bg-white px-4 py-4 dark:border-white/10 dark:bg-[#1a1a22] sm:px-5">
        {listEyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            {listEyebrow}
          </p>
        ) : null}
        {bannerInsideCard ? (
          <div className={`w-full ${listEyebrow ? "mt-2" : ""}`}>
            {bannerInsideCard}
          </div>
        ) : null}
        <h2
          className={`text-sm font-semibold text-text-primary sm:text-base ${listEyebrow || bannerInsideCard ? "mt-3" : ""}`}
        >
          {mainListTitle}{" "}
          <span className="font-medium text-text-tertiary">
            ({mainListCount})
          </span>
        </h2>
        <BookingsRowsTable
          key={rowIdsKey}
          rows={rows}
          colA={colA}
          colB={colB}
          colC={colC}
          colCount={colCount}
          actionsColumnLabel={actionsColumnLabel}
          tableEmptyMessage={tableEmptyMessage}
        />
      </section>
    </div>
  );
}

type BookingsShellProps = {
  tabs: readonly BookingsShellTabItem[];
  /** Must match one of `tabs[].value`; used when `?tab=` is missing or invalid. */
  defaultTab: string;
  /** Optional line under the page title (role-specific copy). */
  subtitle?: string;
};

type BookingsShellSkeletonProps = {
  /** Tab labels in display order (skeleton pill count). */
  tabLabels: readonly string[];
};

export function BookingsShellSkeleton({
  tabLabels,
}: BookingsShellSkeletonProps) {
  return (
    <div className="flex flex-col gap-5 animate-pulse" aria-hidden>
      <div className="h-9 w-48 rounded-md bg-[#E5E7EB] dark:bg-white/10" />

      <div className="flex flex-col gap-5">
        <div className="flex w-full flex-wrap gap-1 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] p-1 dark:border-white/10 dark:bg-white/5">
          {tabLabels.map((label, i) => (
            <div
              key={`sk-tab-${i}`}
              className={`min-w-0 flex-1 rounded-lg py-2.5 text-center text-sm ${
                i === 0 ? "bg-white dark:bg-[#1a1a22]" : "text-text-secondary"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <section className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-5 dark:border-white/10 dark:bg-[#1a1a22]">
          <div className="h-3.5 w-52 rounded bg-[#E5E7EB] dark:bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-[520px] rounded bg-[#E5E7EB] dark:bg-white/10" />
        </section>

        <section className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-5 dark:border-white/10 dark:bg-[#1a1a22]">
          <div className="h-6 w-64 rounded bg-[#E5E7EB] dark:bg-white/10" />
          <div className="mt-4 border-t border-[#E5E7EB] pt-4 dark:border-white/10">
            <div className="grid min-w-[680px] grid-cols-[180px_1fr_140px_170px] gap-4">
              <div className="h-3 w-20 rounded bg-[#E5E7EB] dark:bg-white/10" />
              <div className="h-3 w-32 rounded bg-[#E5E7EB] dark:bg-white/10" />
              <div className="h-3 w-16 rounded bg-[#E5E7EB] dark:bg-white/10" />
              <div className="h-3 w-20 rounded bg-[#E5E7EB] dark:bg-white/10" />
              <div className="col-span-4 h-px w-full bg-[#F3F4F6] dark:bg-white/10" />
              <div className="h-4 w-24 rounded bg-[#E5E7EB] dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-[#E5E7EB] dark:bg-white/10" />
                <div className="h-4 w-64 rounded bg-[#E5E7EB] dark:bg-white/10" />
              </div>
              <div className="h-6 w-20 rounded-full bg-[#E5E7EB] dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-7 w-28 rounded-md bg-[#E5E7EB] dark:bg-white/10" />
                <div className="h-6 w-24 rounded bg-[#E5E7EB] dark:bg-white/10" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function BookingsShell({
  tabs,
  defaultTab,
  subtitle,
}: BookingsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabValues = useMemo(() => tabs.map((t) => t.value), [tabs]);

  useEffect(() => {
    const raw = searchParams.get("tab");
    if (!raw || !LEGACY_TAB_QUERY[raw]) return;
    const next = LEGACY_TAB_QUERY[raw];
    if (!tabValues.includes(next)) return;
    const querySource =
      typeof window !== "undefined"
        ? window.location.search
        : `?${searchParams.toString()}`;
    const params = new URLSearchParams(
      querySource.startsWith("?") ? querySource.slice(1) : querySource,
    );
    params.set("tab", next);
    void router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, tabValues]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          Bookings
        </h1>
        {subtitle ? (
          <p className="max-w-xl text-xs text-text-secondary sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      <Tabs
        defaultValue={defaultTab}
        queryKey="tab"
        queryValues={tabValues}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <TabsList className="flex h-auto min-h-0 w-full flex-col items-stretch gap-1 rounded-xl border border-border bg-[#F3F4F6] p-1 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:flex-nowrap">
          {tabs.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={tabTriggerClass}
              title={item.label}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <BookingsTabBody {...item.panel} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
