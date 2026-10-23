"use client";

import classNames from "classnames";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { PageSizeSelect } from "@/components/ui/page-size-select.component";
import { usePageSize } from "@/hooks/navigation/usePageSize.hook";
import {
  useQueryParamNumber,
  useSetQueryParams,
} from "@/hooks/navigation/useQueryParamState.hook";
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
  /** Supporting line under the empty-state title. */
  emptyDescription?: string;
  /** Stretch the list card to fill the remaining page height. */
  fill?: boolean;
  /** When set, table renders a fourth column for `actionsSlot` on each row. */
  actionsColumnLabel?: string;
  /** Controls aligned to the right of the list title. */
  headerAside?: ReactNode;
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
  return highlight ? "bg-primary/5 ring-1 ring-inset ring-primary/30" : "";
}

function bookingDesktopHighlightClass(highlight: boolean | undefined): string {
  if (!highlight) return "";
  const tint = "color-mix(in_srgb,#960018_7%,#fff)";
  const tintDark = "color-mix(in_srgb,#960018_16%,#1a1a22)";
  return [
    "[&>td]:border-transparent",
    "[&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg",
    `[&>td:first-child]:bg-[linear-gradient(90deg,transparent_0.5rem,${tint}_0.5rem)]`,
    `[&>td:nth-child(2)]:bg-[${tint}] [&>td:nth-child(3)]:bg-[${tint}]`,
    `[&>td:last-child]:bg-[linear-gradient(270deg,transparent_0.5rem,${tint}_0.5rem)]`,
    `dark:[&>td:first-child]:bg-[linear-gradient(90deg,transparent_0.5rem,${tintDark}_0.5rem)]`,
    `dark:[&>td:nth-child(2)]:bg-[${tintDark}] dark:[&>td:nth-child(3)]:bg-[${tintDark}]`,
    `dark:[&>td:last-child]:bg-[linear-gradient(270deg,transparent_0.5rem,${tintDark}_0.5rem)]`,
  ].join(" ");
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
        {title ? (
          <p className="truncate text-sm font-medium text-text-primary">
            {title}
          </p>
        ) : null}
        {subtitle ? (
          <p className="truncate text-xs text-text-tertiary">{subtitle}</p>
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
    <div className="flex flex-nowrap items-center gap-1.5">
      <BookingStatusPill variant={pillVariant}>{pillLabel}</BookingStatusPill>
      {reported ? (
        <span
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#374151] text-[9px] font-bold text-white dark:bg-white/15"
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
  fill = false,
}: BookingsRowsTableProps & { fill?: boolean }) {
  const [page, setPage] = useQueryParamNumber("page", 1, { omitWhen: 1 });
  const [pageSize, setPageSize] = usePageSize();
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages, setPage]);

  const paginatedRows = useMemo(() => {
    if (rows.length <= pageSize) {
      return rows;
    }
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, safePage, pageSize]);

  const pageItems = useMemo(
    () => bookingPaginationPages(safePage, totalPages),
    [safePage, totalPages],
  );

  const hasRows = rows.length > 0;

  return (
    <div
      className={classNames(
        "flex flex-col",
        fill && "min-h-0 flex-1",
      )}
    >
      <div
        className={classNames(
          "mt-3 border-t border-border pt-3 dark:border-white/10",
          fill && "min-h-0 flex-1 overflow-y-auto",
        )}
      >
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
                  <div className="flex flex-nowrap items-center justify-between gap-2">
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
            className={`w-full border-separate border-spacing-0 text-left ${actionsColumnLabel ? "min-w-130" : "min-w-100"}`}
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[1%] whitespace-nowrap pb-2 pr-3 pl-3 text-[11px] font-medium uppercase tracking-wide text-text-tertiary"
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
                    className="w-[1%] pb-2 pr-3 text-end text-[11px] font-medium uppercase tracking-wide text-text-tertiary"
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
                    className={bookingDesktopHighlightClass(row.highlight)}
                  >
                    <td className="whitespace-nowrap border-t border-[#F3F4F6] py-3 pr-3 pl-3 align-middle text-xs text-text-secondary dark:border-white/10">
                      {row.dateCol}
                    </td>
                    <td className="border-t border-[#F3F4F6] py-3 pr-3 align-middle dark:border-white/10">
                      <BookingRowMeta
                        title={row.title}
                        subtitle={row.subtitle}
                        avatarUrl={row.avatarUrl}
                      />
                    </td>
                    <td className="whitespace-nowrap border-t border-[#F3F4F6] py-3 pr-3 align-middle dark:border-white/10">
                      <BookingRowStatus
                        pillLabel={row.pillLabel}
                        pillVariant={row.pillVariant}
                        reported={row.reported}
                      />
                    </td>
                    {actionsColumnLabel ? (
                      <td className="border-t border-[#F3F4F6] py-3 pr-3 align-middle dark:border-white/10">
                        <div className="flex flex-row flex-nowrap items-center justify-end gap-1">
                          {row.actionsSlot ?? (
                            <span className="text-xs text-text-tertiary">
                              —
                            </span>
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
        <div className="mt-4 flex shrink-0 flex-col gap-3 rounded-lg border border-border bg-[#F9FAFB] px-3 py-3 dark:border-white/10 dark:bg-white/6 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <p className="text-center text-xs text-text-secondary sm:text-left">
              Page{" "}
              <span className="font-semibold text-text-primary">{safePage}</span>{" "}
              of{" "}
              <span className="font-semibold text-text-primary">
                {totalPages}
              </span>
            </p>
            <PageSizeSelect value={pageSize} onChange={setPageSize} />
          </div>
          <Pagination className="mx-0 w-full min-w-0 shrink-0 sm:ms-auto sm:w-auto sm:justify-end">
            <PaginationContent className="flex-wrap justify-center gap-1 sm:justify-end">
              <PaginationItem>
                <PaginationPrevious
                  aria-label="Previous page"
                  disabled={safePage <= 1}
                  onClick={() => setPage(Math.max(1, safePage - 1))}
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
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}

export function BookingsSingleList(props: BookingsTabBodyProps) {
  return <BookingsTabBody {...props} />;
}

function BookingsEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <Image
        src="/svg/nodata.svg"
        alt=""
        width={112}
        height={112}
        className="size-28"
      />
      <p className="mt-4 text-sm font-semibold text-text-primary">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
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
  emptyDescription,
  fill = false,
  actionsColumnLabel,
  headerAside,
}: BookingsTabBodyProps) {
  const [colA, colB, colC] = columnLabels;
  const colCount = actionsColumnLabel ? 4 : 3;
  const mainListCount = rows.length;

  const rowIdsKey = useMemo(() => rows.map((r) => r.id).join("|"), [rows]);

  const bannerBeforeSummaries =
    panelBanner && !bannerInListCard ? panelBanner : null;
  const bannerInsideCard = panelBanner && bannerInListCard ? panelBanner : null;
  return (
    <div
      className={classNames("flex flex-col gap-3", fill && "min-h-0 flex-1")}
    >
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

      <section
        className={classNames(
          "rounded-xl border border-border bg-white px-4 py-4 dark:border-white/10 dark:bg-[#1a1a22] sm:px-5",
          fill && "flex min-h-0 flex-1 flex-col",
        )}
      >
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
        {rows.length > 0 || headerAside ? (
          <div
            className={`flex items-center justify-between gap-3 ${listEyebrow || bannerInsideCard ? "mt-3" : ""}`}
          >
            <h2 className="text-sm font-semibold text-text-primary sm:text-base">
              {mainListTitle}{" "}
              <span className="font-medium text-text-tertiary">
                ({mainListCount})
              </span>
            </h2>
            {headerAside ? (
              <div className="shrink-0">{headerAside}</div>
            ) : null}
          </div>
        ) : null}
        {rows.length === 0 ? (
          <BookingsEmptyState
            title={tableEmptyMessage}
            description={emptyDescription}
          />
        ) : (
          <BookingsRowsTable
            key={rowIdsKey}
            rows={rows}
            colA={colA}
            colB={colB}
            colC={colC}
            colCount={colCount}
            actionsColumnLabel={actionsColumnLabel}
            tableEmptyMessage={tableEmptyMessage}
            fill={fill}
          />
        )}
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
  /** Kept so older callers still compile. The list skeleton no longer uses tabs. */
  tabLabels?: readonly string[];
};

function BookingsSk({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        "animate-pulse rounded-md bg-[#E5E7EB] dark:bg-white/10",
        className,
      )}
      aria-hidden
    />
  );
}

function BookingsMobileRowSkeleton() {
  return (
    <article className="rounded-xl border border-[#F3F4F6] bg-white p-3 dark:border-white/10 dark:bg-[#1a1a22]">
      <BookingsSk className="h-3 w-24" />
      <div className="mt-2.5 flex items-center gap-2.5">
        <BookingsSk className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <BookingsSk className="h-4 w-3/4 max-w-48" />
          <BookingsSk className="h-3 w-1/2 max-w-36" />
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <BookingsSk className="h-6 w-20 rounded-full" />
        <div className="flex gap-1">
          <BookingsSk className="size-9 rounded-md" />
          <BookingsSk className="size-9 rounded-md" />
        </div>
      </div>
    </article>
  );
}

function BookingsDesktopRowSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(5rem,auto)_1fr_minmax(5rem,auto)_minmax(5.5rem,auto)] items-center gap-3 border-t border-[#F3F4F6] py-3 dark:border-white/10">
      <BookingsSk className="h-3.5 w-20" />
      <div className="flex min-w-0 items-center gap-2.5">
        <BookingsSk className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <BookingsSk className="h-4 w-40 max-w-full" />
          <BookingsSk className="h-3 w-28 max-w-full" />
        </div>
      </div>
      <BookingsSk className="h-6 w-20 rounded-full" />
      <div className="flex justify-end gap-1">
        <BookingsSk className="size-9 rounded-md" />
        <BookingsSk className="size-9 rounded-md" />
      </div>
    </div>
  );
}

export function BookingsShellSkeleton(_props: BookingsShellSkeletonProps = {}) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-4"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading bookings…</span>

      <div className="flex flex-col gap-1">
        <BookingsSk className="h-8 w-36 sm:h-9 sm:w-44" />
        <BookingsSk className="h-4 w-72 max-w-full" />
      </div>

      <section className="rounded-xl border border-border bg-white px-4 py-4 dark:border-white/10 dark:bg-[#1a1a22] sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <BookingsSk className="h-5 w-28" />
          <div className="flex shrink-0 items-center gap-2">
            <BookingsSk className="h-9 w-44 rounded-md" />
            <BookingsSk className="h-9 w-40 rounded-md" />
          </div>
        </div>

        <div className="mt-3 border-t border-border pt-3 dark:border-white/10">
          <div className="flex flex-col gap-3 md:hidden">
            <BookingsMobileRowSkeleton />
            <BookingsMobileRowSkeleton />
            <BookingsMobileRowSkeleton />
          </div>

          <div className="hidden min-w-0 md:block">
            <div className="grid grid-cols-[minmax(5rem,auto)_1fr_minmax(5rem,auto)_minmax(5.5rem,auto)] gap-3 pb-2">
              <BookingsSk className="h-3 w-12" />
              <BookingsSk className="h-3 w-16" />
              <BookingsSk className="h-3 w-12" />
              <BookingsSk className="ms-auto h-3 w-14" />
            </div>
            <BookingsDesktopRowSkeleton />
            <BookingsDesktopRowSkeleton />
            <BookingsDesktopRowSkeleton />
            <BookingsDesktopRowSkeleton />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <BookingsSk className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <BookingsSk className="h-8 w-24 rounded-md" />
            <BookingsSk className="size-8 rounded-md" />
            <BookingsSk className="size-8 rounded-md" />
          </div>
        </div>
      </section>
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
  const setParams = useSetQueryParams();

  const tabValues = useMemo(() => tabs.map((t) => t.value), [tabs]);
  const activeTab = searchParams.get("tab") ?? defaultTab;
  const previousTabRef = useRef(activeTab);

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

  useEffect(() => {
    if (previousTabRef.current === activeTab) return;
    previousTabRef.current = activeTab;
    if (searchParams.get("page")) {
      setParams({ page: null });
    }
  }, [activeTab, searchParams, setParams]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-col gap-1">
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
