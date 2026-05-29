"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Radio } from "@/components/forms/Radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/forms/checkbox/checkbox.component";
import type {
  DonorBiologicalSex,
  DonorScreeningProfilePayload,
} from "@/types/donors";
import {
  normalizeDonationTypeForApi,
  normalizeDonationTypesList,
  SCREENING_DONATION_TYPE_OPTIONS,
} from "@/lib/donors/screeningDonationTypes";
import type { ScreeningDonationTypeValue } from "@/lib/donors/screeningDonationTypes";

const cardClass =
  "rounded-xl border border-border bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-[0_10px_25px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-none";

type Tri = "yes" | "no" | "unspecified";

function triToBool(t: Tri): boolean | null {
  if (t === "yes") return true;
  if (t === "no") return false;
  return null;
}

function boolToTri(v: boolean | null | undefined): Tri {
  if (v === true) return "yes";
  if (v === false) return "no";
  return "unspecified";
}

const BIO_OPTIONS: { value: DonorBiologicalSex; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "unknown", label: "Prefer not to say" },
];

export type DonorScreeningProfileStepProps = {
  active: boolean;
  /** Hydrated from GET /donors/me — reapplied when reference changes. */
  serverDefaults: DonorScreeningProfilePayload;
  /**
   * When the server has no `activeDonationTypes` yet, seed primary type from
   * `?donationType=` (overview / pathway deep links).
   */
  urlPrimaryDonationTypeHint?: string | null;
  onSave: (payload: DonorScreeningProfilePayload) => Promise<void>;
  onSkip: () => void;
  onBack: () => void;
  isSaving: boolean;
  error: string | null;
};

