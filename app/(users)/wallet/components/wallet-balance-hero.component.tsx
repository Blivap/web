"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUp, Eye, EyeOff, Plus } from "lucide-react";
import { formatWalletAmount } from "@/lib/wallet/formatWalletDisplay";
import {
  persistWalletBalanceHidden,
  readWalletBalanceHidden,
  subscribeWalletBalanceHidden,
} from "@/lib/wallet/walletBalanceVisibility";
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import { routes } from "@/config/routes";
import { WalletBalanceHeroSkeleton } from "./wallet-page-skeleton.component";

type WalletBalanceHeroProps = {
  availableKobo: number;
  heldKobo: number;
  currency: string;
  loading?: boolean;
  onFundWallet?: () => void;
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

export function WalletBalanceHero({
  availableKobo,
  heldKobo,
  loading = false,
  onFundWallet,
}: WalletBalanceHeroProps) {
  const hidden = useSyncExternalStore(
    subscribeWalletBalanceHidden,
    readWalletBalanceHidden,
    () => false,
  );

  const toggleHidden = () => {
    persistWalletBalanceHidden(!hidden);
  };

  if (loading) {
    return <WalletBalanceHeroSkeleton />;
  }

  return (
    <div className="relative h-full min-h-[160px] overflow-hidden rounded-[14px] bg-[#960018] px-4 py-5 text-white sm:min-h-[188px] sm:rounded-[16px] sm:px-7 sm:py-7">
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

      <div className="relative flex h-full min-h-[120px] flex-col sm:min-h-[140px]">
        <p className="text-[13px] font-medium leading-none text-white/90 sm:text-[24px]">
          Available balance
        </p>

        <div className="mt-2.5 flex min-w-0 items-center gap-2 sm:mt-3 sm:gap-3">
          <p className="min-w-0 truncate text-[28px] leading-none font-bold tracking-[-0.02em] text-white tabular-nums sm:text-[48px]">
            {hidden
              ? "••••••••"
              : formatWalletAmount(availableKobo, {
                  currencySymbol: false,
                })}
          </p>
          <button
            type="button"
            aria-label={hidden ? "Show balance" : "Hide balance"}
            onClick={toggleHidden}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 sm:size-8"
          >
            {hidden ? (
              <EyeOff
                className="size-4 sm:size-[18px]"
                strokeWidth={1.75}
                aria-hidden
              />
            ) : (
              <Eye
                className="size-4 sm:size-[18px]"
                strokeWidth={1.75}
                aria-hidden
              />
            )}
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5 sm:gap-4 sm:pt-8">
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <Link
              href={routes.walletWithdraw}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#FFFFFF33] bg-transparent px-3 text-[12px] font-semibold text-white transition-colors hover:bg-white/10 sm:h-9 sm:px-3.5 sm:text-[13px]"
            >
              <ArrowUp className="size-3.5" strokeWidth={2.25} aria-hidden />
              Withdraw
            </Link>
            <button
              type="button"
              onClick={onFundWallet}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#FFFFFF33] bg-transparent px-3 text-[12px] font-semibold text-white transition-colors hover:bg-white/10 sm:h-9 sm:px-3.5 sm:text-[13px]"
            >
              <Plus className="size-3.5" strokeWidth={2.25} aria-hidden />
              Fund wallet
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/95 sm:text-[12px]">
            <span>
              Pending {hidden ? "••••" : formatWalletAmount(heldKobo)}
            </span>
            <InfoHint
              title="Pending balance"
              label="Pending balance information"
              className="size-5 text-white/95 hover:bg-white/15 hover:text-white"
              iconClassName="size-3.5"
            >
              <p>
                Pending amounts are held for active donation welfare until a
                booking completes, refunds, or reimburses.
              </p>
            </InfoHint>
          </div>
        </div>
      </div>
    </div>
  );
}
