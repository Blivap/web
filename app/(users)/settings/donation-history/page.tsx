"use client";

import { useDonationHistory } from "@/hooks/settings/useDonationHistory.hook";
import { formatScheduledLabel } from "@/lib/bookings/formatBookingDisplay";
import { Spinner } from "@/components/ui/spinner";
import { SettingsShell } from "../components/settings-shell";
import {
  SettingsCard,
  SettingsSectionLabel,
} from "../components/settings-card";

export default function DonationHistoryPage() {
  const { bookings, loading } = useDonationHistory();

  return (
    <SettingsShell
      title="Donation History"
      description="Completed bookings from your donor and requester history."
    >
      <div className="rounded-xl bg-primary px-5 py-6 text-white shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85">
          Donor Impact Summary
        </p>
        <hr className="my-3 border-white/35" />
        <p className="text-2xl font-bold leading-tight">
          {loading ? "…" : `${bookings.length} Total Donations`}
        </p>
        <p className="mt-2 text-sm text-white/90">
          Completed bookings from your donor and requester history show up here.
        </p>
      </div>

      <SettingsCard className="flex flex-col gap-4">
        <SettingsSectionLabel title="Donation Timeline" />
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : null}
        {!loading && bookings.length === 0 ? (
          <p className="text-sm text-[#6B7280] dark:text-white/50">
            No completed donations yet.
          </p>
        ) : null}
        <div className="flex flex-col gap-3">
          {bookings.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-[#6B7280] dark:text-white/50">
                  {formatScheduledLabel(item.scheduledAt)}
                </p>
                <span className="rounded-full bg-[#DCFCE8] px-2.5 py-0.5 text-[11px] font-semibold text-[#166534]">
                  Completed
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#111827] dark:text-white/90">
                {item.hospitalName?.trim() || "Hospital"}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280] dark:text-white/50">
                <span>
                  Status:{" "}
                  <span className="font-semibold text-[#166534]">
                    {item.status}
                  </span>
                </span>
                {item.meetingCode ? (
                  <span>
                    Code:{" "}
                    <span className="font-semibold text-primary">
                      {item.meetingCode}
                    </span>
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </SettingsCard>
    </SettingsShell>
  );
}
