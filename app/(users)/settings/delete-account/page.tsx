"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { routes } from "@/config/routes";
import { SettingsShell } from "../components/settings-shell";
import {
  SettingsCard,
  SettingsSectionLabel,
} from "../components/settings-card";
import { SettingsToggleRow } from "../components/settings-toggle-row";

const WARNING_ITEMS = [
  "All active donation subscriptions will be immediately canceled.",
  "Your donation receipt history and certificates will be unreachable.",
  "You will lose your registered donor status benefits.",
];

export default function DeleteAccountPage() {
  const { showSnackbar } = useSnackbar();
  const [confirmed, setConfirmed] = useState(false);
  const [verification, setVerification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canDelete = useMemo(
    () => confirmed && verification.trim().toUpperCase() === "DELETE",
    [confirmed, verification],
  );

  return (
    <SettingsShell
      title="Delete Account"
      description="Permanently remove your Blivap account and associated data."
    >
      <SettingsCard className="flex flex-col gap-4 border-primary/30">
        <SettingsSectionLabel title="Critical Warning" />
        <div className="rounded-xl border border-primary/40 bg-[#FFF5F5] p-4 dark:bg-primary/10">
          <div className="flex items-center gap-2 text-primary">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            <p className="text-sm font-bold">This action is permanent</p>
          </div>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-white/60">
            Once you delete your account, your data, profile settings, and
            payment history will be permanently erased. This cannot be undone.
          </p>
          <hr className="my-3 border-[#E5E7EB] dark:border-white/10" />
          <ul className="flex flex-col gap-2">
            {WARNING_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-[#6B7280] dark:text-white/60"
              >
                <span className="mt-0.5 text-primary" aria-hidden>
                  ×
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </SettingsCard>

      <SettingsCard className="flex flex-col gap-4">
        <SettingsSectionLabel title="Confirm Deletion" />
        <div className="rounded-xl border border-[#E5E7EB] dark:border-white/10">
          <SettingsToggleRow
            title="I understand this action is permanent"
            value={confirmed}
            onValueChange={setConfirmed}
            showDivider={false}
          />
        </div>

        <div className="max-w-md flex flex-col gap-2">
          <p className="text-sm font-semibold text-[#111827] dark:text-white/90">
            To verify, type &apos;DELETE&apos;
          </p>
          <Input
            name="verification"
            label={undefined}
            placeholder="DELETE"
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            autoCapitalize="characters"
            inputClassName="py-1.5"
            containerClassName="gap-1"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="sm"
            className="rounded-md px-5 text-xs font-semibold"
            disabled={!canDelete || submitting}
            loading={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                // Backend delete-account API is not wired yet (same as mobile stub).
                await new Promise((r) => setTimeout(r, 400));
                showSnackbar(
                  "Account deletion is not available yet. Contact support if you need help.",
                  "error",
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Delete My Account
          </Button>
          <Link
            href={routes.settingsPrivacySecurity}
            className="text-center text-sm font-semibold text-[#111827] underline dark:text-white/90"
          >
            Cancel
          </Link>
        </div>
      </SettingsCard>
    </SettingsShell>
  );
}
