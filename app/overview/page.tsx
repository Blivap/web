"use client";

import { Suspense } from "react";
import { Droplet, Star, Gem, DropletIcon } from "lucide-react";
import Link from "next/link";
import { Layout } from "../../layout/layout.component";
import { Avatar } from "../../components/ui/Avatar/avatar.component";
import { Tabs, TabItem } from "../../components/ui/tabs/tabs.component";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";

const BECOME_DONOR_CARDS = [
  {
    icon: Droplet,
    title: "Register as a blood donor",
    subtitle: "Save lives with your blood",
    href: "/donors/new?type=blood",
  },
  {
    icon: Gem,
    title: "Register as a sperm donor",
    subtitle: "Help families with your sperm",
    href: "/donors/new?type=sperm",
  },
  {
    icon: Gem,
    title: "Register as an ovary donor",
    subtitle: "Give the gift of life with your egg",
    href: "/donors/new?type=ovary",
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

export default function OverviewPage() {
  const { user } = useDashboard();

  return (
    <Layout>
      <div className="flex flex-col gap-[104px] ">
        {/* Header: Welcome, account info, avatar */}
        <div className="flex flex-row sm:items-start sm:justify-between gap-4 mt-4">
          <div className="flex flex-col gap-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Welcome
            </h1>
            <div className="flex flex-col md:flex-row gap-[36px]">
              <p className="flex flex-col gap-px text-sm text-text-secondary">
                <span className="font-medium">Account Email</span>{" "}
                <span className="text-sm font-medium text-text-primary">
                  {user?.email ?? "—"}
                </span>
              </p>
              <p className="flex flex-col gap-px text-sm text-text-secondary">
                <span className="font-medium">Donated</span>{" "}
                <span className="text-sm font-medium text-text-primary">
                  None
                </span>
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Avatar
              className="size-14 sm:size-24! xl:size-28!"
              src={user?.profileImage}
            />
          </div>
        </div>

        {/* Tabs: switch by index, no route — TabItem children are the panels */}
        <div className="flex flex-col gap-10">
          <Suspense
            fallback={<div className="flex flex-col gap-10 min-h-[200px]" />}
          >
            <Tabs defaultTabValue="overview" className="flex flex-col gap-10">
              <TabItem label="Overview">
                <div className="flex flex-col gap-10">
                  <section className="flex flex-col gap-3">
                    <h2 className="text-base font-medium text-text-primary">
                      Become a Donor
                    </h2>
                    <div className="grid grid-cols-1 gap-4 bg-[#F0F0EF] p-6 sm:grid-cols-3 dark:bg-white/4">
                      {BECOME_DONOR_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                          <Link
                            key={card.title}
                            href={card.href}
                            className="flex flex-col items-center gap-[38px] rounded-xl border border-[#DADADA] bg-white p-5 transition-colors duration-150 hover:bg-white/70 hover:shadow-[2px_3px_5px_#00000014] active:shadow-none dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/6 dark:hover:shadow-[2px_4px_16px_rgba(0,0,0,0.35)]"
                          >
                            <div className="flex size-10 items-center justify-center rounded-full bg-[#F9E8EE] text-primary dark:bg-primary/20">
                              <Icon className="size-5" />
                            </div>
                            <div className="flex flex-col gap-3.5">
                              <p className="font-semibold text-text-primary">
                                {card.title}
                              </p>
                              <p className="text-sm text-text-secondary">
                                {card.subtitle}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>

                  <section className="flex flex-col gap-3">
                    <h2 className="text-base font-medium text-text-primary">
                      Active Donors
                    </h2>
                    <div className="flex max-h-[350px] flex-col overflow-hidden overflow-y-auto rounded-xl border border-[#DADADA] bg-white px-5 dark:border-white/10 dark:bg-[#1a1a22]">
                      {ACTIVE_DONORS.map((donor, index) => (
                        <div
                          key={donor.id}
                          className={`flex flex-wrap items-center gap-3 sm:gap-4 px-[18px] py-[17px] ${
                            index > 0
                              ? "border-t border-[#DADADA] dark:border-white/10"
                              : ""
                          }`}
                        >
                          <Avatar className="size-10!" />
                          <div className="flex flex-col min-w-0">
                            <p className="font-medium text-text-primary text-xs">
                              {donor.id}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {donor.packs}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#FCE7E7] p-1 text-[8px] font-medium text-primary dark:bg-primary/25">
                            {donor.bloodType}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-text-secondary">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span>{donor.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-text-secondary">
                            <DropletIcon className="size-2 text-primary" />
                            <span>{donor.donations} donations</span>
                          </div>
                          <p className="text-sm text-text-secondary">
                            {donor.location}
                          </p>
                          <button className="ml-auto rounded-lg bg-primary px-6 py-[8.5px] text-xs font-medium text-white hover:bg-primary/90 transition-colors">
                            Book Appointment
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </TabItem>
              <TabItem label="Payment">
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-text-primary">
                    Payment
                  </h2>
                  <p className="text-text-secondary">
                    Payment settings and history will appear here.
                  </p>
                </section>
              </TabItem>
              <TabItem label="Notifications">
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-text-primary">
                    Notifications
                  </h2>
                  <p className="text-text-secondary">
                    Your notifications will appear here.
                  </p>
                </section>
              </TabItem>
            </Tabs>
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}
