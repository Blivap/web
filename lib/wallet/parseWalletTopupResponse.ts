import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type { WalletTopupSession } from "@/types/wallet";

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function pickPositiveInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) {
    return Math.trunc(v);
  }
  if (typeof v === "string" && v.trim() && /^\d+$/.test(v.trim())) {
    const n = Number(v.trim());
    return n > 0 ? n : null;
  }
  return null;
}

/** Normalizes POST /wallet/topups bodies. */
export function parseWalletTopupSessionResponse(
  body: unknown,
): WalletTopupSession | null {
  const data = unwrapApiRecord(body) ?? {};
  const reference = pickString(data.reference);
  const authorizationUrl = pickString(data.authorizationUrl);
  const accessCode = pickString(data.accessCode);
  const amountKobo = pickPositiveInt(data.amountKobo);
  if (!reference || !authorizationUrl || !accessCode || amountKobo == null) {
    return null;
  }
  return { reference, authorizationUrl, accessCode, amountKobo };
}

/** Paystack return query: prefer `reference`, fall back to `trxref`. */
export function pickPaystackReferenceFromSearch(
  params: URLSearchParams | { get(name: string): string | null },
): string | null {
  const reference = params.get("reference")?.trim();
  if (reference) return reference;
  const trxref = params.get("trxref")?.trim();
  return trxref || null;
}
