"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { Button } from "@/components/button/button.component";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useSetQueryParams } from "@/hooks/navigation/useQueryParamState.hook";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import type { CareLine } from "./meetup-care-breakdown";
import { formatWalletAmount } from "@/lib/wallet/formatWalletDisplay";
import { parseWalletSummaryResponse } from "@/lib/wallet/parseWalletResponse";
import {
  parseWalletTopupSessionResponse,
  pickPaystackReferenceFromSearch,
} from "@/lib/wallet/parseWalletTopupResponse";
import { isValidTopupAmountKobo } from "@/lib/wallet/walletTopupAmounts";
import { MIN_WALLET_TOPUP_KOBO } from "@/types/wallet";

type ScheduleAppointmentPaymentViewProps = {
  hospitalName: string;
  dateLabel: string;
  time: string;
  lines: CareLine[];
  totalKobo: number;
  scheduling: boolean;
  onBack: () => void;
  onPay: () => void;
  onBeforeRedirect: () => void;
};

function formatVisitDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ScheduleAppointmentPaymentView({
  hospitalName,
  dateLabel,
  time,
  lines,
  totalKobo,
  scheduling,
  onBack,
  onPay,
  onBeforeRedirect,
}: ScheduleAppointmentPaymentViewProps) {
  const { showSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const setParams = useSetQueryParams();
  const [availableKobo, setAvailableKobo] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [startingTopup, setStartingTopup] = useState(false);
  const verifiedRef = useRef<string | null>(null);
  const balanceFromTopup = useRef(false);

  const loadWallet = useCallback(async () => {
    setLoadingWallet(true);
    try {
      const res = await $api.wallet.summary();
      if (res.status < 200 || res.status >= 300) {
        if (!balanceFromTopup.current) setAvailableKobo(null);
        return;
      }
      if (balanceFromTopup.current) return;
      setAvailableKobo(parseWalletSummaryResponse(res.data ?? res).availableKobo);
    } catch {
      setAvailableKobo(null);
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    const reference = pickPaystackReferenceFromSearch(searchParams);
    if (!reference || verifiedRef.current === reference) return;
    verifiedRef.current = reference;
    let cancelled = false;
    let finished = false;
    void (async () => {
      try {
        const res = await $api.wallet.verifyTopup(reference);
        if (cancelled) return;
        if (res.status < 200 || res.status >= 300) {
          verifiedRef.current = null;
          showSnackbar(
            res.error ?? res.message ?? "Could not verify wallet top-up",
            "error",
          );
          return;
        }
        balanceFromTopup.current = true;
        setAvailableKobo(
          parseWalletSummaryResponse(res.data ?? res).availableKobo,
        );
        showSnackbar("Wallet funded", "success");
        finished = true;
      } catch (err) {
        verifiedRef.current = null;
        if (!cancelled) {
          showSnackbar(
            getAxiosErrorMessage(err, "Could not verify wallet top-up"),
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setParams({ reference: null, trxref: null });
        }
      }
    })();
    return () => {
      cancelled = true;
      if (!finished) verifiedRef.current = null;
    };
  }, [searchParams, setParams, showSnackbar]);

  const shortfallKobo =
    availableKobo == null ? null : Math.max(0, totalKobo - availableKobo);
  const canPay =
    availableKobo != null && shortfallKobo === 0 && !loadingWallet && !scheduling;

  const startTopup = async () => {
    if (shortfallKobo == null || shortfallKobo <= 0 || startingTopup) return;
    const amountKobo = Math.max(shortfallKobo, MIN_WALLET_TOPUP_KOBO);
    if (!isValidTopupAmountKobo(amountKobo)) return;
    setStartingTopup(true);
    onBeforeRedirect();
    try {
      const callback = new URL(window.location.href);
      callback.searchParams.delete("reference");
      callback.searchParams.delete("trxref");
      callback.searchParams.set("pay", "1");
      const res = await $api.wallet.startTopup({
        amountKobo,
        callbackUrl: callback.toString(),
      });
      if (res.status < 200 || res.status >= 300) {
        showSnackbar(
          res.error ?? res.message ?? "Could not start wallet top-up",
          "error",
        );
        return;
      }
      const session = parseWalletTopupSessionResponse(res.data ?? res);
      if (!session?.authorizationUrl) {
        showSnackbar("Payment link was missing. Try again.", "error");
        return;
      }
      window.location.assign(session.authorizationUrl);
    } catch (err) {
      showSnackbar(
        getAxiosErrorMessage(err, "Could not start wallet top-up"),
        "error",
      );
    } finally {
      setStartingTopup(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
        Back to appointment
      </button>

      <div className="overflow-hidden rounded-xl border border-border bg-white dark:border-white/10 dark:bg-[#14141a]">
        <header className="border-b border-border px-4 py-4 sm:px-5 dark:border-white/10">
          <h2 className="text-sm font-semibold text-text-primary">
            Welfare summary
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            The request is sent after this welfare is held from your wallet.
            Donation stays voluntary.
          </p>
        </header>

        <dl className="border-b border-border px-4 py-3 text-sm sm:px-5 dark:border-white/10">
          <div className="flex items-start justify-between gap-3 py-1.5">
            <dt className="text-text-secondary">Hospital</dt>
            <dd className="text-right font-medium text-text-primary">
              {hospitalName}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3 py-1.5">
            <dt className="text-text-secondary">When</dt>
            <dd className="text-right font-medium text-text-primary">
              {formatVisitDate(dateLabel)}, {time}
            </dd>
          </div>
        </dl>

        <ul>
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] px-4 py-3 sm:px-5 dark:border-white/10"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {line.title}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">{line.detail}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-text-primary">
                {formatWalletAmount(line.amountKobo)}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-text-primary">Total</p>
          <p className="text-base font-bold tabular-nums text-primary">
            {formatWalletAmount(totalKobo)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white px-4 py-4 sm:px-5 dark:border-white/10 dark:bg-[#14141a]">
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-text-secondary">Wallet available</p>
          <p className="font-semibold tabular-nums text-text-primary">
            {loadingWallet || availableKobo == null
              ? "—"
              : formatWalletAmount(availableKobo)}
          </p>
        </div>
        {shortfallKobo != null && shortfallKobo > 0 ? (
          <p className="mt-2 text-xs text-text-secondary">
            Add {formatWalletAmount(shortfallKobo)} to cover this visit, then
            schedule the appointment.
          </p>
        ) : null}
      </div>

      {shortfallKobo != null && shortfallKobo > 0 ? (
        <Button
          type="button"
          className="w-fit px-5 py-2.5 text-sm font-medium"
          loading={startingTopup}
          disabled={startingTopup || loadingWallet}
          onClick={() => void startTopup()}
        >
          Add {formatWalletAmount(Math.max(shortfallKobo, MIN_WALLET_TOPUP_KOBO))}{" "}
          to wallet
        </Button>
      ) : (
        <Button
          type="button"
          className="w-fit px-5 py-2.5 text-sm font-medium"
          loading={scheduling}
          disabled={!canPay}
          onClick={onPay}
        >
          Hold {formatWalletAmount(totalKobo)} welfare and schedule
        </Button>
      )}
    </section>
  );
}
