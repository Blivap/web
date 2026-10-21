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

const COVERAGE_OPTIONS: {
  value: DonorWelfareCoverage;
  title: string;
  description: string;
}[] = [
  {
    value: "self",
    title: "I'll cover my own costs",
    description:
      "You handle transport, meals, and the rest. Requesters are not asked to arrange them.",
  },
  {
    value: "requester",
    title: "Ask the requester to arrange care",
    description:
      "Choose what you need so you can show up safely and recover well.",
  },
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
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-white/90">
            Meetup care
          </h3>
          <InfoHint title="Meetup care" label="Meetup care information">
            <p>
              Donation stays voluntary and unpaid. This is only the practical
              care around a screening visit: getting there, eating, resting,
              and getting home.
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
            <div className="grid gap-2 sm:grid-cols-2">
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
                      "rounded-xl border px-3 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 dark:bg-primary/15"
                        : "border-[#E5E7EB] hover:border-primary/30 dark:border-white/10",
                    )}
                  >
                    <p className="text-sm font-semibold text-[#111827] dark:text-white/90">
                      {option.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#6B7280] dark:text-white/55">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <fieldset
              disabled={!ready || !askRequester}
              className={cn("min-w-0", !askRequester && "opacity-50")}
            >
              <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] dark:text-white/50">
                Care to arrange
              </legend>
              {packages.length === 0 ? (
                <p className="px-1 py-3 text-xs text-[#6B7280] dark:text-white/50">
                  No care packages are offered right now.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {packages.map((item) => {
                    const checked = preferences.items.includes(item.code);
                    return (
                      <li
                        key={item.code}
                        className="border-b border-[#E5E7EB] last:border-b-0 dark:border-white/10"
                      >
                        <label className="flex cursor-pointer items-start gap-3 px-1 py-3">
                          <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                            checked={checked}
                            onChange={() => toggleItem(item.code)}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-[#111827] dark:text-white/90">
                              {item.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-[#6B7280] dark:text-white/50">
                              {item.detail}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </fieldset>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                size="sm"
                className="w-fit rounded-md px-5 text-xs font-semibold"
                disabled={!ready || saving}
                loading={saving}
                onClick={() => void save()}
              >
                Save meetup care
              </Button>
              <p className="text-[10px] text-[#6B7280] dark:text-white/50">
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
