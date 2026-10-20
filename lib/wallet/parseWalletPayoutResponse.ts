import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type { WalletPayout, WalletPayoutStatus } from "@/types/wallet";

const PAYOUT_STATUSES = new Set<WalletPayoutStatus>([
  "awaiting_otp",
  "processing",
  "paid",
  "failed",
  "expired",
]);

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function pickNonNegInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
    return Math.trunc(v);
  }
  if (typeof v === "string" && v.trim() && /^\d+$/.test(v.trim())) {
    return Number(v.trim());
  }
  return null;
}

function pickCreatedAt(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString();
  return null;
}

function pickStatus(v: unknown): WalletPayoutStatus | null {
  if (typeof v === "string" && PAYOUT_STATUSES.has(v as WalletPayoutStatus)) {
    return v as WalletPayoutStatus;
  }
  return null;
}

export function parseWalletPayout(raw: unknown): WalletPayout | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = pickString(row.id);
  const reference = pickString(row.reference);
  const amountKobo = pickNonNegInt(row.amountKobo);
  const status = pickStatus(row.status);
  const bankName = pickString(row.bankName);
  const accountName = pickString(row.accountName);
  const accountLast4 = pickString(row.accountLast4);
  if (
    !id ||
    !reference ||
    amountKobo == null ||
    !status ||
    !bankName ||
    !accountName ||
    !accountLast4
  ) {
    return null;
  }

  return {
    id,
    reference,
    amountKobo,
    currency: pickString(row.currency) ?? "NGN",
    status,
    bankName,
    accountName,
    accountLast4,
    failureReason: pickString(row.failureReason),
    receiptAvailable: row.receiptAvailable === true,
    createdAt: pickCreatedAt(row.createdAt),
    paidAt: pickCreatedAt(row.paidAt),
  };
}

export function parseWalletPayoutResponse(body: unknown): WalletPayout | null {
  const data =
    unwrapApiRecord(body) ?? (body as Record<string, unknown> | null);
  return parseWalletPayout(data);
}

export function parseWalletPayouts(body: unknown): WalletPayout[] {
  const data = unwrapApiRecord(body);
  const list = Array.isArray(data)
    ? data
    : Array.isArray((body as { data?: unknown })?.data)
      ? (body as { data: unknown[] }).data
      : Array.isArray(body)
        ? body
        : [];
  return list
    .map(parseWalletPayout)
    .filter((p): p is WalletPayout => p != null);
}
