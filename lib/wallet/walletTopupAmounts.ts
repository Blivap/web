import { MIN_WALLET_TOPUP_KOBO } from "@/types/wallet";

/** Quick-pick amounts in Naira (converted to kobo when submitting). */
export const WALLET_TOPUP_QUICK_NAIRA = [500, 1_000, 2_000, 5_000, 10_000] as const;

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) return 0;
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  if (!Number.isFinite(kobo)) return 0;
  return kobo / 100;
}

export function parseNairaInput(raw: string): number {
  const digits = raw.replace(/[^\d.]/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function isValidTopupAmountKobo(amountKobo: number): boolean {
  return Number.isInteger(amountKobo) && amountKobo >= MIN_WALLET_TOPUP_KOBO;
}

/** Absolute callback URL for Paystack to return the user to /wallet. */
export function walletTopupCallbackUrl(): string {
  if (typeof window === "undefined") {
    return "/wallet";
  }
  return `${window.location.origin}/wallet`;
}
