"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { SettingsShell } from "../components/settings-shell";
import {
  SettingsCard,
  SettingsSectionLabel,
} from "../components/settings-card";

const FAQ_ITEMS = [
  {
    question: "How often can I donate whole blood?",
    answer:
      "You can donate whole blood every 56 days. Platelet donations can be made more frequently, typically every 7 days up to 24 times per year.",
  },
  {
    question: "What should I eat before donating?",
    answer:
      "Eat a healthy, low-fat meal and stay well-hydrated. Avoid fatty foods before donation as they can affect test results.",
  },
  {
    question: "Can I donate if I recently got a tattoo?",
    answer:
      "In most cases, yes, as long as the tattoo was applied in a licensed facility and has fully healed. Waiting periods may apply depending on local regulations.",
  },
  {
    question: "How long does a donation take?",
    answer:
      "The entire process takes about an hour, but the actual blood draw usually lasts 8 to 10 minutes.",
  },
];

export default function HelpSupportPage() {
  const { showSnackbar } = useSnackbar();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SettingsShell
      title="Help & Support"
      description="Answers to common questions and ways to reach us."
    >
      <SettingsCard className="flex flex-col gap-3">
        <SettingsSectionLabel title="Frequently Asked Questions" />
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-white/10">
          {FAQ_ITEMS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.question}
                className={
                  index < FAQ_ITEMS.length - 1
                    ? "border-b border-[#E5E7EB] dark:border-white/10"
                    : undefined
                }
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="h-auto w-full justify-between rounded-none px-4 py-3.5 text-left"
                >
                  <span className="pr-3 text-sm font-semibold text-[#111827] dark:text-white/90">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </Button>
                {open ? (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-[#6B7280] dark:text-white/55">
                    {item.answer}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard className="flex flex-col gap-3">
        <SettingsSectionLabel title="Contact Us" />
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-white/10">
          <a
            href="mailto:support@blivap.com"
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/5"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#FFE2E2] text-primary">
              <Mail className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#111827] dark:text-white/90">
                Email Support
              </span>
              <span className="block text-xs text-[#6B7280] dark:text-white/50">
                support@blivap.com
              </span>
            </span>
            <ChevronRight
              className="size-4 text-[#9CA3AF] dark:text-white/40"
              aria-hidden
            />
          </a>
          <hr className="border-[#E5E7EB] dark:border-white/10" />
          <a
            href="tel:+234XXXXXXXXXX"
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/5"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#FFE2E2] text-primary">
              <Phone className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#111827] dark:text-white/90">
                Phone Support
              </span>
              <span className="block text-xs text-[#6B7280] dark:text-white/50">
                +234 XXX XXX XXXX · Mon–Fri, 9AM–5PM WAT
              </span>
            </span>
            <ChevronRight
              className="size-4 text-[#9CA3AF] dark:text-white/40"
              aria-hidden
            />
          </a>
        </div>
      </SettingsCard>

      <Button
        type="button"
        size="sm"
        className="w-fit rounded-md px-5 text-xs font-semibold"
        onClick={() => {
          showSnackbar(
            "Thanks — open email support and include steps to reproduce the issue.",
            "success",
          );
          window.location.href =
            "mailto:support@blivap.com?subject=Blivap%20problem%20report";
        }}
      >
        Report a Problem
      </Button>
    </SettingsShell>
  );
}
