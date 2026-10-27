"use client";

import classNames from "classnames";
import { UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListPaginationBar } from "@/components/ui/list-pagination-bar.component";
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
  /** When the booking was created. */
  dateCol: string;
  /** When the appointment is scheduled. */
  whenCol: string;
  /** Combined list: request received vs request sent. */
  direction?: "incoming" | "outgoing";
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
  columnLabels: readonly [string, string, string, string];
  rows: readonly BookingsShellRow[];
  /** Server total when `rows` is already a single page. */
  totalCount?: number;
  /** Shown when `rows` is empty. */
  tableEmptyMessage?: string;
  /** Supporting line under the empty-state title. */
  emptyDescription?: string;
  /** Stretch the list card to fill the remaining page height. */
  fill?: boolean;
  /** When set, table renders a column for `actionsSlot` on each row. */
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
  colD: string;
  colCount: number;
  actionsColumnLabel?: string;
  tableEmptyMessage: string;
  totalCount?: number;
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
    `[&>td:not(:first-child):not(:last-child)]:bg-[${tint}]`,
    `[&>td:last-child]:bg-[linear-gradient(270deg,transparent_0.5rem,${tint}_0.5rem)]`,
    `dark:[&>td:first-child]:bg-[linear-gradient(90deg,transparent_0.5rem,${tintDark}_0.5rem)]`,
    `dark:[&>td:not(:first-child):not(:last-child)]:bg-[${tintDark}]`,
    `dark:[&>td:last-child]:bg-[linear-gradient(270deg,transparent_0.5rem,${tintDark}_0.5rem)]`,
  ].join(" ");
}

function BookingDirectionMark({
  direction,
}: {
  direction: "incoming" | "outgoing";
}) {
  const incoming = direction === "incoming";
  return (
    <span
      title={incoming ? "Incoming" : "Outgoing"}
      aria-label={incoming ? "Incoming" : "Outgoing"}
      className={classNames(
        "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        incoming
          ? "border-sky-500/40 text-sky-700 dark:text-sky-300"
          : "border-violet-400/50 text-violet-700 dark:text-violet-300",
      )}
    >
      {incoming ? "In" : "Out"}
    </span>
  );
}

