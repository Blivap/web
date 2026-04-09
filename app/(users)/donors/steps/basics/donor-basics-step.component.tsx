"use client";

import { Radio } from "@/components/forms/Radio";
import type { DonorBloodType } from "@/types/donors";
import { BLOOD_TYPES } from "../../donors.data";
import { DONOR_COUNTRIES, NIGERIA_STATES } from "@/lib/donors/location-options";
import { Button } from "@/components/button/button.component";

const REGISTER_BLOOD_TYPES = BLOOD_TYPES.filter(
  (t): t is DonorBloodType => t !== "All",
);

const selectClassName =
  "w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white dark:bg-[#1a1a22] text-text-primary";

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
            and used to match recipients with nearby donors.
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
            Enter location details manually. Browser location permissions are not
            used here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="donor-country"
                className="block text-xs font-medium text-text-primary mb-1"
              >
                Country *
              </label>
              <select
                id="donor-country"
                value={values.country}
                onChange={(e) => {
                  onChange("country", e.target.value);
                  onChange("state", "");
                }}
                className={selectClassName}
                disabled={isLocked}
              >
                <option value="">Select country</option>
                {DONOR_COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="donor-state"
                className="block text-xs font-medium text-text-primary mb-1"
              >
                State / region *
              </label>
              {isNigeria ? (
                <select
                  id="donor-state"
                  value={values.state}
                  onChange={(e) => onChange("state", e.target.value)}
                  className={selectClassName}
                  disabled={!values.country || isLocked}
                >
                  <option value="">Select state</option>
                  {NIGERIA_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="donor-state"
                  type="text"
                  placeholder="State or region"
                  value={values.state}
                  onChange={(e) => onChange("state", e.target.value)}
                  className={selectClassName}
                  disabled={isLocked}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="donor-city"
                className="block text-xs font-medium text-text-primary mb-1"
              >
                City / town *
              </label>
              <input
                id="donor-city"
                type="text"
                placeholder={isNigeria ? "e.g. Ikeja" : "City or town"}
                value={values.city}
                onChange={(e) => onChange("city", e.target.value)}
                className={selectClassName}
                disabled={isLocked}
              />
            </div>

            <div>
              <label
                htmlFor="donor-area"
                className="block text-xs font-medium text-text-primary mb-1"
              >
                Area *
              </label>
              <input
                id="donor-area"
                type="text"
                placeholder={isNigeria ? "e.g. Allen" : "Area / district"}
                value={values.area}
                onChange={(e) => onChange("area", e.target.value)}
                className={selectClassName}
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
