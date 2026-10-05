"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CreditCard,
  HelpCircle,
  History,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

export const SETTINGS_NAV_ITEMS = [
  {
    label: "Personal Information",
    href: routes.settingsPersonalInformation,
    icon: User,
    description: "Name, phone, and profile photo",
  },
  {
    label: "Bank Details",
    href: routes.settingsBankDetails,
    icon: CreditCard,
    description: "Direct deposit for reimbursements",
  },
  {
    label: "Donation History",
    href: routes.settingsDonationHistory,
    icon: History,
    description: "Completed donations timeline",
  },
  {
    label: "Notification Settings",
    href: routes.settingsNotifications,
    icon: Bell,
    description: "Push and alert preferences",
  },
  {
    label: "Privacy & Security",
    href: routes.settingsPrivacySecurity,
    icon: Shield,
    description: "Password and account safety",
  },
  {
    label: "Help & Support",
    href: routes.settingsHelpSupport,
    icon: HelpCircle,
    description: "FAQs and contact options",
  },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-col gap-1 rounded-xl border border-[#DADADA] bg-white p-2 shadow-[0_8px_16px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
    >
      {SETTINGS_NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-[#111827] hover:bg-[#F3F4F6] dark:text-white/90 dark:hover:bg-white/5",
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                active ? "text-primary" : "text-[#6B7280] dark:text-white/50",
              )}
              aria-hidden
            />
            <span className="min-w-0 flex flex-col gap-0.5">
              <span className="text-sm font-semibold leading-tight">
                {item.label}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-snug",
                  active
                    ? "text-primary/80"
                    : "text-[#6B7280] dark:text-white/45",
                )}
              >
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
