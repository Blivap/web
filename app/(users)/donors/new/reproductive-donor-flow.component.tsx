"use client";

import { Button } from "@/components/button/button.component";
import { Checkbox } from "@/components/forms/checkbox/checkbox.component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DonorRegistrationType } from "./donor-registration-type";
import { DonorRegistrationSuccessModal } from "./donor-registration-success-modal.component";
import { navigateOutAfterSuccess } from "@/lib/navigation/navigateOutAfterSuccess";
import {
  DONOR_COUNTRIES,
  getNonNgCityRows,
  getNonNgStateRows,
  nigeriaCityRowsForState,
  OVARY_CYCLE_OPTIONS,
  OVARY_MOTIVATION_OPTIONS,
  OVARY_PREGNANCY_HISTORY_OPTIONS,
  parseNigeriaCityValue,
  REPRODUCTIVE_EDUCATION_OPTIONS,
  SPERM_GENOTYPE_BLOOD_OPTIONS,
  SPERM_MOTIVATION_OPTIONS,
  YES_NO_NOT_SURE_OPTIONS,
} from "@/lib/donors/reproductiveDonorSelectOptions";
import { NIGERIA_STATES } from "@/lib/donors/location-options";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";

function countryLabel(code: string): string {
  const row = DONOR_COUNTRIES.find((c) => c.value === code);
  return row?.label ?? code;
}

function optionLabel(
  opts: readonly { value: string; label: string }[],
  value: string,
): string {
  return opts.find((o) => o.value === value)?.label ?? value;
}

type ReproductiveFormValues = {
  ageRange: string;
  profileQualifier: string;
  secondaryQualifier: string;
  country: string;
  state: string;
  city: string;
  availability: string;
  screeningOne: string;
  screeningTwo: string;
  hereditaryHistory: string;
  willingForScreening: string;
  recentHealthIssue: string;
  motivation: string;
  consent: boolean;
};

type FlowConfig = {
  typeLabel: string;
  title: string;
  description: string;
  stepOneLabel: string;
  stepTwoLabel: string;
  stepThreeLabel: string;
  ageQuestion: string;
  ageOptions: string[];
  profileQualifierLabel: string;
  profileQualifierPlaceholder: string;
  secondaryQualifierLabel: string;
  secondaryQualifierPlaceholder: string;
  screeningOneLabel: string;
  screeningTwoLabel: string;
  reviewHighlights: string[];
  successTitle: string;
  successDescription: string;
  successHighlights: {
    title: string;
    description: string;
  }[];
  successFooterNote: string;
};

const AVAILABILITY_OPTIONS = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "flexible", label: "Flexible" },
  { value: "by appointment", label: "By appointment" },
];

const DEFAULT_VALUES: ReproductiveFormValues = {
  ageRange: "",
  profileQualifier: "",
  secondaryQualifier: "",
  country: "",
  state: "",
  city: "",
  availability: "",
  screeningOne: "",
  screeningTwo: "",
  hereditaryHistory: "",
  willingForScreening: "",
  recentHealthIssue: "",
  motivation: "",
  consent: false,
};

