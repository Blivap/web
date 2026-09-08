"use client";

import { AuthLoader } from "@/components/auth/auth-loader.component";
import { Layout } from "@/layout/layout.component";
import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCheck, Info } from "lucide-react";
import { routes } from "@/config/routes";
import { useVerifyIdPage } from "@/hooks/verify-id/useVerifyIdPage.hook";
import { useRouter } from "next/navigation";

function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const head = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(head)) return iso;
  const [y, m, d] = head.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VerifyIdVerifiedState() {
  return (
    <div className="flex flex-col items-center gap-6 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#1a1a22] sm:px-10 sm:py-16">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCheck className="size-8" aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-text-primary">
          Identity verified
        </h2>
        <p className="text-sm text-text-secondary">Your NIN is on file.</p>
      </div>
      <Link
        href={routes.donors}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        Donors
      </Link>
    </div>
  );
}

function ProfileDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 py-3 border-b border-[#E8E8EC] last:border-b-0 dark:border-white/10">
      <dt className="text-xs font-medium text-[#757575] dark:text-slate-400 shrink-0">
        {label}
      </dt>
      <dd className="text-sm font-medium text-text-primary sm:text-right wrap-break-word">
        {value}
      </dd>
    </div>
  );
}

function VerifyIdContent() {
  const {
    showGateLoader,
    isVerified,
    user,
    nin,
    isNinVerifying,
    ninError,
    canSubmit,
    handleNinChange,
    handleConfirmNin,
  } = useVerifyIdPage();
  const router = useRouter();

  if (showGateLoader) {
    return (
      <Layout>
        <AuthLoader />
      </Layout>
    );
  }

  if (isVerified) {
    return (
      <Layout>
        <div
          onClick={() => router.back()}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="size-4 text-primary" aria-hidden />
          <p className="text-primary">Back</p>
        </div>
        <div className="flex justify-center items-center w-full h-full">
          <VerifyIdVerifiedState />
        </div>
      </Layout>
    );
  }

  const fullName =
    [user?.firstname, user?.lastname].filter(Boolean).join(" ") || "—";

  return (
    <Layout>
      <div className="max-w-149 mx-auto md:mx-0 px-1 sm:px-0 pb-10">
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Verify your NIN
          </h1>
          <p className="mt-2 text-sm text-text-secondary max-w-120">
            Enter your 11-digit National Identification Number so we can confirm
            your identity.
          </p>
        </header>

        <section
          className="mb-8 rounded-xl border border-[#E8C4C8] bg-[#FFEBEE]/60 p-2 sm:px-5 dark:border-primary/30 dark:bg-primary/10"
          role="note"
        >
          <div className="flex items-center gap-3">
            <Info className="size-5 shrink-0 text-primary mt-0.5" aria-hidden />
            <p className="text-xs text-text-primary leading-relaxed">
              The details on your Blivap profile must match the information on
              your NIN.
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-[#DADADA] bg-white px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10 dark:bg-[#1a1a22]">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-base font-semibold text-text-primary">
              Your profile details
            </h2>
            <Link
              href={routes.settings}
              className="text-xs font-semibold text-primary hover:underline underline-offset-2 shrink-0"
            >
              Edit profile
            </Link>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            These must match your NIN record.
          </p>
          <dl>
            <ProfileDetailRow label="Full name" value={fullName} />
            <ProfileDetailRow
              label="Date of birth"
              value={formatDisplayDate(user?.dateOfBirth)}
            />
            <ProfileDetailRow
              label="Phone"
              value={user?.phonenumber?.trim() || "—"}
            />
            <ProfileDetailRow
              label="Email"
              value={user?.email?.trim() || "—"}
            />
          </dl>
        </section>

        <section className="mb-8">
          <Input
            name="nin"
            label="National Identification Number (NIN)"
            placeholder="Enter your 11-digit NIN"
            value={nin}
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            error={ninError ?? false}
            onChange={(e) => handleNinChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) {
                void handleConfirmNin();
              }
            }}
          />
          <p className="mt-2 text-xs text-[#757575] dark:text-slate-400">
            {nin.length}/11 digits
          </p>
        </section>

        <Button
          type="button"
          variant="primary"
          className="rounded-none! px-10 py-3.5 font-bold text-base min-w-35 shadow-none"
          disabled={!canSubmit}
          loading={isNinVerifying}
          onClick={() => void handleConfirmNin()}
        >
          {isNinVerifying ? "Verifying…" : "Verify NIN"}
        </Button>
      </div>
    </Layout>
  );
}

export default function VerifyIdPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="max-w-140 mx-auto md:mx-0 px-1 sm:px-0 pb-10 animate-pulse">
            <div className="h-8 w-48 rounded bg-[#E5E7EB] dark:bg-white/10 mb-4" />
            <div className="h-16 max-w-120 rounded bg-[#E5E7EB] dark:bg-white/10 mb-8" />
            <div className="h-48 rounded-xl bg-[#E5E7EB] dark:bg-white/10 mb-8" />
            <div className="h-12 rounded bg-[#E5E7EB] dark:bg-white/10" />
          </div>
        </Layout>
      }
    >
      <VerifyIdContent />
    </Suspense>
  );
}
