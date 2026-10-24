"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import type { DonorQuestionnaireResult } from "@/types/donors";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export interface StepThreeProps {
  onContinue?: () => void;
  onBack?: () => void;
  active: boolean;
  /** Outcome after the screening answers are saved. */
  eligibility?: DonorQuestionnaireResult | null;
  optionalContent?: ReactNode;
}

function statusTone(status: string) {
  if (status === "eligible") {
    return {
      wrap: "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/35 dark:border-emerald-500",
      icon: "text-emerald-700 dark:text-emerald-400",
      text: "text-emerald-900 dark:text-emerald-100",
    };
  }
  if (status === "pending_review" || status === "ineligible") {
    return {
      wrap: "border-amber-600 bg-amber-50 dark:bg-amber-950/35 dark:border-amber-500",
      icon: "text-amber-800 dark:text-amber-400",
      text: "text-amber-950 dark:text-amber-100",
    };
  }
  return {
    wrap: "border-[#960018] bg-[#FFE2E2] dark:bg-red-950/25 dark:border-primary",
    icon: "text-primary",
    text: "text-[#5A403F] dark:text-red-100/90",
  };
}

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function statusSummary(status: string): string {
  if (status === "eligible") {
    return "You passed the check. You're a donor and can be matched for donations.";
  }
  return "Your profile didn't pass the check. Contact support if you want another chance. Support will ask for more information before you can try again.";
}

export function StepThree({
  onContinue,
  onBack,
  active,
  eligibility = null,
  optionalContent = null,
}: StepThreeProps) {
  const status = eligibility?.eligibilityStatus ?? "pending";
  const tone = statusTone(status);
  const isDonor = status === "eligible";

  return (
    active && (
      <div className="mt-6 flex flex-col gap-6 xl:mt-10">
        <div className="rounded-xl border border-border bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-[0_10px_25px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-none">
          <h2 className="text-lg font-semibold text-text-primary">
            Eligibility
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Your answers decide whether you become a donor.
          </p>

          <div
            className={`mt-5 border-l-4 flex gap-3 p-4 rounded-r-lg ${tone.wrap}`}
          >
            <Info className={`shrink-0 ${tone.icon}`} size={18} />
            <div className={`text-sm ${tone.text}`}>
              <p className="font-semibold capitalize">
                Eligibility status: {statusLabel(status)}
              </p>
              <p className="mt-1 text-xs">{statusSummary(status)}</p>
              {eligibility?.ineligibilityReasons &&
                eligibility.ineligibilityReasons.length > 0 && (
                  <ul className="mt-2 list-disc pl-4 text-xs space-y-1">
                    {eligibility.ineligibilityReasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
            </div>
          </div>

          {optionalContent ? (
            <div className="mt-5">{optionalContent}</div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-fit rounded-md! px-6 py-2.5"
              >
                Back
              </Button>
            )}
            {isDonor ? (
              <Button
                type="button"
                onClick={onContinue}
                className="w-fit rounded-md! px-6 py-2.5"
              >
                Continue
              </Button>
            ) : (
              <Button
                href={routes.settingsHelpSupport}
                className="w-fit rounded-md! px-6 py-2.5"
              >
                Contact support
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  );
}