function BookingRowMeta({
  title,
  subtitle,
  avatarUrl,
  direction,
}: {
  title: string;
  subtitle?: ReactNode;
  avatarUrl?: string | null;
  direction?: "incoming" | "outgoing";
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(avatarUrl) && failedUrl !== avatarUrl;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {showImage ? (
        <Image
          src={avatarUrl!}
          alt=""
          width={36}
          height={36}
          sizes="36px"
          className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border dark:ring-white/10"
          onError={() => setFailedUrl(avatarUrl ?? null)}
        />
      ) : (
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-text-tertiary ring-1 ring-black/5 dark:bg-white/10 dark:text-white/70 dark:ring-white/10"
          aria-hidden
        >
          <UserRound className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="truncate text-sm font-medium text-text-primary">
            {title}
          </p>
        ) : null}
        {subtitle ? (
          <p className="truncate text-xs text-text-tertiary">{subtitle}</p>
        ) : null}
      </div>
      {direction ? (
        <BookingDirectionMark direction={direction} />
      ) : null}
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
  colD,
  colCount,
  actionsColumnLabel,
  tableEmptyMessage,
  totalCount,
  fill = false,
}: BookingsRowsTableProps & { fill?: boolean }) {
  const [page, setPage] = useQueryParamNumber("page", 1, { omitWhen: 1 });
  const [pageSize, setPageSize] = usePageSize();
  const totalItems = totalCount ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages, setPage]);

  const paginatedRows = useMemo(() => {
    if (totalCount !== undefined) return rows;
    if (rows.length <= pageSize) {
      return rows;
    }
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, safePage, pageSize, totalCount]);

  const hasRows = totalItems > 0;

  return (
    <div className={classNames("flex flex-col", fill && "min-h-0 flex-1")}>
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
                  <p className="text-[11px] font-medium text-text-secondary">
                    <span className="uppercase tracking-wide text-text-tertiary">
                      Date
                    </span>{" "}
                    {row.dateCol}
                  </p>
                  <BookingRowMeta
                    title={row.title}
                    subtitle={row.subtitle}
                    avatarUrl={row.avatarUrl}
                    direction={row.direction}
                  />
                  <p className="text-[11px] font-medium text-text-secondary">
                    <span className="uppercase tracking-wide text-text-tertiary">
                      When
                    </span>{" "}
                    {row.whenCol}
                  </p>
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
                <th
                  scope="col"
                  className="w-[1%] whitespace-nowrap pb-2 pr-3 text-[11px] font-medium uppercase tracking-wide text-text-tertiary"
                >
                  {colD}
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
                        direction={row.direction}
                      />
                    </td>
                    <td className="whitespace-nowrap border-t border-[#F3F4F6] py-3 pr-3 align-middle text-xs text-text-secondary dark:border-white/10">
                      {row.whenCol}
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
        <ListPaginationBar
          className="mt-4 shrink-0"
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
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
  totalCount,
  tableEmptyMessage = "Nothing here yet.",
  emptyDescription,
  fill = false,
  actionsColumnLabel,
  headerAside,
}: BookingsTabBodyProps) {
  const [colA, colB, colC, colD] = columnLabels;
  const colCount = actionsColumnLabel ? 5 : 4;
  const mainListCount = totalCount ?? rows.length;

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
          "min-w-0 rounded-xl border border-border bg-white px-4 py-4 dark:border-white/10 dark:bg-[#1a1a22] sm:px-5",
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
            className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${listEyebrow || bannerInsideCard ? "mt-3" : ""}`}
          >
            <h2 className="shrink-0 text-sm font-semibold text-text-primary sm:text-base">
              {mainListTitle}{" "}
              <span className="font-medium text-text-tertiary">
                ({mainListCount})
              </span>
            </h2>
            {headerAside ? (
              <div className="min-w-0 w-full sm:w-auto">{headerAside}</div>
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
            colD={colD}
            colCount={colCount}
            actionsColumnLabel={actionsColumnLabel}
            tableEmptyMessage={tableEmptyMessage}
            totalCount={totalCount}
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
      <BookingsSk className="mt-2.5 h-3 w-28" />
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
    <div className="grid grid-cols-[minmax(5rem,auto)_1fr_minmax(5rem,auto)_minmax(5rem,auto)_minmax(5.5rem,auto)] items-center gap-3 border-t border-[#F3F4F6] py-3 dark:border-white/10">
      <BookingsSk className="h-3.5 w-20" />
      <div className="flex min-w-0 items-center gap-2.5">
        <BookingsSk className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <BookingsSk className="h-4 w-40 max-w-full" />
          <BookingsSk className="h-3 w-28 max-w-full" />
        </div>
      </div>
      <BookingsSk className="h-3.5 w-20" />
      <BookingsSk className="h-6 w-20 rounded-full" />
      <div className="flex justify-end gap-1">
        <BookingsSk className="size-9 rounded-md" />
        <BookingsSk className="size-9 rounded-md" />
      </div>
    </div>
  );
}

export function BookingsShellSkeleton({
  tabLabels,
}: BookingsShellSkeletonProps = {}) {
  void tabLabels;
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

      <section className="min-w-0 rounded-xl border border-border bg-white px-4 py-4 dark:border-white/10 dark:bg-[#1a1a22] sm:px-5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BookingsSk className="h-5 w-28 max-w-full" />
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            <BookingsSk className="h-9 min-w-0 flex-1 basis-0 rounded-md sm:w-44 sm:flex-none" />
            <BookingsSk className="h-9 min-w-0 flex-1 basis-0 rounded-md sm:w-40 sm:flex-none" />
          </div>
        </div>

        <div className="mt-3 border-t border-border pt-3 dark:border-white/10">
          <div className="flex flex-col gap-3 md:hidden">
            <BookingsMobileRowSkeleton />
            <BookingsMobileRowSkeleton />
            <BookingsMobileRowSkeleton />
          </div>

          <div className="hidden min-w-0 md:block">
            <div className="grid grid-cols-[minmax(5rem,auto)_1fr_minmax(5rem,auto)_minmax(5rem,auto)_minmax(5.5rem,auto)] gap-3 pb-2">
              <BookingsSk className="h-3 w-10" />
              <BookingsSk className="h-3 w-16" />
              <BookingsSk className="h-3 w-10" />
              <BookingsSk className="h-3 w-12" />
            </div>
            <BookingsDesktopRowSkeleton />
            <BookingsDesktopRowSkeleton />
            <BookingsDesktopRowSkeleton />
            <BookingsDesktopRowSkeleton />
          </div>
        </div>

        <div className="mt-4 flex flex-col rounded-lg border border-border px-2.5 py-2 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
          <div className="flex items-center justify-between sm:contents">
            <BookingsSk className="size-8 rounded-md sm:hidden" />
            <BookingsSk className="mx-auto h-4 w-16 sm:mx-0" />
            <BookingsSk className="size-8 rounded-md sm:hidden" />
          </div>
          <div className="-mx-2.5 my-2 border-t border-border sm:hidden dark:border-white/10" />
          <div className="flex items-center justify-end gap-2 sm:ms-auto">
            <BookingsSk className="h-4 w-12" />
            <BookingsSk className="h-8 w-16 rounded-md" />
            <BookingsSk className="hidden size-8 rounded-md sm:block" />
            <BookingsSk className="hidden size-8 rounded-md sm:block" />
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
