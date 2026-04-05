"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
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
  postalCode: string;
  latitude: string;
  longitude: string;
};

export interface DonorBasicsStepProps {
  values: DonorBasicsValues;
  onChange: (field: keyof DonorBasicsValues, value: string) => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  active: boolean;
}

export function DonorBasicsStep({
  values,
  onChange,
  onSubmit,
  isSubmitting = false,
  error = null,
  active,
}: DonorBasicsStepProps) {
  const canSubmit = Boolean(values.bloodType);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const isNigeria = values.country === "NG";

  const requestPreciseLocation = () => {
    setGeoError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Location is not supported in this browser.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange("latitude", String(latitude));
        onChange("longitude", String(longitude));
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        const denied = err.code === 1;
        setGeoError(
          denied
            ? "Location permission denied. Enable it in your browser settings to use precise coordinates."
            : err.message || "Could not read your location.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20_000,
        maximumAge: 0,
      },
    );
  };

  const hasCoords =
    values.longitude.trim() !== "" && values.latitude.trim() !== "";

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
            you are based and use precise location for accurate coordinates on
            the map. Location is optional; you can update it later in your
            profile.
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
            Optional address & location
          </p>
          <p className="text-xs text-text-secondary">
            Country, state, and postal code describe your area. Use{" "}
            <span className="font-medium">Use my precise location</span> so we
            can store accurate GPS coordinates for matching (recommended).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="donor-country"
                className="block text-xs font-medium text-text-primary mb-1"
              >
                Country
              </label>
              <select
                id="donor-country"
                value={values.country}
                onChange={(e) => {
                  onChange("country", e.target.value);
                  onChange("state", "");
                }}
                className={selectClassName}
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
                State / region
              </label>
              {isNigeria ? (
                <select
                  id="donor-state"
                  value={values.state}
                  onChange={(e) => onChange("state", e.target.value)}
                  className={selectClassName}
                  disabled={!values.country}
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
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="donor-postal"
                className="block text-xs font-medium text-text-primary mb-1"
              >
                Postal code
              </label>
              <input
                id="donor-postal"
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                placeholder="e.g. 100001"
                value={values.postalCode}
                onChange={(e) => onChange("postalCode", e.target.value)}
                className={selectClassName}
              />
            </div>

            <div className="flex flex-col justify-end gap-2">
              <button
                type="button"
                onClick={requestPreciseLocation}
                disabled={geoLoading || isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-50 dark:bg-[#1a1a22]"
              >
                <MapPin size={18} className="shrink-0" />
                {geoLoading ? "Getting location…" : "Use my precise location"}
              </button>
            </div>
          </div>

          {geoError && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
              {geoError}
            </p>
          )}

          {hasCoords && (
            <p className="text-xs text-text-secondary rounded-md bg-white/80 dark:bg-black/20 px-3 py-2 border border-border/60">
              <span className="font-medium text-text-primary">
                Coordinates:{" "}
              </span>
              {Number.parseFloat(values.latitude).toFixed(6)},{" "}
              {Number.parseFloat(values.longitude).toFixed(6)}{" "}
              <span className="text-[#6B7280]">(lat, lng)</span>
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="text-sm font-medium py-2.5 px-5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors w-fit"
        >
          {isSubmitting ? "Saving…" : "Continue"}
        </Button>
      </form>
    )
  );
}
