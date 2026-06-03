"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Droplet,
  Gem,
  HeartPulse,
} from "lucide-react";
import {
  isDonorRegistrationEnabled,
  type DonationTypeEntry,
} from "@/lib/donations/donation-types";
import {
  questionnaireDonationTypeForSlug,
  withDonationTypeQuery,
} from "@/lib/donations/donation-pathway-questionnaire-type";
import { normalizeDonationTypeForApi } from "@/lib/donors/screeningDonationTypes";
import { Button } from "@/components/button/button.component";

type Props = {
  entry: DonationTypeEntry;
};

function isBlivapIntegration(entry: DonationTypeEntry["integration"]) {
  return (
    entry.kind === "blivap_blood" ||
    entry.kind === "blivap_sperm" ||
    entry.kind === "blivap_ovary"
  );
}

function pathwayIcon(entry: DonationTypeEntry) {
  switch (entry.integration.kind) {
    case "blivap_blood":
      return Droplet;
    case "blivap_sperm":
    case "blivap_ovary":
      return Gem;
    default:
      return HeartPulse;
  }
}

function pathwayTagline(entry: DonationTypeEntry): string {
  switch (entry.integration.kind) {
    case "blivap_blood":
      return "Complete donor registration and screening in Blivap.";
    case "blivap_sperm":
      return "Sperm donor registration and screening.";
    case "blivap_ovary":
      return "Ovum donor registration and screening.";
    default:
      return "Not available in the app yet.";
  }
}

export function DonationTypeFlow({ entry }: Props) {
  const searchParams = useSearchParams();
  const resolvedQuestionnaireDonationType = useMemo(
    () =>
      normalizeDonationTypeForApi(
        searchParams.get("donationType") ??
          questionnaireDonationTypeForSlug(entry.slug),
      ),
    [entry.slug, searchParams],
  );

  const blivap = useMemo(
    () => (isBlivapIntegration(entry.integration) ? entry.integration : null),
    [entry.integration],
  );

  const registrationEnabled = isDonorRegistrationEnabled(entry);
  const Icon = pathwayIcon(entry);
  const registerHref =
    blivap &&
    withDonationTypeQuery(
      blivap.registerHref,
      resolvedQuestionnaireDonationType,
    );

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 md:gap-10">
      <Link
        href="/overview"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Link>

      <header className="flex w-full min-w-0 flex-col gap-5 border-b border-border pb-8 dark:border-white/10">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F9E8EE] text-primary dark:bg-primary/20">
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Donation pathway
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {entry.label}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              {pathwayTagline(entry)}
            </p>
          </div>
        </div>
      </header>

      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-tertiary">
          {blivap && registrationEnabled
            ? "Takes about 10–15 minutes."
            : blivap
              ? "Registration opens soon."
              : "Try blood donation in the meantime."}
        </p>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          {blivap ? (
            <>
              {registrationEnabled && registerHref ? (
                <Button href={registerHref} className="gap-1.5">
                  Continue
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              ) : (
                <Button type="button" disabled>
                  Coming soon
                </Button>
              )}
              <Button variant="outline" href="/overview">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" href="/overview">
                Back to overview
              </Button>
              <Button
                href={withDonationTypeQuery(
                  "/donors/new?type=blood",
                  "whole_blood",
                )}
                className="gap-1.5"
              >
                Blood donor
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
