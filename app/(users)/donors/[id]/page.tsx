"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Droplet, Info, Star } from "lucide-react";
import { Layout } from "@/layout/layout.component";
import { ALL_DONORS } from "../donors.data";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { Button } from "@/components/button/button.component";
import { Collapsable } from "./components/collapsable.components";
import { useAppSelector } from "@/app/store/hooks";
import { routes } from "@/config/routes";

export default function DonorDetailsPage() {
  const params = useParams<{ id: string }>();
  const donorId = decodeURIComponent(params.id);
  const donor = ALL_DONORS.find((d) => d.id === donorId);
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  return (
    <Layout>
      <section className="flex flex-col gap-6">
        {!donor ? (
          <div className="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-[#1a1a22]">
            <p className="text-sm font-medium text-text-primary">
              Donor not found
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              We couldn’t find a donor with id “{donorId}”.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex gap-[11px]">
              <Avatar className="size-[100px]!" />
              <div className="flex items-center gap-[11px]">
                <div className="grid gap-2">
                  <div className="flex gap-[27px]">
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      <p className="text-sm font-medium text-text-secondary">
                        4.8
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplet className="size-2.5 text-primary" />
                      <p className="text-sm font-medium text-text-secondary">
                        4 donations
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-text-secondary">
                    Abuja, Nigeria
                  </p>
                  <p className="text-xs text-text-secondary">2 packs</p>
                </div>
                <div className="shrink-0 rounded-full bg-[#FFE2E2] p-1.5 text-sm font-medium text-primary dark:bg-primary/25">
                  o+
                </div>
              </div>
            </div>
            <div className="flex w-full max-w-[928px] flex-col gap-8 rounded-2xl bg-[#FFF0EF] p-8 dark:bg-primary/10">
              <div className="flex flex-col">
                <p className="text-sm font-bold text-text-primary">
                  Answered Screening Questionnaire From 784321{" "}
                </p>
                <p className="text-xs text-text-secondary">
                  This are the answered question of this donor
                </p>
              </div>
              <div className="grid  gap-4 w-full">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Collapsable key={item} isOpen={item === 1} />
                ))}
              </div>
              <div className="mb-10 flex gap-4 border-l-4 border-[#960018] bg-[#FFE2E2] p-4 dark:bg-red-950/35 dark:border-primary">
                <Info size={16} className="text-primary" />
                <div className="flex flex-col gap-0.75">
                  <p className="text-xs font-semibold text-primary uppercase">
                    Confidentiality Note
                  </p>
                  <p className="max-w-200 text-[10px] text-[#5A403F] dark:text-red-100/85">
                    Your answers are protected under medical secrecy
                    regulations. High-integrity data ensures the safety of both
                    donor and recipient.
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
                className="max-w-[271px] self-end py-3 px-10 text-xs font-semibold flex gap-2 items-center"
              >
                Continue with donation <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
