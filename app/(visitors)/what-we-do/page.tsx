"use client";

import { HomeLayout } from "@/layout/home.layout.component";
import Link from "next/link";
import { Droplet, Heart, Users, Target } from "lucide-react";
import Image from "next/image";

export default function WhatWeDo() {
  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col py-6 sm:py-8 text-[#111827] dark:text-slate-300">
        <h1 className="font-semibold text-primary text-lg sm:text-xl tracking-tight mb-6">
          What we do
        </h1>

        <div className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-base text-black dark:text-white">
                Connecting donors and recipients
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 leading-relaxed">
                Blivap connects people who need blood or sperm with willing
                donors. We match compatible blood groups and facilitate the
                process. Our mission is to address the blood crisis and make
                life-saving donations accessible—using technology for a safe,
                efficient ecosystem.
              </p>
            </div>
            <div className="relative h-40 sm:h-52 overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/10">
              <Image
                src="/images/hero_image.jpg"
                alt="What we do"
                fill
                className="object-cover rounded-lg opacity-90"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Droplet,
                title: "Blood donation",
                desc: "Connect blood donors with recipients. We match compatible types and facilitate safe donations through verified facilities.",
                color: "bg-[#FDF2F4] dark:bg-primary/15",
              },
              {
                icon: Heart,
                title: "Sperm donation",
                desc: "Help individuals and couples find sperm donors. Secure, confidential, with quality and compatibility matching.",
                color: "bg-[#EEF2FF] dark:bg-sky-500/15",
              },
              {
                icon: Users,
                title: "Community support",
                desc: "Community of donors and recipients, with education, resources, and ongoing support.",
                color: "bg-[#F5F3FF] dark:bg-indigo-500/15",
              },
            ].map((service, i) => (
              <div
                key={i}
                className="bg-white text-[#111827] dark:bg-[#111827] dark:text-white p-3 sm:p-4 rounded-lg border border-[#E5E7EB] dark:border-white/10 text-center"
              >
                <div
                  className={`${service.color} p-2 rounded-full w-fit mx-auto mb-2`}
                >
                  <service.icon className="text-primary" size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">
                  {service.title}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#F9FAFB] text-[#111827] dark:bg-[#0F172A] dark:text-white p-4 rounded-lg border border-[#E5E7EB] dark:border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-primary" size={18} />
              <h2 className="font-semibold text-base text-black dark:text-white">Our impact</h2>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed mb-4">
              Blivap has facilitated thousands of donations across Nigeria.
              We&apos;re expanding access to life-saving donations and improving
              healthcare outcomes.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { number: "10,000+", label: "Successful donations" },
                { number: "5,000+", label: "Active donors" },
                { number: "50+", label: "Partner facilities" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white text-[#111827] dark:bg-[#111827] dark:text-white p-2.5 rounded-md text-center border border-[#E5E7EB] dark:border-white/10"
                >
                  <p className="text-sm font-semibold text-primary">
                    {stat.number}
                  </p>
                  <p className="text-[10px] text-[#6B7280] dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/about-donating"
                className="text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 text-white rounded-md inline-block transition-colors"
              >
                Become a donor
              </Link>
              <Link
                href="/about"
                className="text-xs font-medium py-2 px-3.5 border border-primary text-primary hover:bg-primary/10 dark:border-primary/30 dark:hover:bg-primary/15 rounded-md inline-block transition-colors"
              >
                Learn more about Blivap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
