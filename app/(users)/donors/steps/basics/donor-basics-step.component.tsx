"use client";

import { Radio } from "@/components/forms/Radio";
import { Input } from "@/components/forms/inputs/input.component";
import type { DonorBloodType } from "@/types/donors";
import { BLOOD_TYPES } from "../../donors.data";
import { DONOR_COUNTRIES, NIGERIA_STATES } from "@/lib/donors/location-options";
import { Button } from "@/components/button/button.component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGISTER_BLOOD_TYPES = BLOOD_TYPES.filter(
  (t): t is DonorBloodType => t !== "All",
);

export type DonorBasicsValues = {
  bloodType: DonorBloodType | "";
  country: string;
  state: string;
  city: string;
  area: string;
};

export interface DonorBasicsStepProps {
  values: DonorBasicsValues;
  onChange: (field: keyof DonorBasicsValues, value: string) => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  editable?: boolean;
  completed?: boolean;
  active: boolean;
}

export function DonorBasicsStep({
  values,
  onChange,
  onSubmit,
  isSubmitting = false,
  error = null,
  editable = true,
  completed = false,
  active,
}: DonorBasicsStepProps) {
  const canSubmit = Boolean(
    values.bloodType &&
    values.country.trim() &&
    values.state.trim() &&
    values.city.trim() &&
    values.area.trim(),
  );
  const isLocked = !editable;
  const showNextAction = isLocked && completed;

  const isNigeria = values.country === "NG";

  return (
    active && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        className="flex flex-col gap-6 mt-6 xl:mt-10"
      >
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Blood type and location
          </h2>
          <p className="text-sm text-text-secondary max-w-[600px]">
            First we register your donor profile with your blood type. Add where
            you are based with detailed location information. This is required
            and used to match recipients with nearby donors. Next you&apos;ll
            optionally set your screening profile (biology and donation intent),
            then the legacy blood questionnaire required for activation.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-text-primary">
            Blood type *
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGISTER_BLOOD_TYPES.map((bt) => (
              <Radio
                key={bt}
                name="blood-type"
                value={bt}
                checked={values.bloodType === bt}
                onChange={() => onChange("bloodType", bt)}
                labelClassName="text-xs text-text-primary"
              >
                {bt}
              </Radio>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 bg-[#F9FAFB] dark:bg-white/5 space-y-4">
          <p className="text-sm font-medium text-text-primary">
            Address & location (required)
          </p>
          <p className="text-xs text-text-secondary">
            Enter location details manually. Browser location permissions are
            not used here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="donor-country"
                className="block text-xs font-medium text-text-primary mb-1"
              >
                Country *
              </label>
              <Select
                value={values.country || undefined}
                onValueChange={(v) => {
                  onChange("country", v);
                  onChange("state", "");
                }}
                disabled={isLocked}
              >
                <SelectTrigger id="donor-country" className="w-full">
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
            </div>

            <div>
              {isNigeria ? (
                <>
                  <label
                    htmlFor="donor-state"
                    className="block text-xs font-medium text-text-primary mb-1"
                  >
                    State / region *
                  </label>
                  <Select
                    value={values.state || undefined}
                    onValueChange={(v) => onChange("state", v)}
                    disabled={!values.country || isLocked}
                  >
                    <SelectTrigger id="donor-state" className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIA_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <Input
                  id="donor-state"
                  name="state"
                  label="State / region *"
                  type="text"
                  placeholder="State or region"
                  value={values.state}
                  onChange={(e) => onChange("state", e.target.value)}
                  disabled={isLocked}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                id="donor-city"
                name="city"
                label="City / town *"
                type="text"
                placeholder={isNigeria ? "e.g. Ikeja" : "City or town"}
                value={values.city}
                onChange={(e) => onChange("city", e.target.value)}
                disabled={isLocked}
              />
            </div>

            <div>
              <Input
                id="donor-area"
                name="area"
                label="Area *"
                type="text"
                placeholder={isNigeria ? "e.g. Allen" : "Area / district"}
                value={values.area}
                onChange={(e) => onChange("area", e.target.value)}
                disabled={isLocked}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {isLocked && (
          <p className="text-xs text-text-secondary">
            Your saved answers are shown. You can edit after your retake is
            rescheduled.
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || (!showNextAction && !canSubmit)}
          className="text-sm font-medium py-2.5 px-5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors w-fit"
        >
          {isSubmitting ? "Saving…" : showNextAction ? "Next" : "Continue"}
        </Button>
      </form>
    )
  );
}