const FLOW_CONFIG: Record<Exclude<DonorRegistrationType, "blood">, FlowConfig> = {
  sperm: {
    typeLabel: "Sperm donor",
    title: "Sperm donor screening",
    description:
      "This path focuses on availability, personal background, and the lifestyle screening commonly discussed before lab assessment.",
    stepOneLabel: "Profile & availability",
    stepTwoLabel: "Lifestyle screening",
    stepThreeLabel: "Review & consent",
    ageQuestion: "Which age bracket fits you best?",
    ageOptions: ["21-25", "26-30", "31-35", "36-40"],
    profileQualifierLabel: "Highest education completed",
    profileQualifierPlaceholder: "e.g. Bachelors degree",
    secondaryQualifierLabel: "Genotype / blood group information",
    secondaryQualifierPlaceholder: "e.g. AA, AS, O+, or Unknown",
    screeningOneLabel: "Do you currently smoke or use nicotine products?",
    screeningTwoLabel: "Have you had any recent high-risk lifestyle exposure?",
    reviewHighlights: [
      "Profile review and availability check",
      "Lifestyle and hereditary screening",
      "Clinic follow-up after manual review",
    ],
    successTitle: "Your sperm donor profile is ready for review",
    successDescription:
      "You have completed the sperm donor registration steps for this path. Your profile details, screening answers, and availability are now packaged for the next review stage.",
    successHighlights: [
      {
        title: "Profile summary saved",
        description:
          "Your personal background, genotype details, and availability are captured in this flow.",
      },
      {
        title: "Lifestyle screening complete",
        description:
          "The screening questions you answered now shape the next donor review conversation.",
      },
      {
        title: "Return with confidence",
        description:
          "You can leave this screen and continue using the rest of your account from overview.",
      },
    ],
    successFooterNote:
      "You can return to overview now while this donor path waits for its next stage.",
  },
  ovary: {
    typeLabel: "Ovary donor",
    title: "Ovary donor screening",
    description:
      "This path collects cycle-related information, location, and early medical screening before a fertility specialist follows up.",
    stepOneLabel: "Profile & cycle details",
    stepTwoLabel: "Medical screening",
    stepThreeLabel: "Review & consent",
    ageQuestion: "Which age bracket fits you best?",
    ageOptions: ["21-24", "25-28", "29-32", "33-35"],
    profileQualifierLabel: "Menstrual cycle regularity",
    profileQualifierPlaceholder: "e.g. Regular, Irregular, Not sure",
    secondaryQualifierLabel: "Pregnancy / fertility history",
    secondaryQualifierPlaceholder: "e.g. No prior pregnancy, One prior pregnancy",
    screeningOneLabel: "Have you used hormonal treatment in the past 6 months?",
    screeningTwoLabel: "Have you had pelvic or ovarian surgery before?",
    reviewHighlights: [
      "Cycle and fertility background review",
      "Medical screening and hereditary history",
      "Specialist follow-up after manual review",
    ],
    successTitle: "Your ovary donor profile is ready for review",
    successDescription:
      "You have completed the ovary donor registration steps for this path. Your cycle details, medical screening responses, and availability are now ready for the next review stage.",
    successHighlights: [
      {
        title: "Cycle details captured",
        description:
          "Your cycle and fertility background are now included in this donor-specific registration path.",
      },
      {
        title: "Screening responses prepared",
        description:
          "Your medical screening answers will guide the next follow-up stage for this flow.",
      },
      {
        title: "Overview remains available",
        description:
          "You can continue using your account normally after leaving this screen.",
      },
    ],
    successFooterNote:
      "You do not need to stay on this page once this donor path has been completed.",
  },
};

