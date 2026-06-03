"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronRight,
  Droplet,
  Gem,
  HeartPulse,
  LayoutDashboard,
  Pencil,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Layout } from "../../../layout/layout.component";
import { Avatar } from "../../../components/ui/Avatar/avatar.component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import {
  DONATION_TYPE_ENTRIES,
  isDonorRegistrationEnabled,
} from "@/lib/donations/donation-types";
import {
  donationPathwayOverviewHref,
  withDonationTypeQuery,
} from "@/lib/donations/donation-pathway-questionnaire-type";
import { routes } from "@/config/routes";
import { $api } from "@/app/api";
import {
  parseDonorRecord,
  parseDonorsListResponse,
} from "@/lib/donors/parseDonorsListResponse";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import { DonorCooldownDisplay } from "../donors/components/donor-cooldown-display.component";
import type { Donor } from "../donors/donors.data";
import { OverviewActiveDonorCard } from "./components/overview-active-donor-card.component";
import { SCREENING_DONATION_TYPE_OPTIONS } from "@/lib/donors/screeningDonationTypes";
import { CopyableTextLabel } from "@/components/ui/copyable-text-label.component";
import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import { OverviewNotificationsTab } from "./components/overview-notifications-tab.component";
import { Skeleton } from "@/components/ui/skeleton.component";

const BECOME_DONOR_CARDS = [
  {
    icon: Droplet,
    title: "Register as a blood donor",
    subtitle: "Save lives with your blood",
    href: withDonationTypeQuery("/donors/new?type=blood", "whole_blood"),
  },
  {
    icon: Gem,
    title: "Register as a sperm donor",
    subtitle: "Help families with your sperm",
    href: withDonationTypeQuery("/donors/new?type=sperm", "sperm_egg_gametes"),
  },
  {
    icon: Gem,
    title: "Register as an ovary donor",
    subtitle: "Give the gift of life with your egg",
    href: withDonationTypeQuery("/donors/new?type=ovary", "sperm_egg_gametes"),
  },
];

const OVERVIEW_DONORS_LIMIT = 8;

