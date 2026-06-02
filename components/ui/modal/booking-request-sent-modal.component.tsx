"use client";

import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal/modal.component";

export type BookingRequestSentModalProps = {
  open: boolean;
  onClose: () => void;
  /** e.g. "Mon, Mar 14 · 10:00 AM" */
  scheduledLabel?: string;
  hospitalName?: string;
};

const NEXT_STEPS = [
  {
    icon: Bell,
    title: "Donor notified",
    description: "They can accept or decline from their bookings.",
  },
  {
    icon: CheckCheck,
    title: "You get updates",
    description: "Status changes appear in your bookings list.",
  },
  {
    icon: Sparkles,
    title: "Meetup codes later",
    description:
      "After acceptance, each of you gets a unique six-digit code in notifications to swap at the hospital.",
  },
] as const;

export function BookingRequestSentModal({
  open,
  onClose,
  scheduledLabel,
  hospitalName,
}: BookingRequestSentModalProps) {
  const hasSummary = Boolean(scheduledLabel || hospitalName);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnBackdropClick={false}
      className="max-w-md gap-0 p-0! sm:max-w-md"
    >
      <div className="w-full">
        <div className="border-b border-primary/10 bg-linear-to-br from-primary/10 via-white to-white px-6 py-6 dark:from-primary/20 dark:via-[#1a1a22] dark:to-[#1a1a22] sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_28px_rgba(150,0,24,0.28)]">
              <CalendarCheck className="size-6" strokeWidth={2} aria-hidden />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary dark:border-primary/30 dark:bg-white/8">
              <Sparkles className="size-3" aria-hidden />
              Request sent
            </span>
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-xl font-semibold text-text-primary sm:text-2xl">
              Appointment request submitted
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Your screening visit is pending. We&apos;ll notify you when the
              donor responds.
            </p>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5 sm:px-7">
          {hasSummary ? (
            <div className="rounded-xl border border-border bg-[#F9FAFB] p-3.5 dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Visit details
              </p>
              <div className="mt-2 space-y-1.5 text-sm text-text-primary">
                {scheduledLabel ? (
                  <p className="flex items-center gap-2">
                    <CalendarCheck
                      className="size-3.5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>{scheduledLabel}</span>
                  </p>
                ) : null}
                {hospitalName ? (
                  <p className="flex items-center gap-2 text-text-secondary">
                    <MapPin
                      className="size-3.5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="truncate">{hospitalName}</span>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              What happens next
            </p>
            <ul className="space-y-2.5">
              {NEXT_STEPS.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-xl border border-border bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#14141a]"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/18">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border bg-[#FAFAFB] px-6 py-4 dark:border-white/10 dark:bg-white/4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href={routes.bookings}>View bookings</Link>
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
