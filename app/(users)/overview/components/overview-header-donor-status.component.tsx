"use client";

import { Button } from "@/components/button/button.component";
import { Skeleton } from "@/components/ui/skeleton.component";
import { routes } from "@/config/routes";
import { resolveDonorCooldown } from "@/lib/donors/donorCooldown";
import { DonorCooldownDisplay } from "../../donors/components/donor-cooldown-display.component";

export type OverviewDonorProfileState =
  | { status: "loading" }
  | { status: "not_donor" }
  | {
      status: "donor";
      cooldownEndsAt: string | null;
      lastDonationAt: string | null;
      unavailable: boolean;
    };

type OverviewHeaderDonorStatusProps = {
  profile: OverviewDonorProfileState;
};

export function OverviewHeaderDonorStatus({
  profile,
}: OverviewHeaderDonorStatusProps) {
  if (profile.status === "loading") {
    return <Skeleton className="h-9 w-28 self-end rounded-full" />;
  }

  if (profile.status === "not_donor") {
    return (
      <Button
        href={routes.donorsNew}
        variant="primary"
        size="sm"
        className="self-end rounded-full px-5"
      >
        Become a Donor
      </Button>
    );
  }

  const coolingDown =
    profile.unavailable ||
    resolveDonorCooldown(profile.cooldownEndsAt).isActive;

  if (!coolingDown) {
    return (
      <span className="inline-flex items-center self-end rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-500">
        Verified Donor
      </span>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-0.5 sm:border-l sm:border-border sm:pl-6 dark:border-white/10">
      <span className="text-text-secondary">Cooldown</span>
      <DonorCooldownDisplay
        cooldownEndsAt={profile.cooldownEndsAt}
        lastDonationAt={profile.lastDonationAt}
        unavailable={profile.unavailable}
        variant="owner"
        className="w-fit max-w-full"
      />
    </div>
  );
}
