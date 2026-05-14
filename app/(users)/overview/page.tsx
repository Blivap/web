"use client";

import { Suspense, useMemo, useState } from "react";
import {
  ChevronRight,
  Droplet,
  DropletIcon,
  Gem,
  HeartPulse,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Layout } from "../../../layout/layout.component";
import { Avatar } from "../../../components/ui/Avatar/avatar.component";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import {
  DONATION_TYPE_ENTRIES,
  type DonationTypeEntry,
} from "@/lib/donations/donation-types";
import {
  donationPathwayOverviewHref,
  withDonationTypeQuery,
} from "@/lib/donations/donation-pathway-questionnaire-type";
import { donorDetailPath, routes } from "@/config/routes";

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

const ACTIVE_DONORS = [
  {
    id: "012834",
    packs: "2 packs",
    bloodType: "O+",
    rating: 4.8,
    donations: 4,
    location: "Abuja, Nigeria",
  },
  {
    id: "012835",
    packs: "1 pack",
    bloodType: "A+",
    rating: 4.9,
    donations: 2,
    location: "Lagos, Nigeria",
  },
  {
    id: "012836",
    packs: "3 packs",
    bloodType: "B+",
    rating: 4.7,
    donations: 6,
    location: "Abuja, Nigeria",
  },
  {
    id: "012837",
    packs: "2 packs",
    bloodType: "O-",
    rating: 5.0,
    donations: 3,
    location: "Port Harcourt, Nigeria",
  },
  {
    id: "012884",
    packs: "2 packs",
    bloodType: "O+",
    rating: 4.8,
    donations: 4,
    location: "Abuja, Nigeria",
  },
  {
    id: "012809",
    packs: "1 pack",
    bloodType: "A+",
    rating: 4.9,
    donations: 2,
    location: "Lagos, Nigeria",
  },
  {
    id: "012808",
    packs: "3 packs",
    bloodType: "B+",
    rating: 4.7,
    donations: 6,
    location: "Abuja, Nigeria",
  },
  {
    id: "012807",
    packs: "2 packs",
    bloodType: "O-",
    rating: 5.0,
    donations: 3,
    location: "Port Harcourt, Nigeria",
  },
];

function isLiveBlivapPathway(entry: DonationTypeEntry): boolean {
  return entry.integration.kind !== "interest_only";
}

const pathwayFilterChipBase =
  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#14141a]";

