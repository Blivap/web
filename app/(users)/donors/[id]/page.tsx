"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowRight, Droplet, Info, Loader2, Star } from "lucide-react";
import { Layout } from "@/layout/layout.component";
import { $api } from "@/api";
import {
  parseDonorDetailResponse,
  type DonorDetail,
} from "@/lib/donors/parseDonorsListResponse";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { Button } from "@/components/button/button.component";
import { Collapsable } from "./components/collapsable.components";
import { useAppSelector } from "@/store/hooks";
import { routes } from "@/config/routes";

export default function DonorDetailsPage() {
  const params = useParams<{ id: string }>();
  const donorId = decodeURIComponent(params.id);
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const [donor, setDonor] = useState<DonorDetail | null>(null);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ok" | "error" | "not_found"
  >("idle");
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

  return (
    <Layout>
      <section className="flex flex-col gap-6">
        {showLoading ? (
          <div className="flex min-h-[200px] items-center justify-center gap-2 text-sm text-text-secondary">
            <Loader2 className="size-5 animate-spin text-primary" />
            Loading donor…
          </div>
        ) : showNotFound ? (
          <div className="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-[#1a1a22]">
            <p className="text-sm font-medium text-text-primary">
              Donor not found
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              We couldn’t find a donor with id “{donorId}”.
            </p>
          </div>
        ) : showError ? (
          <div className="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-[#1a1a22]">
            <p className="text-sm font-medium text-text-primary">
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
          <div className="flex flex-col gap-8">
            <div className="flex gap-[11px]">
              <Avatar
                className="size-[100px]!"
                src={donor.profileImageUrl ?? undefined}
              />
              <div className="flex items-center gap-[11px]">
                <div className="grid gap-2">
                  <div className="flex gap-[27px]">
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      <p className="text-sm font-medium text-text-secondary">
                        {donor.rating.toFixed(1)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplet className="size-2.5 text-primary" />
                      <p className="text-sm font-medium text-text-secondary">
                        {donor.donations}{" "}
                        {donor.donations === 1 ? "donation" : "donations"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {donor.id}
                  </p>
                  <p className="text-sm font-medium text-text-secondary">
                    {donor.location}, {donor.country}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {donor.packs} {donor.packs === 1 ? "pack" : "packs"}
                  </p>
                </div>
                <div className="shrink-0 rounded-full bg-[#FFE2E2] p-1.5 text-sm font-medium text-primary dark:bg-primary/25">
                  {donor.bloodType}
                </div>
              </div>
            </div>
            <div className="flex w-full max-w-[928px] flex-col gap-8 rounded-2xl bg-[#FFF0EF] p-8 dark:bg-primary/10">
              <div className="flex flex-col">
                <p className="text-sm font-bold text-text-primary">
                  Screening questionnaire — donor {donor.id}
                </p>
                <p className="text-xs text-text-secondary">
                  This donor&apos;s answered screening questions
                </p>
              </div>
              <div className="grid w-full gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Collapsable key={item} isOpen={item === 1} />
                ))}
              </div>
              <div className="mb-10 flex gap-4 border-l-4 border-[#960018] bg-[#FFE2E2] p-4 dark:border-primary dark:bg-red-950/35">
                <Info size={16} className="text-primary" />
                <div className="flex flex-col gap-0.75">
                  <p className="text-xs font-semibold uppercase text-primary">
                    Confidentiality Note
                  </p>
                  <p className="max-w-200 text-[10px] text-[#5A403F] dark:text-red-100/85">
                    Your answers are protected under medical secrecy regulations.
                    High-integrity data ensures the safety of both donor and
                    recipient.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() =>
                  router.push(
                    user?.nationalIdentificationNumberVerified
                      ? routes.scheduleAppointment(donorId)
                      : routes.verifyId(donorId),
                  )
                }
                className="flex max-w-[271px] items-center gap-2 self-end px-10 py-3 text-xs font-semibold"
              >
                Continue with donation <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </Layout>
  );
}
