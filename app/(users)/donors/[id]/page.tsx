"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  ClipboardCheck,
  Droplet,
  Info,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Layout } from "@/layout/layout.component";
import { $api } from "@/app/api";
import {
  parseDonorDetailResponse,
  type DonorDetail,
} from "@/lib/donors/parseDonorsListResponse";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { Button } from "@/components/ui/button";
import { DonorProfilePageSkeleton } from "./components/donor-profile-page-skeleton.component";
import { useAppSelector } from "@/store/hooks";
import { routes } from "@/config/routes";

const cardClass =
  "rounded-2xl border border-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#14141a] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

function shortRef(id: string, len = 8): string {
  const t = id.trim();
  if (t.length <= len) return t;
  return `${t.slice(0, len)}…`;
}

function ReliabilityBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-[#ECECEE] dark:bg-white/10"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border bg-[#FAFAFB] p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/18">
          <Icon className="size-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
            {label}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-text-primary">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 text-[11px] leading-snug text-text-tertiary">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
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
            <button
              type="button"
              onClick={() => void loadDonor()}
              className="mt-3 text-xs font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : donor ? (
          <div className="flex flex-col gap-6">
            <div
              className={`${cardClass} overflow-hidden bg-linear-to-br from-[#FFF8F7] via-white to-[#FAFAFB] p-0 dark:from-[#1a1416] dark:via-[#14141a] dark:to-[#101014]`}
            >
              <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
                <div className="relative shrink-0">
                  <Avatar
                    className="size-28 ring-4 ring-white shadow-lg dark:ring-[#1a1a22] sm:size-32!"
                    src={donor.profileImageUrl ?? undefined}
                  />
                  {donor.isActiveDonor ? (
                    <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-200">
                      <ShieldCheck className="size-3" aria-hidden />
                      Active
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-bold text-primary dark:border-primary/35 dark:bg-primary/15">
                      <Droplet className="size-4" aria-hidden />
                      {donor.bloodType}
                    </span>
                    <span className="font-mono text-[11px] text-text-tertiary">
                      Ref {shortRef(donor.id)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                      Donor profile
                    </h1>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Star
                          className="size-4 fill-amber-400 text-amber-400"
                          aria-hidden
                        />
                        <span className="font-medium text-text-primary">
                          {donor.rating.toFixed(1)}
                        </span>
                        <span className="text-text-tertiary">/ 5</span>
                      </span>
                      <span className="text-text-tertiary">·</span>
                      <span>
                        {donor.donations}{" "}
                        {donor.donations === 1 ? "donation" : "donations"}{" "}
                        recorded
                      </span>
                      {donor.packs > 0 ? (
                        <>
                          <span className="text-text-tertiary">·</span>
                          <span>
                            {donor.packs} blood{" "}
                            {donor.packs === 1 ? "pack" : "packs"}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  {donor.reliabilityScore != null ? (
                    <div className="max-w-md space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold uppercase tracking-wide text-text-tertiary">
                          Reliability
                        </span>
                        <span className="font-mono font-semibold text-text-primary">
                          {donor.reliabilityScore}
                          <span className="text-text-tertiary">/100</span>
                        </span>
                      </div>
                      <ReliabilityBar value={donor.reliabilityScore} />
                    </div>
                  ) : null}
                  {locationLine ? (
                    <p className="flex items-start gap-2 text-sm text-text-secondary">
                      <MapPin
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{locationLine}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile
                icon={ClipboardCheck}
                label="Completed bookings"
                value={donor.completedBookings ?? 0}
                hint="Finished screening visits"
              />
              <StatTile
                icon={Award}
                label="Successful donations"
                value={donor.successfulDonationCount ?? donor.donations}
                hint="Donations completed via Blivap"
              />
              <StatTile
                icon={Droplet}
                label="Blood packs"
                value={donor.packs}
                hint="Eligible packs on profile"
              />
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
                Continue with donation
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </Layout>
  );
}
