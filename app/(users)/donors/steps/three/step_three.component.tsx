"use client";

import { Info } from "lucide-react";
import type { DonorQuestionnaireResult } from "@/types/donors";
import { Button } from "@/components/button/button.component";

export interface StepThreeProps {
  onSendRequest: () => void | Promise<void>;
  onRequestRetake?: () => void | Promise<void>;
  onBack?: () => void;
  isSendingRequest?: boolean;
  requestError?: string | null;
  active: boolean;
  /** Set after POST /donors/questionnaire succeeds. */
  eligibility?: DonorQuestionnaireResult | null;
}
function statusTone(status: string) {
  if (status === "eligible" || status === "pending_review") {
    return {
      wrap: "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/35 dark:border-emerald-500",
      icon: "text-emerald-700 dark:text-emerald-400",
      text: "text-emerald-900 dark:text-emerald-100",
    };
  }
  if (status === "ineligible") {
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
    return "You meet the current eligibility checks and can request donor activation.";
  }
  if (status === "pending_review") {
    return "Your answers require manual review. Submit activation so we can verify and finish onboarding.";
  }
  if (status === "ineligible") {
    return "You are currently marked as ineligible and cannot submit activation right now.";
  }
  return "Your questionnaire was received. Submit activation so our team can process verification.";
}

export function StepThree({
  onSendRequest,
  onRequestRetake,
  onBack,
  isSendingRequest = false,
  requestError = null,
  active,
  eligibility = null,
}: StepThreeProps) {
  const status = eligibility?.eligibilityStatus ?? "pending";
  const tone = statusTone(status);
  const isIneligible = status === "ineligible";

  return (
    active && (
      <div className="flex flex-col gap-6 mt-6 xl:mt-10 overflow-hidden">
        <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-[0_10px_25px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-none">
          <h2 className="text-lg font-semibold text-text-primary">
            Eligibility and activation request
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Review your eligibility outcome and submit your final activation
            request.
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

          <div className="mt-5 rounded-lg border border-border bg-[#FAFAFA] px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-medium text-text-primary">Next step</p>
            <p className="mt-1 text-xs text-text-secondary">
              Send activation to start donor verification. You will see a
              confirmation modal and can continue to your overview page.
            </p>
          </div>

          {requestError && (
            <p
              className="mt-4 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {requestError}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-fit rounded-md! px-5 py-2"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              disabled={isSendingRequest}
              loading={isSendingRequest}
              onClick={() =>
                void (isIneligible && onRequestRetake
                  ? onRequestRetake()
                  : onSendRequest())
              }
              className="w-fit rounded-md! px-5 py-2"
            >
              {isIneligible ? "Request retake" : "Send request"}
            </Button>
            {isIneligible && (
              <p className="text-xs text-text-secondary">
                You can request to retake the donor process.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  );
}
