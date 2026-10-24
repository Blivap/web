"use client";

import { useCallback, useEffect, useState } from "react";
import { $api } from "@/app/api";
import { Button } from "@/components/button/button.component";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  DEFAULT_DONOR_WELFARE_PREFERENCES,
  parseMeetupCarePreferences,
  parseWelfarePackages,
  type DonorWelfareCoverage,
  type DonorWelfarePackage,
  type DonorWelfarePreferences,
} from "@/lib/donors/donorWelfarePreferences";
import { cn } from "@/lib/utils";
import { SettingsCard } from "../components/settings-card";
import { MeetupCareArt } from "./meetup-care-art";

const COVERAGE_OPTIONS: {
  value: DonorWelfareCoverage;
  title: string;
}[] = [
  { value: "self", title: "I'll cover it" },
  { value: "requester", title: "Ask the requester" },
];

export function DonorWelfareSettings() {
  const { showSnackbar } = useSnackbar();
  const [packages, setPackages] = useState<DonorWelfarePackage[]>([]);
  const [preferences, setPreferences] = useState<DonorWelfarePreferences>(
    DEFAULT_DONOR_WELFARE_PREFERENCES,
  );
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setReady(false);
    setLoadError(null);
    try {
      const [packageRes, profileRes] = await Promise.all([
        $api.welfare.packages(),
        $api.donors.me(),
      ]);
      if (packageRes.status < 200 || packageRes.status >= 300) {
        setLoadError(
          packageRes.error ?? packageRes.message ?? "Could not load care packages",
        );
        return;
      }
      const offered = parseWelfarePackages(packageRes.data ?? packageRes);
      setPackages(offered);
      if (profileRes.status === 404) {
        setLoadError("Create a donor profile before saving meetup care.");
        return;
      }
      if (profileRes.status < 200 || profileRes.status >= 300) {
        setLoadError(
          profileRes.error ??
            profileRes.message ??
            "Could not load your meetup care",
        );
        return;
      }
      const saved = parseMeetupCarePreferences(profileRes.data ?? profileRes);
      const known = new Set(offered.map((item) => item.code));
      setPreferences({
        coverage: saved.coverage,
        items: saved.items.filter((code) => known.has(code)),
      });
      setReady(true);
    } catch (err) {
      setLoadError(getAxiosErrorMessage(err, "Could not load meetup care"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const askRequester = preferences.coverage === "requester";

  const setCoverage = (coverage: DonorWelfareCoverage) => {
    setPreferences((current) => ({
      ...current,
      coverage,
      items: coverage === "self" ? [] : current.items,
    }));
  };

  const toggleItem = (code: string) => {
    setPreferences((current) => {
      const selected = current.items.includes(code);
      return {
        ...current,
        items: selected
          ? current.items.filter((item) => item !== code)
          : [...current.items, code],
      };
    });
  };

  const save = async () => {
    if (askRequester && preferences.items.length === 0) {
      showSnackbar("Choose at least one care item, or cover your own costs.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await $api.donors.saveMeetupCare({
        coverage: preferences.coverage,
        items: preferences.coverage === "self" ? [] : preferences.items,
      });
      if (res.status < 200 || res.status >= 300) {
        showSnackbar(
          res.error ?? res.message ?? "Could not save meetup care",
          "error",
        );
        return;
      }
      const saved = parseMeetupCarePreferences(res.data ?? res);
      setPreferences(saved);
      showSnackbar("Meetup care preferences saved.", "success");
    } catch (err) {
      showSnackbar(getAxiosErrorMessage(err, "Could not save meetup care"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard>
      <div className="@container flex min-w-0 flex-col gap-5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-white/90">
            Meetup care
          </h3>
          <InfoHint title="Meetup care" label="Meetup care information">
            <p>
              Donation stays voluntary. This is only the practical welfare
              around a screening visit: getting there, eating, resting, and
              getting home.
            </p>
            <p>
              Covering your own costs means a requester is not asked to arrange
              anything. Asking them to help means those items are held from
              their wallet before the request is sent.
            </p>
          </InfoHint>
        </div>

        {loadError ? (
          <div>
            <p className="text-sm text-[#6B7280] dark:text-white/60">{loadError}</p>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="mt-2 h-auto p-0 text-xs"
              onClick={() => void load()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 @min-[36rem]:grid-cols-2">
              {COVERAGE_OPTIONS.map((option) => {
                const selected = preferences.coverage === option.value;
                const blocked = option.value === "requester" && packages.length === 0;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    disabled={!ready || blocked}
                    onClick={() => setCoverage(option.value)}
                    className={cn(
                      "rounded-2xl border px-4 py-3.5 text-center text-sm font-semibold transition-colors",
                      selected
                        ? "border-primary bg-[#FDF6F6] text-[#111827] dark:bg-primary/15 dark:text-white"
                        : "border-[#E6E6E6] bg-white text-[#111827] hover:border-primary/30 dark:border-white/10 dark:bg-transparent dark:text-white/90",
                    )}
                  >
                    {option.title}
                  </button>
                );
              })}
            </div>

            <fieldset
              disabled={!ready || !askRequester}
              className={cn("min-w-0 border-0 p-0", !askRequester && "opacity-50")}
            >
              <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] dark:text-white/50">
                Care to arrange
              </legend>
              {packages.length === 0 ? (
                <p className="py-3 text-xs text-[#6B7280] dark:text-white/50">
                  No care packages are offered right now.
                </p>
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-3 @min-[24rem]:grid-cols-2 @min-[42rem]:grid-cols-3 @min-[56rem]:grid-cols-4 @min-[24rem]:gap-4">
                  {packages.map((item) => {
                    const checked = preferences.items.includes(item.code);
                    return (
                      <button
                        key={item.code}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleItem(item.code)}
                        className="flex h-full min-w-0 flex-col rounded-[1.75rem] border-0 bg-white p-3 text-left shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition-shadow dark:bg-[#14141a] dark:shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
                      >
                        <span className="relative aspect-[5/4] overflow-hidden rounded-[1.35rem] bg-white">
                          <MeetupCareArt code={item.code} title={item.title} />
                          <span
                            className={cn(
                              "absolute top-3 right-3 size-8 rounded-full",
                              checked
                                ? "bg-primary"
                                : "bg-white shadow-[inset_0_2px_5px_rgba(15,23,42,0.18)]",
                            )}
                            aria-hidden
                          />
                        </span>
                        <span className="flex flex-1 flex-col px-2 pt-4 pb-3">
                          <span className="text-[15px] font-bold tracking-tight wrap-break-word text-[#1B1B2F] dark:text-white">
                            {item.title}
                          </span>
                          <span className="mt-1.5 text-[13px] leading-snug wrap-break-word text-[#9AA0A8] dark:text-white/55">
                            {item.detail}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold @min-[24rem]:w-fit"
                disabled={!ready || saving}
                loading={saving}
                onClick={() => void save()}
              >
                Save meetup care
              </Button>
              <p className="text-[11px] text-[#9A9A9A] dark:text-white/45">
                Saved on your profile. A change here does not change a booking
                that is already held.
              </p>
            </div>
          </>
        )}
      </div>
    </SettingsCard>
  );
}