export function DonorScreeningProfileStep({
  active,
  serverDefaults,
  urlPrimaryDonationTypeHint,
  onSave,
  onSkip,
  onBack,
  isSaving,
  error,
}: DonorScreeningProfileStepProps) {
  const [biologicalSex, setBiologicalSex] = useState<DonorBiologicalSex | "">(
    "",
  );
  const [primaryType, setPrimaryType] = useState<
    ScreeningDonationTypeValue | ""
  >("whole_blood");
  const [extraTypes, setExtraTypes] = useState<Record<string, boolean>>({});
  const [lactating, setLactating] = useState<Tri>("unspecified");
  const [pregnant, setPregnant] = useState<Tri>("unspecified");

  useEffect(() => {
    const d = serverDefaults;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate form from server defaults
    setBiologicalSex(
      d.biologicalSex && BIO_OPTIONS.some((o) => o.value === d.biologicalSex)
        ? d.biologicalSex
        : "",
    );
    const types = d.activeDonationTypes ?? [];
    const normalized = normalizeDonationTypesList(types);
    const fromServer = normalized[0];
    const fromUrl =
      !fromServer && urlPrimaryDonationTypeHint
        ? normalizeDonationTypeForApi(urlPrimaryDonationTypeHint)
        : null;
    const primaryRaw =
      fromServer ??
      (fromUrl &&
      SCREENING_DONATION_TYPE_OPTIONS.some((o) => o.value === fromUrl)
        ? fromUrl
        : null) ??
      "whole_blood";
    const primary = SCREENING_DONATION_TYPE_OPTIONS.some(
      (o) => o.value === primaryRaw,
    )
      ? primaryRaw
      : "whole_blood";
    setPrimaryType(primary);
    const nextExtra: Record<string, boolean> = {};
    for (const t of normalized.slice(1)) {
      if (SCREENING_DONATION_TYPE_OPTIONS.some((o) => o.value === t)) {
        nextExtra[t] = true;
      }
    }
    setExtraTypes(nextExtra);
    setLactating(boolToTri(d.isActivelyLactating));
    setPregnant(boolToTri(d.isCurrentlyPregnant));
  }, [serverDefaults, urlPrimaryDonationTypeHint]);

  const orderedTypes = useMemo(() => {
    const extras = SCREENING_DONATION_TYPE_OPTIONS.map((o) => o.value).filter(
      (v) => v !== primaryType && extraTypes[v],
    );
    if (!primaryType) return extras;
    return [primaryType, ...extras];
  }, [primaryType, extraTypes]);

  const payload = useMemo((): DonorScreeningProfilePayload => {
    const p: DonorScreeningProfilePayload = {};
    if (biologicalSex) p.biologicalSex = biologicalSex;
    if (orderedTypes.length > 0) p.activeDonationTypes = orderedTypes;
    if (lactating !== "unspecified")
      p.isActivelyLactating = triToBool(lactating);
    if (pregnant !== "unspecified") p.isCurrentlyPregnant = triToBool(pregnant);
    return p;
  }, [biologicalSex, orderedTypes, lactating, pregnant]);

  const canSave = useMemo(
    () =>
      Boolean(biologicalSex) ||
      orderedTypes.length > 0 ||
      lactating !== "unspecified" ||
      pregnant !== "unspecified",
    [biologicalSex, orderedTypes.length, lactating, pregnant],
  );

  if (!active) return null;

  return (
    <div className={`flex flex-col gap-6 mt-6 xl:mt-10 overflow-hidden`}>
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-text-primary">
          Donation-type screening profile
        </h2>
        <p className="mt-1 text-sm text-text-secondary max-w-[640px]">
          This step is separate from blood booking activation. It captures
          clinical context and which donation pathways you want to explore
          first. It powers compatibility checks and optional typed
          questionnaires — it does not replace the legacy health questionnaire
          in the next step, which is still required to request active donor
          status.
        </p>

        <div
          className="mt-4 flex gap-3 rounded-lg border border-primary/20 bg-primary/[0.06] p-4 dark:border-primary/30 dark:bg-primary/10"
          role="note"
        >
          <Info className="size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-xs leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">Two layers:</span>{" "}
            (1){" "}
            <span className="font-medium text-text-primary">Active donor</span>{" "}
            — profile + legacy questionnaire +{" "}
            <span className="font-mono text-[11px]">request-activation</span>.
            (2){" "}
            <span className="font-medium text-text-primary">
              Screening profile + AI questionnaire
            </span>{" "}
            — optional for activation; recommended for richer matching and your
            public donor card.
          </p>
        </div>

        {error ? (
          <p
            className="mt-4 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-text-primary">
              Biological sex
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              Used for compatibility and AI context. This is not the same field
              as gender on the legacy blood questionnaire.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {BIO_OPTIONS.map((o) => (
                <Radio
                  key={o.value}
                  name="biologicalSex"
                  value={o.value}
                  checked={biologicalSex === o.value}
                  onChange={() => setBiologicalSex(o.value)}
                  labelClassName="text-xs text-text-primary"
                >
                  {o.label}
                </Radio>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary">
              Primary donation interest
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              First type is primary for typed screening on your public card when
              you complete the optional AI questionnaire.
            </p>
            <div className="mt-3 max-w-md">
              <Select
                value={primaryType || undefined}
                onValueChange={(v) =>
                  setPrimaryType(v as ScreeningDonationTypeValue)
                }
              >
                <SelectTrigger className="w-full border-border bg-white text-left dark:bg-[#1a1a22]">
                  <SelectValue placeholder="Select primary type" />
                </SelectTrigger>
                <SelectContent>
                  {SCREENING_DONATION_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary">
              Additional interests (optional)
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SCREENING_DONATION_TYPE_OPTIONS.filter(
                (o) => o.value !== primaryType,
              ).map((o) => (
                <Checkbox
                  key={o.value}
                  name={`extra-${o.value}`}
                  label={o.label}
                  value={Boolean(extraTypes[o.value])}
                  onChange={(checked) =>
                    setExtraTypes((prev) => ({
                      ...prev,
                      [o.value]: checked,
                    }))
                  }
                  wrapperClassName="border border-border rounded-lg px-3 py-2 dark:border-white/10"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Actively lactating
              </p>
              <div className="mt-2 space-y-2">
                {(
                  [
                    ["yes", "Yes"],
                    ["no", "No"],
                    ["unspecified", "Prefer not to say"],
                  ] as const
                ).map(([val, label]) => (
                  <Radio
                    key={val}
                    name="lactating"
                    value={val}
                    checked={lactating === val}
                    onChange={() => setLactating(val)}
                    labelClassName="text-xs text-text-primary"
                  >
                    {label}
                  </Radio>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Currently pregnant
              </p>
              <div className="mt-2 space-y-2">
                {(
                  [
                    ["yes", "Yes"],
                    ["no", "No"],
                    ["unspecified", "Prefer not to say"],
                  ] as const
                ).map(([val, label]) => (
                  <Radio
                    key={val}
                    name="pregnant"
                    value={val}
                    checked={pregnant === val}
                    onChange={() => setPregnant(val)}
                    labelClassName="text-xs text-text-primary"
                  >
                    {label}
                  </Radio>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:flex-wrap sm:items-center dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full rounded-md! px-6 py-2.5 sm:w-auto"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isSaving}
            className="w-full rounded-md! px-6 py-2.5 sm:w-auto"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            disabled={isSaving || !canSave}
            loading={isSaving}
            onClick={() => void onSave(payload)}
            className="w-full rounded-md! px-6 py-2.5 sm:w-auto"
          >
            Save screening profile
          </Button>
        </div>
      </div>
    </div>
  );
}
