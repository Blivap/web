"use client";

import { Suspense } from "react";
import { Droplet, Star, Gem, DropletIcon } from "lucide-react";
import Link from "next/link";
import { Layout } from "../components/layout/layout.component";
import { Avatar } from "../components/Avatar/avatar.component";
import { Tabs, TabItem } from "../components/tabs/tabs.component";
import { useDashboard } from "../hooks/dashboard/useDashboard.hook";

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
      <div className="flex flex-col gap-[104px] lg:p-10 lg:pb-0">
        {/* Header: Welcome, account info, avatar */}
        <div className="flex flex-row sm:items-start sm:justify-between gap-4 mt-4">
          <div className="flex flex-col gap-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              Welcome
            </h1>
            <div className="flex flex-col md:flex-row gap-[36px]">
              <p className="flex flex-col gap-px text-sm text-[#6B7280]">
                <span className="font-medium">Account Email</span>{" "}
                <span className="text-sm font-medium text-black">
                  {user?.email ?? "—"}
                </span>
              </p>
              <p className="flex flex-col gap-px text-sm text-[#6B7280]">
                <span className="font-medium">Donated</span>{" "}
                <span className="text-sm font-medium text-black">None</span>
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
                    <h2 className="text-base font-medium text-black">
                      Become a Donor
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F0F0EF] p-6">
                      {BECOME_DONOR_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                          <Link
                            key={card.title}
                            href={card.href}
                            className="flex flex-col items-center  gap-[38px] p-5 rounded-xl bg-white hover:bg-white/70 hover:shadow-[2px_3px_5px_#00000014] active:shadow-none transition-colors duration-150 border border-[#DADADA]"
                          >
                            <div className="flex items-center justify-center size-10 rounded-full bg-[#F9E8EE] text-primary">
                              <Icon className="size-5" />
                            </div>
                            <div className="flex flex-col gap-3.5">
                              <p className="font-semibold text-black">
                                {card.title}
                              </p>
                              <p className="text-sm text-[#6B7280]">
                                {card.subtitle}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>

                  <section className="flex flex-col gap-3">
                    <h2 className="text-base font-medium text-black">
                      Active Donors
                    </h2>
                    <div className="flex flex-col bg-white rounded-xl border border-[#DADADA] overflow-hidden px-5 max-h-[350px] overflow-y-auto">
                      {ACTIVE_DONORS.map((donor, index) => (
                        <div
                          key={donor.id}
                          className={`flex flex-wrap items-center gap-3 sm:gap-4 px-[18px] py-[17px] ${
                            index > 0 ? "border-t  border-[#DADADA]" : ""
                          }`}
                        >
                          <Avatar className="size-10!" />
                          <div className="flex flex-col min-w-0">
                            <p className="font-medium text-black text-xs">
                              {donor.id}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {donor.packs}
                            </p>
                          </div>
                          <span className="p-1 rounded-full bg-[#FCE7E7] text-primary text-[8px] font-medium">
                            {donor.bloodType}
                          </span>
                          <div className="flex items-center gap-1 text-[#6B7280] text-sm">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span>{donor.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#6B7280] text-sm">
                            <DropletIcon className="size-2 text-primary" />
                            <span>{donor.donations} donations</span>
                          </div>
                          <p className="text-sm text-[#6B7280]">
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
                  <h2 className="text-lg font-bold text-black">Payment</h2>
                  <p className="text-[#6B7280]">
                    Payment settings and history will appear here.
                  </p>
                </section>
              </TabItem>
              <TabItem label="Notifications">
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-black">
                    Notifications
                  </h2>
                  <p className="text-[#6B7280]">
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
