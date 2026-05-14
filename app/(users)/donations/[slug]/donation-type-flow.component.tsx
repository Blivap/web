"use client";

import Link from "next/link";
import classNames from "classnames";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/forms/checkbox/checkbox.component";
import type { DonationTypeEntry } from "@/lib/donations/donation-types";
import {
  questionnaireDonationTypeForSlug,
  withDonationTypeQuery,
} from "@/lib/donations/donation-pathway-questionnaire-type";
import { normalizeDonationTypeForApi } from "@/lib/donors/screeningDonationTypes";
import { Button } from "@/components/ui/button";

const linkPrimaryClass =
  "inline-flex items-center justify-center rounded-md py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#14141a] bg-primary text-white hover:bg-primary/90";

const linkOutlineClass =
  "inline-flex items-center justify-center rounded-md py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#14141a] border border-primary text-primary bg-transparent hover:bg-primary/5";

type Props = {
  entry: DonationTypeEntry;
};

type InterestStepValues = {
  cityRegion: string;
  notes: string;
  consent: boolean;
};

const cardClass =
  "rounded-xl border border-[#DADADA] bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#1a1a22]";

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-[#1a1a22]";

function isBlivapIntegration(entry: DonationTypeEntry["integration"]) {
  return (
    entry.kind === "blivap_blood" ||
    entry.kind === "blivap_sperm" ||
    entry.kind === "blivap_ovary"
  );
}

function integrationLabel(entry: DonationTypeEntry["integration"]): string {
  switch (entry.kind) {
    case "blivap_blood":
      return "Blood donor registration";
    case "blivap_sperm":
      return "Sperm donor registration";
    case "blivap_ovary":
      return "Ovum donor registration";
    default:
      return "";
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

  const [integratedStep, setIntegratedStep] = useState<1 | 2>(1);
  const [interestStep, setInterestStep] = useState<1 | 2 | 3>(1);
  const [interestForm, setInterestForm] = useState<InterestStepValues>({
    cityRegion: "",
    notes: "",
    consent: false,
  });
  const [interestError, setInterestError] = useState<string | null>(null);

  const resetInterest = () => {
    setInterestStep(1);
    setInterestForm({ cityRegion: "", notes: "", consent: false });
    setInterestError(null);
  };

  const handleInterestContinue = () => {
    setInterestError(null);
    if (interestStep === 1) {
      setInterestStep(2);
      return;
    }
    if (interestStep === 2) {
      if (!interestForm.consent) {
        setInterestError(
          "Please confirm you understand this pathway is not yet fully live in Blivap.",
        );
        return;
      }
      setInterestStep(3);
    }
  };

  const handleInterestBack = () => {
    setInterestError(null);
    if (interestStep === 2) setInterestStep(1);
    else if (interestStep === 3) setInterestStep(2);
  };

  if (blivap) {
    return (
      <div className="flex w-full flex-1 flex-col gap-6 sm:p-6">
        <div className="flex flex-col gap-4">
          <Link
            href="/overview"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to overview
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {integrationLabel(blivap)}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-text-primary">
              {entry.label}
            </h1>
          </div>
        </div>

        <nav className="flex gap-2 text-xs font-medium text-text-secondary">
          <span
            className={
              integratedStep === 1 ? "text-primary" : "text-text-tertiary"
            }
          >
            1. About this path
          </span>
          <span aria-hidden className="text-text-tertiary">
            /
          </span>
          <span
            className={
              integratedStep === 2 ? "text-primary" : "text-text-tertiary"
            }
          >
            2. Continue in Blivap
          </span>
        </nav>

        {integratedStep === 1 ? (
          <div className={`flex flex-col gap-4 ${cardClass}`}>
            <p className="text-sm leading-relaxed text-text-secondary">
              {entry.summary}
            </p>
            <Button
              type="button"
              onClick={() => setIntegratedStep(2)}
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className={`flex flex-col gap-5 ${cardClass}`}>
            <p className="text-sm leading-relaxed text-text-secondary">
              You are about to open the live Blivap flow for{" "}
              <span className="font-medium text-text-primary">
                {integrationLabel(blivap)}
              </span>
              . Your answers there are saved to your donor profile for review.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIntegratedStep(1)}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                href={withDonationTypeQuery(
                  blivap.registerHref,
                  resolvedQuestionnaireDonationType,
                )}
              >
                Open registration
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 sm:p-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/overview"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to overview
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Interest and next steps
          </p>
          <h1 className="mt-1 text-2xl font-bold text-text-primary">
            {entry.label}
          </h1>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 text-xs font-medium text-text-secondary">
        {(
          [
            [1, "1. Overview"],
            [2, "2. Your interest"],
            [3, "3. Done"],
          ] as const
        ).map(([n, label]) => (
          <span key={n}>
            <span
              className={
                interestStep === n ? "text-primary" : "text-text-tertiary"
              }
            >
              {label}
            </span>
            {n < 3 ? (
              <span aria-hidden className="px-2 text-text-tertiary">
                /
              </span>
            ) : null}
          </span>
        ))}
      </nav>

      {interestStep === 1 ? (
        <div className={`flex flex-col gap-4 ${cardClass}`}>
          <p className="text-sm leading-relaxed text-text-secondary">
            {entry.summary}
          </p>
          <p className="text-sm leading-relaxed text-text-secondary">
            This pathway is not yet connected to a full registration wizard in
            Blivap. The next steps capture your interest so we can prioritize
            what to build and how to guide you safely when programs go live.
          </p>
          <Button
            type="button"
            onClick={() => setInterestStep(2)}
            className="w-full sm:w-auto"
          >
            Continue
          </Button>
        </div>
      ) : null}

      {interestStep === 2 ? (
        <div className={`flex flex-col gap-5 ${cardClass}`}>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="donation-interest-region"
              className="text-sm font-medium text-text-primary"
            >
              City or region (optional)
            </label>
            <input
              id="donation-interest-region"
              className={inputClass}
              value={interestForm.cityRegion}
              onChange={(e) =>
                setInterestForm((p) => ({ ...p, cityRegion: e.target.value }))
              }
              placeholder="e.g. Lagos, Nigeria"
              autoComplete="address-level2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="donation-interest-notes"
              className="text-sm font-medium text-text-primary"
            >
              Notes (optional)
            </label>
            <textarea
              id="donation-interest-notes"
              className={`${inputClass} min-h-[100px] resize-y`}
              value={interestForm.notes}
              onChange={(e) =>
                setInterestForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Anything you want the team to know about your interest or timing."
            />
          </div>
          <Checkbox
            name="donation-interest-consent"
            value={interestForm.consent}
            onChange={(checked) =>
              setInterestForm((p) => ({ ...p, consent: checked }))
            }
            label="I understand this pathway is not yet fully supported in Blivap and that clinical decisions still happen with licensed professionals and programs."
          />
          {interestError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {interestError}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleInterestBack}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleInterestContinue}
              className="w-full sm:w-auto"
            >
              Save interest locally
            </Button>
          </div>
        </div>
      ) : null}

      {interestStep === 3 ? (
        <div className={`flex flex-col gap-5 ${cardClass}`}>
          <p className="text-sm font-medium text-text-primary">
            Thanks — your interest for “{entry.label}” is noted in this session.
          </p>
          <p className="text-sm leading-relaxed text-text-secondary">
            Blivap does not yet send this to a care team. When server-side
            interest capture ships, the same fields will be ready to store your
            preferences. For now you can explore another pathway or return to
            your overview.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={resetInterest}
              className="w-full sm:w-auto"
            >
              Start this flow again
            </Button>
            <Link
              href="/overview"
              className={classNames(linkOutlineClass, "w-full sm:w-auto")}
            >
              Back to overview
            </Link>
            <Link
              href={withDonationTypeQuery(
                "/donors/new?type=blood",
                "whole_blood",
              )}
              className={classNames(linkPrimaryClass, "w-full sm:w-auto")}
            >
              Blood donor registration
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
