"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import { formatKoboAsNaira } from "@/lib/wallet/formatWalletMoney";
import { buildWalletTopupFeeBreakdown } from "@/lib/wallet/estimateTopupFees";
import {
  DEFAULT_WALLET_PAYMENT_METHOD,
  type WalletPaymentMethodId,
} from "@/lib/wallet/walletPaymentMethods";
import {
  WALLET_TOPUP_QUICK_NAIRA,
  isValidTopupAmountKobo,
  nairaToKobo,
  parseNairaInput,
} from "@/lib/wallet/walletTopupAmounts";
import { MIN_WALLET_TOPUP_KOBO } from "@/types/wallet";
import classNames from "classnames";
import { WalletTopupSummaryDialog } from "./wallet-topup-summary-dialog.component";

type WalletTopupFormProps = {
  currency: string;
  starting?: boolean;
  disabled?: boolean;
  onSubmit: (amountKobo: number) => void | Promise<boolean>;
};

export function WalletTopupForm({
  currency,
  starting = false,
  disabled = false,
  onSubmit,
}: WalletTopupFormProps) {
  const [nairaInput, setNairaInput] = useState("1000");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<WalletPaymentMethodId>(
    DEFAULT_WALLET_PAYMENT_METHOD,
  );

  const amountNaira = useMemo(() => parseNairaInput(nairaInput), [nairaInput]);
  const amountKobo = nairaToKobo(amountNaira);
  const valid = isValidTopupAmountKobo(amountKobo);
  const breakdown = useMemo(
    () => (valid ? buildWalletTopupFeeBreakdown(amountKobo) : null),
    [amountKobo, valid],
  );

  return (
    <section className="rounded-xl border border-[#E8E6E3] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-primary">
        Add money
      </h2>
      <p className="mt-1 text-xs text-text-secondary">
        Fund your wallet with Paystack. Minimum{" "}
        {formatKoboAsNaira(MIN_WALLET_TOPUP_KOBO, { currency })}.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <Input
          name="topupAmount"
          label="Amount (NGN)"
          placeholder="1000"
          inputMode="decimal"
          value={nairaInput}
          onChange={(e) => setNairaInput(e.target.value)}
          disabled={disabled || starting}
          labelClassName="text-[11px]"
          inputClassName="py-1.5"
          containerClassName="gap-1"
        />

        <div className="flex flex-wrap gap-2">
          {WALLET_TOPUP_QUICK_NAIRA.map((naira) => {
            const selected = amountNaira === naira;
            return (
              <Button
                key={naira}
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || starting}
                className={classNames(
                  "rounded-full px-3 text-xs font-semibold",
                  selected &&
                    "border-primary bg-[#FFF5F5] text-primary dark:bg-primary/15",
                )}
                onClick={() => setNairaInput(String(naira))}
              >
                {formatKoboAsNaira(nairaToKobo(naira), { currency })}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          size="sm"
          className="w-fit rounded-md px-5 text-xs font-semibold"
          disabled={disabled || starting || !valid}
          onClick={() => setSummaryOpen(true)}
        >
          Next
        </Button>
      </div>

      <WalletTopupSummaryDialog
        open={summaryOpen}
        currency={currency}
        breakdown={breakdown}
        paymentMethod={paymentMethod}
        confirming={starting}
        onPaymentMethodChange={setPaymentMethod}
        onOpenChange={(open) => {
          if (!starting) setSummaryOpen(open);
        }}
        onConfirm={() => {
          void onSubmit(amountKobo);
        }}
      />
    </section>
  );
}
