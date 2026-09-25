"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Droplet } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { routes } from "@/config/routes";

export function AlreadyDonorGate() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col px-4 pb-6 pt-4 sm:p-6">
      <Link
        href={routes.overview}
        className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Link>

      <div className="flex justify-center items-center h-full">
        <div className="mx-auto flex w-full  max-w-lg flex-col items-center rounded-2xl border border-border bg-white px-6 py-10 text-center dark:border-white/10 dark:bg-[#1a1a22] sm:px-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F9E8EE] text-primary dark:bg-primary/20">
            <Droplet className="size-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            You&apos;re already a donor
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            Your donor profile is already set up on Blivap. You don&apos;t need
            to register again — manage appointments from your bookings.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href={routes.bookings} className="gap-2 rounded-xl!">
              <CalendarDays className="size-4" aria-hidden />
              Check bookings
            </Button>
            <Button
              href={routes.overview}
              variant="outline"
              className="rounded-xl!"
            >
              Back to overview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
