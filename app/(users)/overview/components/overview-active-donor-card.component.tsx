"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { Button } from "@/components/button/button.component";
import { donorDetailPath, routes } from "@/config/routes";
import { resolveDonorCooldown } from "@/lib/donors/donorCooldown";
import type { Donor } from "@/app/(users)/donors/donors.data";

type OverviewActiveDonorCardProps = {
  donor: Donor;
  currentUserId?: string;
  donationTypeLabel: (type: string) => string;
};

export function OverviewActiveDonorCard({
  donor,
  currentUserId,
  donationTypeLabel,
}: OverviewActiveDonorCardProps) {
  const isOwner =
    !!currentUserId && !!donor.userId && donor.userId === currentUserId;
  const cooldown = resolveDonorCooldown(donor.cooldownEndsAt);
  const bookingBlocked = cooldown.isActive && !isOwner;
  const profileHref = isOwner ? routes.settings : donorDetailPath(donor.id);
  const displayId = donor.userId?.slice(0, 6) ?? donor.id.slice(0, 8);
  const primaryType = donor.activeDonationTypes[0];
  const extraTypes = Math.max(0, donor.activeDonationTypes.length - 1);
  const locationLine = [donor.location, donor.country]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="flex flex-col rounded-xl border border-border bg-[#FAFAFA] p-4 transition-colors hover:border-primary/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/25 dark:hover:bg-white/8">
      <Link href={profileHref} className="group flex min-w-0 items-start gap-3">
        <Avatar
          className="size-12! shrink-0"
          src={donor.profileImage ?? undefined}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-text-primary group-hover:text-primary">
              {displayId}
            </p>
            <span className="shrink-0 rounded-full bg-[#FCE7E7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary dark:bg-primary/25">
              {donor.bloodType}
            </span>
          </div>
          {primaryType ? (
            <p className="mt-1 truncate text-xs text-text-secondary">
              {donationTypeLabel(primaryType)}
              {extraTypes > 0 ? ` +${extraTypes} more` : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-text-tertiary">Donor</p>
          )}
          {locationLine ? (
            <p className="mt-0.5 truncate text-xs text-text-tertiary">
              {locationLine}
            </p>
          ) : null}
        </div>
        <ChevronRight
          className="mt-0.5 size-4 shrink-0 text-text-tertiary opacity-0 transition group-hover:opacity-100 group-hover:text-primary"
          aria-hidden
        />
      </Link>

      {bookingBlocked ? (
        <p className="mt-3 text-xs font-medium text-amber-800 dark:text-amber-200">
          Booking paused — on cooldown
        </p>
      ) : isOwner ? (
        <p className="mt-3 text-xs text-text-tertiary">
          This is your donor profile
        </p>
      ) : null}

      <div className="mt-auto">
        {bookingBlocked ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full mt-auto"
            disabled
          >
            Booking paused
          </Button>
        ) : isOwner ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-auto"
            href={profileHref}
          >
            Manage profile
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full mt-auto"
            href={routes.scheduleAppointment(donor.id)}
          >
            Book appointment
          </Button>
        )}
      </div>
    </article>
  );
}
