/**
 * Estimated Paystack local (NGN) pricing for checkout transparency.
 * Source: Paystack local transactions — 1.5% + ₦100 (₦100 waived under ₦2,500),
 * fee capped at ₦2,000. VAT 7.5% applied on the fee.
 *
 * The amount sent to POST /wallet/topups remains the wallet credit only;
 * these figures are estimates shown before redirect.
 */
export const PAYSTACK_LOCAL_PERCENT = 0.015;
export const PAYSTACK_LOCAL_FLAT_NAIRA = 100;
export const PAYSTACK_LOCAL_FLAT_WAIVE_UNDER_NAIRA = 2_500;
export const PAYSTACK_LOCAL_FEE_CAP_NAIRA = 2_000;
export const NIGERIA_VAT_RATE = 0.075;

export type WalletTopupFeeBreakdown = {
  amountKobo: number;
  processingFeeKobo: number;
  taxKobo: number;
  /** Wallet credit (= amountKobo). */
  creditKobo: number;
  /** What the customer pays at checkout today (= amountKobo). */
  totalPayableKobo: number;
  /** Informative: credit + fee + tax if fees were passed through. */
  estimatedGrossKobo: number;
};

export function estimatePaystackLocalFeeNaira(amountNaira: number): number {
  if (!Number.isFinite(amountNaira) || amountNaira <= 0) return 0;
  const percentPart = amountNaira * PAYSTACK_LOCAL_PERCENT;
  const withFlat =
    amountNaira < PAYSTACK_LOCAL_FLAT_WAIVE_UNDER_NAIRA
      ? percentPart
      : percentPart + PAYSTACK_LOCAL_FLAT_NAIRA;
  return Math.min(PAYSTACK_LOCAL_FEE_CAP_NAIRA, withFlat);
}

export function buildWalletTopupFeeBreakdown(
  amountKobo: number,
): WalletTopupFeeBreakdown {
  const safeAmount = Number.isFinite(amountKobo)
    ? Math.max(0, Math.trunc(amountKobo))
    : 0;
  const amountNaira = safeAmount / 100;
  const feeNaira = estimatePaystackLocalFeeNaira(amountNaira);
  const taxNaira = feeNaira * NIGERIA_VAT_RATE;
  const processingFeeKobo = Math.round(feeNaira * 100);
  const taxKobo = Math.round(taxNaira * 100);

  return {
    amountKobo: safeAmount,
    processingFeeKobo,
    taxKobo,
    creditKobo: safeAmount,
    totalPayableKobo: safeAmount,
    estimatedGrossKobo: safeAmount + processingFeeKobo + taxKobo,
  };
}
