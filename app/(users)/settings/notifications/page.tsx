"use client";

import { useNotificationSettings } from "@/hooks/settings/useNotificationSettings.hook";
import { Spinner } from "@/components/ui/spinner";
import { SettingsShell } from "../components/settings-shell";
import {
  SettingsCard,
  SettingsSectionLabel,
} from "../components/settings-card";
import { SettingsToggleRow } from "../components/settings-toggle-row";

export default function NotificationSettingsPage() {
  const { settings, loading, update } = useNotificationSettings();

  return (
    <SettingsShell
      title="Notification Settings"
      description="Choose which alerts you want to receive."
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-primary" />
        </div>
      ) : null}

      {settings ? (
        <>
          <SettingsCard className="flex flex-col gap-3">
            <SettingsSectionLabel title="System Access" />
            <div className="rounded-xl border border-[#E5E7EB] dark:border-white/10">
              <SettingsToggleRow
                title="Push Notifications"
                description="Turn on or off all push notifications"
                value={settings.pushEnabled}
                onValueChange={(value) => update({ pushEnabled: value })}
                showDivider={false}
              />
            </div>
          </SettingsCard>

          <SettingsCard className="flex flex-col gap-3">
            <SettingsSectionLabel title="Alert Categories" />
            <div className="rounded-xl border border-[#E5E7EB] dark:border-white/10 px-2 sm:px-3">
              <SettingsToggleRow
                title="Donation Reminders"
                description="Get notified when you become eligible"
                value={settings.donationReminders}
                onValueChange={(value) => update({ donationReminders: value })}
              />
              <SettingsToggleRow
                title="Nearby Blood Drives"
                description="Alerts for local pop-up drives"
                value={settings.nearbyDrives}
                onValueChange={(value) => update({ nearbyDrives: value })}
              />
              <SettingsToggleRow
                title="Eligibility Alerts"
                description="Critical health & timing updates"
                value={settings.eligibilityAlerts}
                onValueChange={(value) => update({ eligibilityAlerts: value })}
              />
              <SettingsToggleRow
                title="Reward Updates"
                description="Points, tier changes, and voucher alerts"
                value={settings.rewardUpdates}
                onValueChange={(value) => update({ rewardUpdates: value })}
              />
              <SettingsToggleRow
                title="App Updates"
                description="New features, security updates, & tips"
                value={settings.appUpdates}
                onValueChange={(value) => update({ appUpdates: value })}
                showDivider={false}
              />
            </div>
          </SettingsCard>
        </>
      ) : null}
    </SettingsShell>
  );
}