export default function OverviewPage() {
  const { user } = useDashboard();
  const [pathwaySearch, setPathwaySearch] = useState("");
  const [pathwayFilter, setPathwayFilter] = useState<
    "all" | "live" | "interest"
  >("all");

  const filteredPathways = useMemo(() => {
    const q = pathwaySearch.trim().toLowerCase();
    return DONATION_TYPE_ENTRIES.filter((entry) => {
      if (pathwayFilter === "live" && !isLiveBlivapPathway(entry)) return false;
      if (pathwayFilter === "interest" && isLiveBlivapPathway(entry))
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
        <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-[#DADADA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Avatar
              className="size-16 shrink-0 ring-2 ring-primary/15 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1a22] sm:size-20!"
              src={user?.profileImage}
            />
            <div className="min-w-0 flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Signed in
                </p>
                <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                  Welcome back, {user?.firstname} {user?.lastname}
                </h1>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-text-secondary">Email</span>
                  <span className="truncate font-medium text-text-primary">
                    {user?.email ?? "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-border pl-6 dark:border-white/10">
                  <span className="text-text-secondary">Donations logged</span>
                  <span className="font-medium text-text-primary">None yet</span>
                </div>
              </div>
            </div>
          </div>
          <Link
            href={routes.settings}
            className="shrink-0 self-start rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/4 dark:border-white/10 dark:hover:bg-white/6 sm:self-auto"
          >
            Edit profile
          </Link>
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
              <TabsList className="h-auto w-full justify-start gap-1 rounded-xl border border-[#DADADA] bg-[#F4F4F5] p-1 dark:border-white/10 dark:bg-white/5 sm:inline-flex sm:w-auto">
                <TabsTrigger
                  value="overview"
                  className="rounded-lg border-0 px-4 py-2.5 text-sm font-medium shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#1a1a22]"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="rounded-lg border-0 px-4 py-2.5 text-sm font-medium shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#1a1a22]"
                >
                  Payment
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="rounded-lg border-0 px-4 py-2.5 text-sm font-medium shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#1a1a22]"
                >
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="flex flex-col gap-8 lg:gap-10">
                  {/* Quick actions + highlight */}
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-stretch">
                    <section className="flex flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-[#DADADA] bg-linear-to-br from-[#FDF2F6] via-white to-white p-6 dark:border-white/10 dark:from-primary/10 dark:via-[#1a1a22] dark:to-[#1a1a22] sm:p-7">
                      <div className="flex flex-col gap-3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10">
                          <Sparkles className="size-3.5" aria-hidden />
                          Get started
                        </div>
                        <h2 className="text-xl font-semibold leading-tight text-text-primary sm:text-2xl">
                          Ready to register as a donor?
                        </h2>
                        <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
                          Start with the pathway that fits you. Blood donation
                          uses the full verification flow today; sperm and ovum
                          use guided intake—everything else opens an interest
                          checklist for upcoming programs.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={withDonationTypeQuery(
                            "/donors/new?type=blood",
                            "whole_blood",
                          )}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                        >
                          <Droplet className="size-4 shrink-0" aria-hidden />
                          Blood donor
                        </Link>
                        <Link
                          href={withDonationTypeQuery(
                            "/donors/new?type=sperm",
                            "sperm_egg_gametes",
                          )}
                          className="inline-flex items-center gap-2 rounded-lg border border-primary/35 bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white dark:border-primary/40 dark:bg-white/10 dark:hover:bg-white/15"
                        >
                          Sperm donor
                        </Link>
                        <Link
                          href={withDonationTypeQuery(
                            "/donors/new?type=ovary",
                            "sperm_egg_gametes",
                          )}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/80 px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
                        >
                          Ovum donor
                        </Link>
                      </div>
                    </section>

                    <aside className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DADADA] bg-white p-6 dark:border-white/10 dark:bg-[#1a1a22]">
                      <div className="flex flex-col gap-2">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#F9E8EE] text-primary dark:bg-primary/20">
                          <HeartPulse className="size-5" aria-hidden />
                        </div>
                        <h3 className="text-base font-semibold text-text-primary">
                          Explore every pathway
                        </h3>
                        <p className="text-sm leading-relaxed text-text-secondary">
                          Browse the full directory, filter what is live in
                          Blivap today, and open a guided flow for each type.
                        </p>
                      </div>
                      <Link
                        href="#donation-pathways"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-medium text-text-primary transition hover:border-primary/25 hover:bg-primary/3 dark:border-white/10"
                      >
                        Jump to pathways
                        <ChevronRight className="size-4" aria-hidden />
                      </Link>
                    </aside>
                  </div>

                  {/* Become a donor — compact cards */}
                  <section className="overflow-hidden rounded-2xl border border-[#DADADA] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
                    <div className="flex flex-col gap-1 border-b border-border px-5 py-5 sm:px-6 dark:border-white/10">
                      <h2 className="text-lg font-semibold text-text-primary">
                        Become a donor
                      </h2>
                      <p className="text-sm text-text-secondary">
                        Three supported registration journeys—tap a card to
                        continue.
                      </p>
                    </div>
                    <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                      {BECOME_DONOR_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                          <Link
                            key={card.title}
                            href={card.href}
                            className="group flex flex-col gap-4 rounded-xl border border-transparent bg-[#F7F7F8] p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md dark:bg-white/5 dark:hover:border-primary/25 dark:hover:bg-white/8"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F9E8EE] text-primary transition group-hover:scale-[1.02] dark:bg-primary/20">
                                <Icon className="size-5" aria-hidden />
                              </div>
                              <ChevronRight className="size-5 shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-primary" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <p className="font-semibold leading-snug text-text-primary">
                                {card.title}
                              </p>
                              <p className="text-sm leading-relaxed text-text-secondary">
                                {card.subtitle}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>

                  {/* Pathways directory */}
                  <section
                    id="donation-pathways"
                    className="flex max-h-[min(78vh,600px)] scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-[#DADADA] bg-white dark:border-white/10 dark:bg-[#1a1a22]"
                  >
                    <div className="shrink-0 space-y-4 border-b border-border px-5 py-5 sm:px-6 dark:border-white/10">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary">
                            Donation pathways
                          </h2>
                          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
                            Search or filter, then select a type to open its
                            step-by-step flow.
                          </p>
                        </div>
                        <p className="text-xs font-medium text-text-tertiary">
                          {filteredPathways.length} shown
                        </p>
                      </div>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="relative min-w-0 flex-1">
                          <Search
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
                            aria-hidden
                          />
                          <input
                            type="search"
                            value={pathwaySearch}
                            onChange={(e) => setPathwaySearch(e.target.value)}
                            placeholder="Search pathways…"
                            className="w-full rounded-xl border border-border bg-[#F7F7F8] py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-white/5"
                            autoComplete="off"
                            aria-label="Search donation pathways"
                          />
                        </div>
                        <div
                          className="flex flex-wrap gap-2"
                          role="group"
                          aria-label="Filter pathways"
                        >
                          {(
                            [
                              ["all", "All"],
                              ["live", "Live in Blivap"],
                              ["interest", "Interest only"],
                            ] as const
                          ).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setPathwayFilter(value)}
                              className={`${pathwayFilterChipBase} ${
                                pathwayFilter === value
                                  ? "border-primary bg-primary text-white"
                                  : "border-border bg-white text-text-secondary hover:border-primary/25 hover:text-text-primary dark:border-white/10 dark:bg-white/5"
                              }`}
                            >
                              {label}
                            </button>
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
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {filteredPathways.map((entry) => {
                            const live = isLiveBlivapPathway(entry);
                            return (
                              <li key={entry.slug}>
                                <Link
                                  href={donationPathwayOverviewHref(entry.slug)}
                                  className="flex items-start gap-3 rounded-xl border border-border bg-[#FAFAFA] px-3.5 py-3 text-left text-sm transition hover:border-primary/30 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                >
                                  <span
                                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                                      live ? "bg-primary" : "bg-text-tertiary/40"
                                    }`}
                                    aria-hidden
                                  />
                                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                                    <span className="font-medium leading-snug text-text-primary">
                                      {entry.label}
                                    </span>
                                    <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                                      {live ? "Live flow" : "Interest flow"}
                                    </span>
                                  </span>
                                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-text-tertiary" />
                                </Link>
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
                        Browse directory
                      </Link>
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                      {ACTIVE_DONORS.map((donor, index) => (
                        <div
                          key={donor.id}
                          className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:px-6 ${
                            index > 0
                              ? "border-t border-border dark:border-white/10"
                              : ""
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Avatar className="size-11!" />
                            <div className="min-w-0 flex flex-col">
                              <Link
                                href={donorDetailPath(donor.id)}
                                className="truncate text-sm font-semibold text-text-primary hover:text-primary hover:underline"
                              >
                                Donor {donor.id}
                              </Link>
                              <span className="text-xs text-text-secondary">
                                {donor.packs}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="rounded-full bg-[#FCE7E7] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary dark:bg-primary/25">
                              {donor.bloodType}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-text-secondary">
                              <Star
                                className="size-4 fill-amber-400 text-amber-400"
                                aria-hidden
                              />
                              <span>{donor.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-text-secondary">
                              <DropletIcon
                                className="size-3.5 text-primary"
                                aria-hidden
                              />
                              <span>{donor.donations} donations</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                              <MapPin
                                className="size-3.5 shrink-0"
                                aria-hidden
                              />
                              <span className="truncate">{donor.location}</span>
                            </div>
                          </div>
                          <div className="flex w-full shrink-0 gap-2 sm:ml-auto sm:w-auto">
                            <Link
                              href={donorDetailPath(donor.id)}
                              className="inline-flex flex-1 items-center justify-center rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-primary transition hover:bg-primary/4 dark:border-white/10 sm:flex-none"
                            >
                              View profile
                            </Link>
                            <Link
                              href={routes.scheduleAppointment(donor.id)}
                              className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 sm:flex-none"
                            >
                              Book
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="mt-0">
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-text-primary">
                    Payment
                  </h2>
                  <p className="text-text-secondary">
                    Payment settings and history will appear here.
                  </p>
                </section>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-text-primary">
                    Notifications
                  </h2>
                  <p className="text-text-secondary">
                    Your notifications will appear here.
                  </p>
                </section>
              </TabsContent>
            </Tabs>
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}
