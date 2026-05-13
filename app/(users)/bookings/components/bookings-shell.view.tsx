"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingSectionCard } from "./booking-section-card";
import {
  BookingStatusPill,
  type BookingPillVariant,
} from "./booking-status-pill";

export type BookingsShellRow = {
  id: string;
  dateCol: string;
  title: string;
  subtitle: string;
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

const tabTriggerClass =
  "min-h-10 min-w-0 flex-1 basis-0 rounded-lg border-0 px-2 py-2.5 text-center text-xs font-medium transition-colors sm:px-3 sm:text-sm " +
  "border-b-0 data-[state=active]:border-b-0 " +
  "text-text-secondary hover:text-text-primary " +
  "data-[state=active]:border-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm " +
  "dark:data-[state=active]:bg-[#1a1a22] dark:data-[state=active]:text-primary " +
  "truncate";

type BookingsTabBodyProps = BookingsTabPanel;

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

  const bannerBeforeSummaries =
    panelBanner && !bannerInListCard ? panelBanner : null;
  const bannerInsideCard =
    panelBanner && bannerInListCard ? panelBanner : null;

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
          <span className="font-medium text-text-tertiary">({mainListCount})</span>
        </h2>
        <div className="mt-3 overflow-x-auto border-t border-border pt-3 dark:border-white/10">
          <table
            className={`w-full border-collapse text-left ${actionsColumnLabel ? "min-w-[720px]" : "min-w-[560px]"}`}
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-text-tertiary"
                >
                  {colA}
                </th>
                <th
                  scope="col"
                  className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-text-tertiary"
                >
                  {colB}
                </th>
                <th
                  scope="col"
                  className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-text-tertiary"
                >
                  {colC}
                </th>
                {actionsColumnLabel ? (
                  <th
                    scope="col"
                    className="pb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary"
                  >
                    {actionsColumnLabel}
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
                rows.map((row) => (
                  <tr
                    key={row.id}
                    id={`booking-row-${row.id}`}
                    className={`border-t border-[#F3F4F6] dark:border-white/10 ${
                      row.highlight
                        ? "bg-primary/5 ring-2 ring-inset ring-primary/40"
                        : ""
                    }`}
                  >
                    <td className="whitespace-nowrap py-4 pr-4 align-top text-sm text-text-secondary">
                      {row.dateCol}
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="flex gap-3">
                        {row.avatarUrl ? (
                          <Image
                            src={row.avatarUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border dark:ring-white/10"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-text-primary">
                            {row.title}
                          </p>
                          <p className="mt-1 text-sm leading-snug text-text-secondary">
                            {row.subtitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
                        <BookingStatusPill variant={row.pillVariant}>
                          {row.pillLabel}
                        </BookingStatusPill>
                        {row.reported ? (
                          <span className="inline-flex w-fit items-center rounded-full bg-[#374151] px-2 py-0.5 text-[11px] font-medium text-white dark:bg-white/15 dark:text-white">
                            Reported
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {actionsColumnLabel ? (
                      <td className="py-4 align-top">
                        {row.actionsSlot ?? (
                          <span className="text-xs text-text-tertiary">—</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                i === 0
                  ? "bg-white dark:bg-[#1a1a22]"
                  : "text-text-secondary"
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