function StepPill({
  index,
  label,
  active,
  completed,
}: {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 transition-colors ${
        active
          ? "border-primary/25 bg-primary/8"
          : completed
            ? "border-primary/20 bg-primary/5"
            : "border-border bg-white dark:border-white/10 dark:bg-[#1a1a22]"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
        Step {index}
      </p>
      <p className="mt-1 text-sm font-medium text-text-primary">{label}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-[720px] text-sm text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3 dark:bg-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-1 text-sm text-text-primary">{value || "Not provided"}</p>
    </div>
  );
}

export function ReproductiveDonorFlow({
  donorType,
}: {
  donorType: Exclude<DonorRegistrationType, "blood">;
}) {
  const router = useRouter();
  const config = FLOW_CONFIG[donorType];
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<ReproductiveFormValues>(DEFAULT_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const stepLabels = useMemo(
    () => [config.stepOneLabel, config.stepTwoLabel, config.stepThreeLabel],
    [config.stepOneLabel, config.stepThreeLabel, config.stepTwoLabel],
  );

  const isNigeria = values.country === "NG";
  const ngCityRows = useMemo(
    () => nigeriaCityRowsForState(values.state),
    [values.state],
  );
  const ngCityCombined = useMemo(() => {
    if (!isNigeria || !values.state || !values.city) return "";
    const key = `${values.state}::${values.city}`;
    return ngCityRows.some((r) => r.value === key) ? key : "";
  }, [isNigeria, values.state, values.city, ngCityRows]);

  const nonNgStateRows = useMemo(
    () => getNonNgStateRows(values.country),
    [values.country],
  );
  const nonNgCityRows = useMemo(
    () => getNonNgCityRows(values.country, values.state),
    [values.country, values.state],
  );

  const profileRows = useMemo(
    () =>
      donorType === "sperm"
        ? REPRODUCTIVE_EDUCATION_OPTIONS
        : OVARY_CYCLE_OPTIONS,
    [donorType],
  );
  const secondaryRows = useMemo(
    () =>
      donorType === "sperm"
        ? SPERM_GENOTYPE_BLOOD_OPTIONS
        : OVARY_PREGNANCY_HISTORY_OPTIONS,
    [donorType],
  );
  const motivationRows = useMemo(
    () =>
      donorType === "sperm"
        ? SPERM_MOTIVATION_OPTIONS
        : OVARY_MOTIVATION_OPTIONS,
    [donorType],
  );

  const updateValue = <K extends keyof ReproductiveFormValues>(
    field: K,
    value: ReproductiveFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 1) {
      if (!values.ageRange) return "Select an age bracket.";
      if (!values.profileQualifier) {
        return `Select ${config.profileQualifierLabel.toLowerCase()}.`;
      }
      if (!values.secondaryQualifier) {
        return `Select ${config.secondaryQualifierLabel.toLowerCase()}.`;
      }
      if (!values.country || !values.state || !values.city) {
        return "Select country, state or region, and city.";
      }
      if (!values.availability) return "Select your availability.";
    }

    if (currentStep === 2) {
      if (!values.screeningOne) return "Select an answer for the first question.";
      if (!values.screeningTwo) return "Select an answer for the second question.";
      if (!values.hereditaryHistory) {
        return "Select an answer for hereditary health history.";
      }
      if (!values.willingForScreening) {
        return "Select whether you are open to further screening.";
      }
      if (!values.recentHealthIssue) {
        return "Select an answer about recent health issues.";
      }
      if (!values.motivation) {
        return "Select why you want to proceed.";
      }
    }

    if (currentStep === 3 && !values.consent) {
      return "You need to confirm the consent statement before finishing.";
    }

    return null;
  };

  const handleNext = () => {
    const validationError = validateStep(step);
    setError(validationError);
    if (validationError) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const handleBack = () => {
    setError(null);
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleFinish = () => {
    const validationError = validateStep(3);
    setError(validationError);
    if (validationError) return;
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-6 sm:p-6">
      <div className="rounded-3xl border border-primary/12 bg-primary/5 p-5 dark:border-primary/15 dark:bg-primary/10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          {config.typeLabel}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {config.title}
        </h1>
        <p className="mt-2 max-w-[760px] text-sm text-text-secondary">
          {config.description}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stepLabels.map((label, index) => (
          <StepPill
            key={label}
            index={index + 1}
            label={label}
            active={step === index + 1}
            completed={step > index + 1}
          />
        ))}
      </div>

      {step === 1 ? (
        <SectionCard
          title={config.stepOneLabel}
          description="These donor-specific details decide the screening path you will see next. Answers use fixed lists only (no free typing) so coordinators see consistent, comparable profiles."
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-text-primary">
                {config.ageQuestion}
              </label>
              <Select
                value={values.ageRange || undefined}
                onValueChange={(value) => updateValue("ageRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  {config.ageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldShell label={config.profileQualifierLabel}>
                <Select
                  value={values.profileQualifier || undefined}
                  onValueChange={(value) => updateValue("profileQualifier", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        donorType === "sperm"
                          ? "Select education level"
                          : "Select cycle regularity"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {profileRows.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
              <FieldShell label={config.secondaryQualifierLabel}>
                <Select
                  value={values.secondaryQualifier || undefined}
                  onValueChange={(value) =>
                    updateValue("secondaryQualifier", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        donorType === "sperm"
                          ? "Select genotype or blood group"
                          : "Select pregnancy / fertility history"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {secondaryRows.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FieldShell label="Country">
                <Select
                  value={values.country || undefined}
                  onValueChange={(value) => {
                    updateValue("country", value);
                    updateValue("state", "");
                    updateValue("city", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {DONOR_COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
              <FieldShell label="State / region">
                {isNigeria ? (
                  <Select
                    value={values.state || undefined}
                    onValueChange={(value) => {
                      updateValue("state", value);
                      updateValue("city", "");
                    }}
                    disabled={!values.country}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {NIGERIA_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={values.state || undefined}
                    onValueChange={(value) => {
                      updateValue("state", value);
                      updateValue("city", "");
                    }}
                    disabled={!values.country}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {nonNgStateRows.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FieldShell>
              <FieldShell label="City / town">
                {isNigeria ? (
                  <Select
                    value={ngCityCombined || undefined}
                    onValueChange={(combined) => {
                      const parsed = parseNigeriaCityValue(combined);
                      if (parsed) {
                        updateValue("state", parsed.state);
                        updateValue("city", parsed.city);
                      }
                    }}
                    disabled={!values.state}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {ngCityRows.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={values.city || undefined}
                    onValueChange={(value) => updateValue("city", value)}
                    disabled={!values.country || !values.state}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select city or area" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {nonNgCityRows.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FieldShell>
            </div>

            <FieldShell label="Availability">
              <Select
                value={values.availability || undefined}
                onValueChange={(value) => updateValue("availability", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldShell>
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard
          title={config.stepTwoLabel}
          description="These questions shape the manual review procedure before a specialist reaches out."
        >
          <div className="flex flex-col gap-6">
            {[
              {
                field: "screeningOne" as const,
                label: config.screeningOneLabel,
              },
              {
                field: "screeningTwo" as const,
                label: config.screeningTwoLabel,
              },
              {
                field: "hereditaryHistory" as const,
                label: "Are you aware of any hereditary medical condition in your family history?",
              },
              {
                field: "willingForScreening" as const,
                label: "Are you willing to continue with lab and specialist screening if invited?",
              },
              {
                field: "recentHealthIssue" as const,
                label: "Have you had any recent illness, fever, or unresolved health concern?",
              },
            ].map((question) => (
              <FieldShell key={question.field} label={question.label}>
                <Select
                  value={values[question.field] || undefined}
                  onValueChange={(value) => updateValue(question.field, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_NOT_SURE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            ))}

            <FieldShell label="Why would you like to continue with this donor path?">
              <Select
                value={values.motivation || undefined}
                onValueChange={(value) => updateValue("motivation", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {motivationRows.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldShell>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard
          title={config.stepThreeLabel}
          description="Review the donor-type-specific information captured in this UI flow before you finish."
        >
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
              <p className="text-sm font-medium text-text-primary">
                This donor type currently uses a frontend-only procedure.
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Blood donor registration remains the live backend-connected flow.
                These sperm and ovary donor screens now change based on the
                selected query type and can be wired to backend submission next.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ReviewRow label="Age range" value={values.ageRange} />
              <ReviewRow
                label={config.profileQualifierLabel}
                value={optionLabel(profileRows, values.profileQualifier)}
              />
              <ReviewRow
                label={config.secondaryQualifierLabel}
                value={optionLabel(secondaryRows, values.secondaryQualifier)}
              />
              <ReviewRow
                label="Location"
                value={[values.city, values.state, countryLabel(values.country)]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <ReviewRow
                label="Availability"
                value={optionLabel(AVAILABILITY_OPTIONS, values.availability)}
              />
              <ReviewRow
                label="Motivation"
                value={optionLabel(motivationRows, values.motivation)}
              />
            </div>

            <div className="rounded-2xl bg-[#F9FAFB] p-4 dark:bg-white/5">
              <p className="text-sm font-medium text-text-primary">
                Procedure highlights
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary">
                {config.reviewHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>

            <Checkbox
              name={`${donorType}-consent`}
              value={values.consent}
              onChange={(checked) => updateValue("consent", checked)}
              label="I confirm that the information above is accurate and I am ready to continue with this donor-specific screening path."
              labelClassName="text-sm text-text-primary"
            />
          </div>
        </SectionCard>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="secondary"
            className="px-5 py-2.5"
            onClick={handleBack}
          >
            Back
          </Button>
        ) : null}
        {step < 3 ? (
          <Button type="button" className="px-5 py-2.5" onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button type="button" className="px-5 py-2.5" onClick={handleFinish}>
            Finish donor flow
          </Button>
        )}
      </div>

      <DonorRegistrationSuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onContinue={() => {
          setIsSuccessModalOpen(false);
          queueMicrotask(() => navigateOutAfterSuccess(router));
        }}
        eyebrow={`${config.typeLabel} registration`}
        title={config.successTitle}
        description={config.successDescription}
        highlights={config.successHighlights}
        footerNote={config.successFooterNote}
      />
    </div>
  );
}
