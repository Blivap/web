"use client";

import classNames from "classnames";
import {
  Award,
  Bus,
  Coins,
  Gift,
  Heart,
  HeartHandshake,
  Info,
  Landmark,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
const BALANCE_LABEL = "Donor Support Balance";
const BALANCE_SUBLABEL = "Impact Rewards";

const BREAKDOWN = [
  {
    title: "Transport Reimbursements",
    description: "Support for your travel to safe donation sites",
    amount: "₦4,200",
    icon: Bus,
    tone: "bg-[#FFF5F5] text-primary",
  },
  {
    title: "Donation Rewards Points",
    description: "Recognition for your time and commitment",
    amount: "1,240 pts",
    icon: Sparkles,
    tone: "bg-[#F0F9FA] text-secondary",
  },
  {
    title: "Sponsored Bonuses",
    description: "Partner gratitude for humanitarian contribution",
    amount: "₦1,500",
    icon: Gift,
    tone: "bg-[#FFF8F0] text-[#B45309]",
  },
  {
    title: "Referral Earnings",
    description: "When someone you encouraged donates voluntarily",
    amount: "₦800",
    icon: Users,
    tone: "bg-[#F5F3FF] text-[#5B21B6]",
  },
] as const;

const DONATION_HISTORY = [
  {
    date: "18 Mar 2026",
    location: "National Blood Transfusion Service, Abuja",
    reward: "₦1,200",
    rewardLabel: "Appreciation Bonus",
  },
  {
    date: "2 Feb 2026",
    location: "Lagos University Teaching Hospital",
    reward: "800 pts",
    rewardLabel: "Support Credit",
  },
  {
    date: "12 Dec 2025",
    location: "Red Cross Centre, Port Harcourt",
    reward: "₦950",
    rewardLabel: "Appreciation Bonus",
  },
] as const;

const REDEMPTION = [
  {
    title: "Airtime & data",
    subtitle: "Top up your line as a thank-you for your journey",
    icon: Phone,
  },
  {
    title: "Bill payments",
    subtitle: "Utility and essentials — support, not compensation for donation",
    icon: Landmark,
  },
  {
    title: "Health services discounts",
    subtitle: "Partner clinics for check-ups and wellness",
    icon: Stethoscope,
  },
] as const;

const MILESTONES = [
  { count: 3, label: "3 donations", unlocked: true, highlight: false },
  { count: 5, label: "5 donations", unlocked: true, highlight: true },
  { count: 10, label: "10 donations", unlocked: false, highlight: false },
] as const;

function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={classNames(
        "text-xs font-bold uppercase tracking-wide text-text-primary",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function BreakdownRow({
  title,
  description,
  amount,
  icon: Icon,
  tone,
}: (typeof BREAKDOWN)[number]) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#E8E6E3] bg-white px-4 py-3.5 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
      <div
        className={classNames(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          tone,
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-text-primary tabular-nums">
        {amount}
      </p>
    </div>
  );
}

function RedemptionCard({
  title,
  subtitle,
  icon: Icon,
}: (typeof REDEMPTION)[number]) {
  return (
    <button
      type="button"
      className="flex w-full flex-col items-start gap-2 rounded-xl border border-[#E8E6E3] bg-white px-4 py-4 text-left shadow-sm transition hover:border-primary/25 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/10 dark:bg-[#1a1a22]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF5F5] text-primary dark:bg-primary/15">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="text-sm font-semibold text-text-primary">{title}</span>
      <span className="text-xs leading-relaxed text-text-secondary">
        {subtitle}
      </span>
    </button>
  );
}

export function WalletPageView() {
  const donationsCount = 5;
  const livesSaved = donationsCount * 3;
  const nextMilestone = 10;
  const progressPct = Math.min(100, (donationsCount / nextMilestone) * 100);

  return (
    <div className="mx-auto flex  flex-col gap-6 pb-10">
      {/* Hero balance */}
      <div className="overflow-hidden rounded-2xl bg-linear-to-br from-primary via-[#7a0014] to-[#5c0010] px-5 py-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
              {BALANCE_SUBLABEL}
            </p>
            <p className="mt-1 text-lg font-bold leading-tight">
              {BALANCE_LABEL}
            </p>
          </div>
          <HeartHandshake
            className="h-9 w-9 shrink-0 text-white/90"
            strokeWidth={1.5}
          />
        </div>
        <p className="mt-5 font-helvetica text-3xl font-bold tracking-tight tabular-nums">
          ₦12,450
          <span className="ml-2 text-base font-semibold text-white/80">
            + 2,040 pts
          </span>
        </p>
        <p className="mt-3 text-xs leading-relaxed text-white/90">
          Rewards recognise your humanitarian contribution, time, and logistics
          support — never payment for blood. All benefits follow Nigerian
          voluntary donation principles.
        </p>
      </div>

      {/* Voluntary first + compliance */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E8E6E3] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
        <div className="flex gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            strokeWidth={1.75}
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Voluntary donation first
            </p>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Blivap aligns with Nigerian National Blood Policy and NBTS
              guidance: donation is voluntary, unpaid, and safe. Support credits
              are stipends for transport and appreciation only.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#F8F6F4] px-3 py-2.5 dark:bg-white/[0.06]">
          <Award className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">
              Compliance note:
            </span>{" "}
            Informational only; always follow facility staff and national health
            guidelines for screening and donation.
          </p>
        </div>
      </div>

      {/* Educational banner */}
      <div className="flex gap-3 rounded-xl border border-primary/15 bg-[#FFF9F9] px-4 py-3.5 dark:bg-primary/10">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Safe blood saves lives
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            Every unit is tested and traced. Rest, hydrate, and donate only when
            you are well — your health comes first.
          </p>
        </div>
      </div>

      {/* Lives + milestones */}
      <section className="rounded-xl border border-[#E8E6E3] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
        <SectionTitle>Your impact</SectionTitle>
        <div className="mt-4 flex items-baseline gap-2">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <p className="font-helvetica text-2xl font-bold text-text-primary">
            You&apos;ve helped save up to{" "}
            <span className="text-primary">{livesSaved}</span> lives
          </p>
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Estimates vary by clinical need; every donation matters.
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-medium text-text-secondary">
              Next milestone: {nextMilestone} donations
            </span>
            <span className="tabular-nums text-text-tertiary">
              {donationsCount} / {nextMilestone}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#EEEAE6] dark:bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-[#c41e3a] transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {MILESTONES.map((m) => (
            <span
              key={m.label}
              className={classNames(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                m.unlocked
                  ? m.highlight
                    ? "border-primary/40 bg-[#FFF5F5] text-primary dark:bg-primary/15"
                    : "border-[#E8E6E3] bg-[#FAFAF9] text-text-primary dark:border-white/10 dark:bg-white/[0.05]"
                  : "border-dashed border-[#D4D0CB] text-text-tertiary dark:border-white/20",
              )}
            >
              <Coins className="h-3.5 w-3.5" />
              {m.label}
              {m.unlocked ? " · Unlocked" : ""}
            </span>
          ))}
        </div>
      </section>

      {/* Breakdown */}
      <section>
        <SectionTitle className="px-0.5">Balance breakdown</SectionTitle>
        <p className="mt-2 px-0.5 text-xs leading-relaxed text-text-secondary">
          Transparent categories so you see how support is allocated — still not
          remuneration for blood products.
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          {BREAKDOWN.map((row) => (
            <BreakdownRow key={row.title} {...row} />
          ))}
        </div>
      </section>

      {/* Redemption */}
      <section>
        <SectionTitle className="px-0.5">Use your support credits</SectionTitle>
        <p className="mt-2 px-0.5 text-xs text-text-secondary">
          Redeem thoughtfully — these options honour your effort, not a sale.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-1">
          {REDEMPTION.map((item) => (
            <RedemptionCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* History */}
      <section className="rounded-xl border border-[#E8E6E3] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
        <SectionTitle>Donation history</SectionTitle>
        <ul className="mt-4 flex flex-col divide-y divide-[#F0EEEB] dark:divide-white/10">
          {DONATION_HISTORY.map((row) => (
            <li
              key={`${row.date}-${row.location}`}
              className="flex flex-col gap-1 py-4 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {row.date}
                </span>
                <span className="text-xs font-medium text-text-tertiary">
                  {row.rewardLabel}
                </span>
              </div>
              <p className="text-xs text-text-secondary">{row.location}</p>
              <p className="text-sm font-semibold tabular-nums text-primary">
                {row.reward}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