const DONATION_TYPE_LABELS = new Map(
  SCREENING_DONATION_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

function donationTypeLabel(type: string): string {
  return (
    DONATION_TYPE_LABELS.get(
      type as (typeof SCREENING_DONATION_TYPE_OPTIONS)[number]["value"],
    ) ?? type.replace(/_/g, " ")
  );
}

const pathwayFilterChipBase =
  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#14141a]";

export default function OverviewPage() {
  const { user } = useDashboard();
  const [myCooldownEndsAt, setMyCooldownEndsAt] = useState<
    string | null | undefined
  >(undefined);
  const [pathwaySearch, setPathwaySearch] = useState("");
  const [pathwayFilter, setPathwayFilter] = useState<
    "all" | "live" | "interest"
  >("all");
  const [activeDonors, setActiveDonors] = useState<Donor[]>([]);
  const [activeDonorsLoadState, setActiveDonorsLoadState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, status } = await $api.donors.me();
        if (cancelled || status < 200 || status >= 300 || !data) return;
        const raw =
          unwrapApiRecord(data) ?? (typeof data === "object" ? data : null);
        const row = parseDonorRecord(raw);
        if (!cancelled) setMyCooldownEndsAt(row?.cooldownEndsAt ?? null);
      } catch {
        if (!cancelled) setMyCooldownEndsAt(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setActiveDonorsLoadState("loading");
      try {
        const { data, status } = await $api.donors.list({
          page: 1,
          limit: OVERVIEW_DONORS_LIMIT,
        });
        if (cancelled) return;
        if (status < 200 || status >= 300 || data === undefined) {
          setActiveDonorsLoadState("error");
          return;
        }
        const parsed = parseDonorsListResponse(data);
        setActiveDonors(parsed.donors);
        setActiveDonorsLoadState("ok");
      } catch {
        if (!cancelled) setActiveDonorsLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPathways = useMemo(() => {
    const q = pathwaySearch.trim().toLowerCase();
    return DONATION_TYPE_ENTRIES.filter((entry) => {
      if (pathwayFilter === "live" && !isDonorRegistrationEnabled(entry))
        return false;
      if (pathwayFilter === "interest" && isDonorRegistrationEnabled(entry))
        return false;
      if (
        q &&
        !entry.label.toLowerCase().includes(q) &&
        !entry.slug.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [pathwaySearch, pathwayFilter]);

  return (
    <Layout>
      <div className="flex flex-col gap-10 md:gap-14">
        {/* Header: Welcome, account info, avatar */}
        <div className="mt-4 flex min-w-0 flex-col gap-6 rounded-2xl border border-[#DADADA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 lg:gap-6">
            <Avatar
              className="size-16 shrink-0 ring-2 ring-primary/15 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1a22] sm:size-20!"
              src={user?.profileImage}
            />
            <div className="min-w-0 flex flex-col gap-3">
              <div className="flex  gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Signed in
                  </p>
                  <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                    {user?.firstname} {user?.lastname}
                  </h1>
                </div>
                <Button variant="link" size="icon-xs" href={routes.settings}>
                  <Pencil className="size-4" aria-hidden />
                </Button>
              </div>
              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2 lg:flex-nowrap">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-text-secondary">Email</span>
                  <CopyableTextLabel value={user?.email ?? ""} />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 sm:border-l sm:border-border sm:pl-6 dark:border-white/10">
                  <span className="text-text-secondary">Cooldown</span>
                  {myCooldownEndsAt === undefined ? (
                    <Skeleton className="w-40 h-6 rounded-full" />
                  ) : (
                    <DonorCooldownDisplay
                      cooldownEndsAt={myCooldownEndsAt}
                      variant="owner"
                      className="w-fit max-w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: shadcn-style Radix tabs + ?tab= sync */}
        <div className="flex flex-col gap-8">
          <Suspense
            fallback={<div className="flex min-h-[200px] flex-col gap-10" />}
          >
            <Tabs
              defaultValue="overview"
              queryKey="tab"
              queryValues={["overview", "payment", "notifications"]}
              omitSearchParamWhenValue="overview"
              className="flex flex-col gap-8"
            >
              <TabsList className="grid h-auto w-full min-w-0 grid-cols-3 gap-1 rounded-xl border border-[#DADADA] bg-[#F4F4F5] p-1 dark:border-white/10 dark:bg-white/5 md:inline-flex md:w-auto md:grid-cols-none">
                <TabsTrigger
                  value="overview"
                  aria-label="Overview"
                  className="rounded-lg border-0 px-2 py-2.5 text-sm font-medium shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm md:px-4 dark:data-[state=active]:bg-[#1a1a22]"
                >
                  <LayoutDashboard className="size-5 md:hidden" aria-hidden />
                  <span className="hidden md:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  aria-label="Payment"
                  className="rounded-lg border-0 px-2 py-2.5 text-sm font-medium shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm md:px-4 dark:data-[state=active]:bg-[#1a1a22]"
                >
                  <Wallet className="size-5 md:hidden" aria-hidden />
                  <span className="hidden md:inline">Payment</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  aria-label="Notifications"
                  className="rounded-lg border-0 px-2 py-2.5 text-sm font-medium shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm md:px-4 dark:data-[state=active]:bg-[#1a1a22]"
                >
                  <Bell className="size-5 md:hidden" aria-hidden />
                  <span className="hidden md:inline">Notifications</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
                  {/* Pathways directory */}
                  <section
                    id="donation-pathways"
                    className="flex max-h-none scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-[#DADADA] bg-white md:max-h-[min(65vh,520px)] lg:max-h-[min(78vh,600px)] dark:border-white/10 dark:bg-[#1a1a22]"
                  >
                    <div className="shrink-0 space-y-4 border-b border-border px-5 py-5 sm:px-6 dark:border-white/10">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">
                          Donation pathways
                        </h2>

                        <p className="text-xs font-medium text-text-tertiary">
                          {filteredPathways.length} shown
                        </p>
                      </div>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3 lg:gap-4">
                        <Input
                          name="pathwaySearch"
                          type="search"
                          value={pathwaySearch}
                          onChange={(e) => setPathwaySearch(e.target.value)}
                          placeholder="Search pathways…"
                          autoComplete="off"
                          aria-label="Search donation pathways"
                          icon={
                            <Search
                              className="size-4 text-text-tertiary"
                              aria-hidden
                            />
                          }
                          containerClassName="min-w-0 flex-1"
                          inputClassName="rounded-xl border-0 bg-[#F7F7F8] py-2.5 dark:bg-white/5"
                        />
                        <div
                          className="flex flex-wrap gap-2"
                          role="group"
                          aria-label="Filter pathways"
                        >
                          {(
                            [
                              ["all", "All"],
                              ["live", "Open now"],
                              ["interest", "Coming soon"],
                            ] as const
                          ).map(([value, label]) => (
                            <Button
                              key={value}
                              type="button"
                              variant={
                                pathwayFilter === value ? "default" : "outline"
                              }
                              size="xs"
                              onClick={() => setPathwayFilter(value)}
                              className={`${pathwayFilterChipBase} ${
                                pathwayFilter === value
                                  ? "border-primary bg-primary text-white"
                                  : "border-border bg-white text-text-secondary hover:border-primary/25 hover:text-text-primary dark:border-white/10 dark:bg-white/5"
                              }`}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                      {filteredPathways.length === 0 ? (
                        <p className="py-8 text-center text-sm text-text-secondary">
                          No pathways match your search. Try another keyword or
                          filter.
                        </p>
                      ) : (
                        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {filteredPathways.map((entry) => {
                            const registrationEnabled =
                              isDonorRegistrationEnabled(entry);
                            const itemClassName =
                              "flex items-start gap-3 rounded-xl border border-border bg-[#FAFAFA] px-3.5 py-3 text-left text-sm dark:border-white/10 dark:bg-white/5";
                            const itemContent = (
                              <>
                                <span
                                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                                    registrationEnabled
                                      ? "bg-primary"
                                      : "bg-text-tertiary/40"
                                  }`}
                                  aria-hidden
                                />
                                <span className="flex min-w-0 flex-1 flex-col gap-1">
                                  <span className="font-medium leading-snug text-text-primary">
                                    {entry.label}
                                  </span>
                                  <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                                    {registrationEnabled
                                      ? "Open for registration"
                                      : "Coming soon"}
                                  </span>
                                </span>
                                {registrationEnabled ? (
                                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-text-tertiary" />
                                ) : null}
                              </>
                            );

                            return (
                              <li key={entry.slug}>
                                {registrationEnabled ? (
                                  <Link
                                    href={donationPathwayOverviewHref(
                                      entry.slug,
                                    )}
                                    className={`${itemClassName} transition hover:border-primary/30 hover:bg-white hover:shadow-sm dark:hover:bg-white/10`}
                                  >
                                    {itemContent}
                                  </Link>
                                ) : (
                                  <div
                                    className={`${itemClassName} cursor-not-allowed opacity-60`}
                                    aria-disabled="true"
                                  >
                                    {itemContent}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </section>

                  {/* Active donors */}
                  <section className="overflow-hidden rounded-2xl border border-[#DADADA] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
                    <div className="flex flex-col gap-1 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#F9E8EE] text-primary dark:bg-primary/20">
                          <Users className="size-5" aria-hidden />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary">
                            Active donors
                          </h2>
                          <p className="text-sm text-text-secondary">
                            Discover donors and book an appointment.
                          </p>
                        </div>
                      </div>
                      <Link
                        href={routes.donors}
                        className="mt-2 text-sm font-medium text-primary hover:underline sm:mt-0"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="p-4 sm:p-5">
                      {activeDonorsLoadState === "loading" ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={`donor-sk-${i}`}
                              className="h-40 animate-pulse rounded-xl bg-[#F4F4F5] dark:bg-white/8"
                              aria-hidden
                            />
                          ))}
                        </div>
                      ) : activeDonorsLoadState === "error" ? (
                        <p className="py-10 text-center text-sm text-text-secondary">
                          Could not load donors. Please try again later.
                        </p>
                      ) : activeDonors.length === 0 ? (
                        <p className="py-10 text-center text-sm text-text-secondary">
                          No donors available yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {activeDonors.map((donor) => (
                            <OverviewActiveDonorCard
                              key={donor.id}
                              donor={donor}
                              currentUserId={user?.id}
                              donationTypeLabel={donationTypeLabel}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="mt-0">
                <section className="overflow-hidden rounded-2xl border border-[#DADADA] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
                  <div className="flex flex-col items-center gap-4 px-6 py-14 text-center sm:px-10 sm:py-16">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F9E8EE] text-primary dark:bg-primary/20">
                      <Wallet className="size-7" aria-hidden />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="mx-auto inline-flex w-fit rounded-full border border-border bg-[#F4F4F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary dark:border-white/10 dark:bg-white/8">
                        Upcoming
                      </span>
                      <h2 className="text-lg font-semibold text-text-primary">
                        Payment
                      </h2>
                      <p className="max-w-md text-sm leading-relaxed text-text-secondary">
                        Payment settings, payout history, and wallet features
                        are on the way. You&apos;ll manage compensation here
                        once this is live.
                      </p>
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <OverviewNotificationsTab />
              </TabsContent>
            </Tabs>
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}
