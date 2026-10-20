/**
 * Display helpers tuned to the wallet mockups (₦ + always 2 decimals).
 */

export function formatWalletAmount(
  kobo: number,
  options?: { currencySymbol?: boolean },
): string {
  const naira = (Number.isFinite(kobo) ? kobo : 0) / 100;
  const abs = Math.abs(naira);
  const number = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  const withSymbol = options?.currencySymbol === false ? number : `₦${number}`;
  return withSymbol;
}

export function formatWalletSignedAmount(
  kobo: number,
  direction: "credit" | "debit",
): string {
  const body = formatWalletAmount(kobo);
  return direction === "credit" ? `+${body}` : `−${body}`;
}
