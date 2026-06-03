"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Droplet, Info, MapPin, ShieldCheck } from "lucide-react";
import { Layout } from "@/layout/layout.component";
import { $api } from "@/app/api";
import {
  parseDonorDetailResponse,
  type DonorDetail,
} from "@/lib/donors/parseDonorsListResponse";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { Button } from "@/components/button/button.component";
import { DonorProfilePageSkeleton } from "./components/donor-profile-page-skeleton.component";
import { useAppSelector } from "@/store/hooks";
import { routes } from "@/config/routes";
import { DonorCooldownDisplay } from "../components/donor-cooldown-display.component";
import { resolveDonorCooldown } from "@/lib/donors/donorCooldown";

const cardClass =
  "rounded-2xl border border-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#14141a] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

function ProfileStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-[#FAFAFB] px-3 py-2.5 dark:border-white/10 dark:bg-white/4">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-0.5 text-base font-semibold tabular-nums text-text-primary">
        {value}
      </dd>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export default function DonorDetailsPage() {
  const params = useParams<{ id: string }>();
  const donorId = decodeURIComponent(params.id);
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const [donor, setDonor] = useState<DonorDetail | null>(null);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ok" | "error" | "not_found"
  >("loading");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadDonor = useCallback(async () => {
    setLoadState("loading");
    setFetchError(null);
    try {
      const { data, status } = await $api.donors.getById(donorId);
      if (status < 200 || status >= 300 || data === undefined) {
        setDonor(null);
        setLoadState("error");
        setFetchError("Could not load this donor. Please try again.");
        return;
      }
      const parsed = parseDonorDetailResponse(data);
      if (!parsed) {
        setDonor(null);
        setLoadState("not_found");
        return;
      }
      setDonor(parsed);
      setLoadState("ok");
    } catch (e) {
      setDonor(null);
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setLoadState("not_found");
        return;
      }
      setLoadState("error");
      setFetchError("Could not load this donor. Please try again.");
    }
  }, [donorId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- GET /donors/:id when route id changes
    void loadDonor();
  }, [loadDonor]);

  const showLoading = loadState === "loading";
  const showNotFound = loadState === "not_found";
  const showError = loadState === "error";

  const locationLine = donor
    ? [donor.location, donor.country].filter((s) => s && s !== "—").join(" · ")
    : "";

  const isOwnProfile =
    !!user?.id && !!donor?.userId && donor.userId === user.id;
  const cooldown = resolveDonorCooldown(donor?.cooldownEndsAt);
  const bookingBlocked = cooldown.isActive && !isOwnProfile;
  const ratingsSummary = donor?.ratings;
  const ratingLabel =
    ratingsSummary && ratingsSummary.ratingCount > 0
      ? `${ratingsSummary.averageRating.toFixed(1)}`
      : "No ratings";
  const ratingHint =
    ratingsSummary && ratingsSummary.ratingCount > 0
      ? `${ratingsSummary.ratingCount} ${
          ratingsSummary.ratingCount === 1 ? "rating" : "ratings"
        }`
      : undefined;

  return (
    <Layout>
      <section className="mx-auto flex flex-col gap-6">
        <Link
          href={routes.donors}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>

        {showLoading ? (
          <DonorProfilePageSkeleton />
        ) : showNotFound ? (
          <div className={`${cardClass} p-6`}>
            <p className="text-sm font-semibold text-text-primary">
              Donor not found
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              We couldn&apos;t find a donor matching this link.
            </p>
          </div>
        ) : showError ? (
          <div className={`${cardClass} p-6`}>
            <p className="text-sm font-semibold text-text-primary">
              {fetchError ?? "Something went wrong."}
            </p>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="mt-3 h-auto p-0 text-xs"
              onClick={() => void loadDonor()}
            >
              Try again
            </Button>
          </div>
        ) : donor ? (
          <div className="flex flex-col gap-6">
            <div className={cardClass}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                <Avatar
                  className="size-20 shrink-0 ring-2 ring-primary/10 ring-offset-2 ring-offset-white dark:ring-offset-[#14141a] sm:size-24!"
                  src={donor.profileImageUrl ?? undefined}
                />
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                        Donor profile
                      </p>
                      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-text-primary">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-base font-bold text-primary dark:bg-primary/15">
                          <Droplet className="size-4" aria-hidden />
                          {donor.bloodType}
                        </span>
                      </h1>
                      {locationLine ? (
                        <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <MapPin
                            className="size-3.5 shrink-0 text-text-tertiary"
                            aria-hidden
                          />
                          {locationLine}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {donor.isActiveDonor ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-200">
                          <ShieldCheck className="size-3" aria-hidden />
                          Active donor
                        </span>
                      ) : null}
                      <DonorCooldownDisplay
                        cooldownEndsAt={donor.cooldownEndsAt}
                        variant={isOwnProfile ? "owner" : "public"}
                      />
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4 dark:border-white/10">
                    <ProfileStat
                      label="Rating"
                      value={ratingLabel}
                      hint={ratingHint}
                    />
                    <ProfileStat
                      label="Donations"
                      value={donor.successfulDonationCount ?? donor.donations}
                    />
                    <ProfileStat
                      label="Bookings"
                      value={donor.completedBookings ?? 0}
                    />
                    {donor.reliabilityScore != null ? (
                      <ProfileStat
                        label="Reliability"
                        value={`${donor.reliabilityScore}`}
                      />
                    ) : (
                      <ProfileStat label="Blood packs" value={donor.packs} />
                    )}
                  </dl>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex flex-col gap-1 border-b border-border pb-4 dark:border-white/10">
                <h2 className="text-sm font-semibold text-text-primary">
                  Typed screening (AI questionnaire)
                </h2>
                <p className="text-xs text-text-secondary">
                  When this donor has completed typed screening for their
                  primary donation type, summarized questions and answers may
                  appear here for coordination. This is separate from legacy
                  blood eligibility and from active donor verification.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {donor.screening?.donationType ? (
                  <p className="text-xs text-text-secondary">
                    Primary screening type:{" "}
                    <span className="font-mono font-medium text-text-primary">
                      {donor.screening.donationType}
                    </span>
                    {donor.screening.screeningComplete != null ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-medium text-text-primary">
                          {donor.screening.screeningComplete
                            ? "Screening complete"
                            : "Screening in progress"}
                        </span>
                      </>
                    ) : null}
                  </p>
                ) : null}
                {donor.screening?.questions &&
                donor.screening.questions.length > 0 ? (
                  <ul className="space-y-2">
                    {donor.screening.questions.map((q) => (
                      <li
                        key={q.id}
                        className="rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-white/4"
                      >
                        <p className="text-xs font-medium text-text-primary">
                          {q.text ?? q.id}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary whitespace-pre-wrap">
                          {q.answer != null && q.answer !== ""
                            ? String(q.answer)
                            : "—"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-text-tertiary">
                    No typed screening block on this profile yet. It appears
                    when an active AI questionnaire exists for the donor&apos;s
                    primary donation type.
                  </p>
                )}
              </div>
              <div className="mt-6 flex gap-3 rounded-xl border border-primary/20 bg-primary/6 p-4 dark:border-primary/30 dark:bg-primary/10">
                <Info className="size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Confidentiality
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                    Health responses are handled under applicable privacy and
                    medical confidentiality rules. Use this information only for
                    donation coordination.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {bookingBlocked ? (
                <p className="text-sm text-text-secondary">
                  This donor is on a rest period. Booking opens when their
                  cooldown ends.
                </p>
              ) : (
                <Button
                  variant="default"
                  onClick={() =>
                    router.push(
                      user?.nationalIdentificationNumberVerified
                        ? routes.scheduleAppointment(donorId)
                        : routes.verifyId(donorId),
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </Layout>
  );
}
