"use client";

import type { ReactNode } from "react";
import { Tabs, TabItem } from "@/components/ui/tabs/tabs.component";
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
                    className="border-t border-[#F3F4F6] dark:border-white/10"
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

export function BookingsShell({ tabPanels, tabLabels }: BookingsShellProps) {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
        My Bookings
      </h1>
      <Tabs
        defaultTabValue={tabLabels.active}
        className="flex flex-col gap-8"
      >
        <TabItem label={tabLabels.active}>
          <BookingsTabBody {...tabPanels.active} />
        </TabItem>
        <TabItem label={tabLabels.referrals}>
          <BookingsTabBody {...tabPanels.referrals} />
        </TabItem>
        <TabItem label={tabLabels.archived}>
          <BookingsTabBody {...tabPanels.archived} />
        </TabItem>
      </Tabs>
    </div>
  );
}
