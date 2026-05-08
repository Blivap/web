"use client";

import { useMemo, type ReactNode } from "react";
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
  summarySections: readonly BookingsShellSummary[];
  mainListTitle: string;
  columnLabels: readonly [string, string, string];
  rows: readonly BookingsShellRow[];
  /** Shown when `rows` is empty. */
  tableEmptyMessage?: string;
  /** When set, table renders a fourth column for `actionsSlot` on each row. */
  actionsColumnLabel?: string;
};

export type BookingsShellTabPanels = {
  active: BookingsTabPanel;
  referrals: BookingsTabPanel;
  archived: BookingsTabPanel;
};

/** Visible tab titles (also used in the URL `?tab=` query, lowercased). */
export type BookingsShellTabLabels = {
  active: string;
  referrals: string;
  archived: string;
};

type BookingsTabBodyProps = BookingsTabPanel;

function BookingsTabBody({
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

  return (
    <div className="flex flex-col gap-5">
      {summarySections.map((section, i) => (
        <BookingSectionCard key={`${section.title}-${i}`} title={section.title}>
          {section.description}
        </BookingSectionCard>
      ))}

      <section className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-5 dark:border-white/10 dark:bg-[#1a1a22]">
        <h2 className="text-base font-bold text-text-primary">
          {mainListTitle} ({mainListCount})
        </h2>
        <div className="mt-4 overflow-x-auto border-t border-[#E5E7EB] pt-4 dark:border-white/10">
          <table
            className={`w-full border-collapse text-left ${actionsColumnLabel ? "min-w-[680px]" : "min-w-[520px]"}`}
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
                      <p className="text-sm font-bold text-text-primary">
                        {row.title}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {row.subtitle}
                      </p>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <BookingStatusPill variant={row.pillVariant}>
                        {row.pillLabel}
                      </BookingStatusPill>
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
  tabPanels: BookingsShellTabPanels;
  tabLabels: BookingsShellTabLabels;
};

type BookingsShellSkeletonProps = {
  tabLabels: BookingsShellTabLabels;
};

export function BookingsShellSkeleton({ tabLabels }: BookingsShellSkeletonProps) {
  return (
    <div className="flex flex-col gap-8 animate-pulse" aria-hidden>
      <div className="h-9 w-48 rounded-md bg-[#E5E7EB] dark:bg-white/10" />

      <div className="flex flex-col gap-5">
        <nav className="flex gap-6 border-b border-[#E5E7EB] dark:border-white/10">
          <div className="border-b-2 border-primary pb-3 text-sm font-medium text-primary dark:text-primary">
            {tabLabels.active}
          </div>
          <div className="pb-3 text-sm font-medium text-text-secondary">
            {tabLabels.referrals}
          </div>
          <div className="pb-3 text-sm font-medium text-text-secondary">
            {tabLabels.archived}
          </div>
        </nav>

        <section className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-5 dark:border-white/10 dark:bg-[#1a1a22]">
          <div className="h-3.5 w-52 rounded bg-[#E5E7EB] dark:bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-[520px] rounded bg-[#E5E7EB] dark:bg-white/10" />
        </section>

        <section className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-5 dark:border-white/10 dark:bg-[#1a1a22]">
          <div className="h-3.5 w-48 rounded bg-[#E5E7EB] dark:bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-[460px] rounded bg-[#E5E7EB] dark:bg-white/10" />
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

              <div className="col-span-4 h-px w-full bg-[#F3F4F6] dark:bg-white/10" />

              <div className="h-4 w-24 rounded bg-[#E5E7EB] dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-4 w-44 rounded bg-[#E5E7EB] dark:bg-white/10" />
                <div className="h-4 w-60 rounded bg-[#E5E7EB] dark:bg-white/10" />
              </div>
              <div className="h-6 w-24 rounded-full bg-[#E5E7EB] dark:bg-white/10" />
              <div className="h-7 w-32 rounded-md bg-[#E5E7EB] dark:bg-white/10" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function BookingsShell({ tabPanels, tabLabels }: BookingsShellProps) {
  const tabItems = useMemo(
    () => [
      {
        value: tabLabels.active.toLowerCase(),
        label: tabLabels.active,
        panel: tabPanels.active,
      },
      {
        value: tabLabels.referrals.toLowerCase(),
        label: tabLabels.referrals,
        panel: tabPanels.referrals,
      },
      {
        value: tabLabels.archived.toLowerCase(),
        label: tabLabels.archived,
        panel: tabPanels.archived,
      },
    ],
    [tabLabels, tabPanels],
  );
  const tabValues = useMemo(
    () => tabItems.map((item) => item.value),
    [tabItems],
  );
  const defaultTabValue = tabItems[0]?.value;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
        My Bookings
      </h1>
      <Tabs
        defaultValue={defaultTabValue}
        queryKey="tab"
        queryValues={tabValues}
        className="flex flex-col gap-8"
      >
        <TabsList>
          {tabItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabItems.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <BookingsTabBody {...item.panel} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
