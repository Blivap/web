"use client";

import { formatWalletAmount } from "@/lib/wallet/formatWalletDisplay";
import { Skeleton } from "@/components/ui/skeleton.component";

type WalletWithdrawBalanceCardProps = {
  availableKobo: number;
  heldKobo: number;
  currency: string;
  loading?: boolean;
};

/** Contour / topographic pattern matching the wallet mock. */
const BALANCE_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="280" viewBox="0 0 720 280" fill="none">
    <path d="M-20 40C40 10 90 70 160 55C230 40 260 0 340 20C420 40 460 90 540 70C620 50 680 10 760 35" stroke="white" stroke-opacity="0.18" stroke-width="1.25"/>
    <path d="M-20 90C50 55 110 120 190 100C270 80 310 40 390 65C470 90 520 130 600 105C680 80 720 50 760 70" stroke="white" stroke-opacity="0.14" stroke-width="1.25"/>
    <path d="M-20 145C60 110 130 175 210 155C290 135 340 95 420 125C500 155 560 185 640 155C700 135 740 115 780 130" stroke="white" stroke-opacity="0.12" stroke-width="1.25"/>
    <path d="M-20 200C70 165 150 230 240 205C330 180 380 145 470 175C560 205 620 235 710 200C750 185 780 175 820 185" stroke="white" stroke-opacity="0.1" stroke-width="1.25"/>
  </svg>`,
)}")`;

export function WalletWithdrawBalanceCard({
  availableKobo,
  heldKobo,
  currency,
  loading = false,
}: WalletWithdrawBalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[16px] bg-[#960018] px-6 py-5 text-white sm:px-7 sm:py-6">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: BALANCE_PATTERN,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[14px] font-medium leading-none text-white/90">
            Available balance
          </p>
          {loading ? (
            <Skeleton className="mt-3 h-10 w-48 bg-white/20" />
          ) : (
            <p className="mt-2.5 text-[32px] leading-none font-bold tracking-[-0.02em] text-white tabular-nums sm:text-[36px]">
              {formatWalletAmount(availableKobo)}
            </p>
          )}
          <p className="mt-3 text-[13px] font-medium text-white/90">
            Pending{" "}
            {loading ? "…" : formatWalletAmount(heldKobo)}
          </p>
        </div>

        <span className="mt-1 inline-flex shrink-0 items-center rounded-full border border-white/55 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
          {currency || "NGN"}
        </span>
      </div>
    </div>
  );
}
