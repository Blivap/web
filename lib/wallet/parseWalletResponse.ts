import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import {
  WALLET_LEDGER_CATALOG,
  isWalletLedgerEntryType,
  type WalletLedgerDirection,
  type WalletLedgerEntry,
  type WalletSummary,
} from "@/types/wallet";

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

function pickDirection(v: unknown): WalletLedgerDirection | null {
  if (v === "credit" || v === "debit") return v;
  return null;
}

function pickCreatedAt(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString();
  return null;
}

export function parseWalletLedgerEntry(raw: unknown): WalletLedgerEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const typeRaw = pickString(row.type);
  const amountKobo = pickNonNegInt(row.amountKobo);
  if (!typeRaw || amountKobo == null) return null;

  const known = isWalletLedgerEntryType(typeRaw)
    ? WALLET_LEDGER_CATALOG[typeRaw]
    : null;

  const direction =
    pickDirection(row.direction) ?? known?.direction ?? null;
  const label = pickString(row.label) ?? known?.label ?? null;
  if (!direction || !label) return null;

  const bookingRaw = row.bookingId;
  const bookingId =
    bookingRaw == null || bookingRaw === ""
      ? null
      : pickString(bookingRaw) ??
        (typeof bookingRaw === "number" ? String(bookingRaw) : null);

  return {
    type: known?.type ?? typeRaw,
    label,
    direction,
    amountKobo,
    bookingId,
    createdAt: pickCreatedAt(row.createdAt),
  };
}

/** Normalizes GET /wallet bodies (`{ message, data }` or bare summary). */
export function parseWalletSummaryResponse(body: unknown): WalletSummary {
  const data = unwrapApiRecord(body) ?? {};
  const entriesRaw = Array.isArray(data.entries) ? data.entries : [];
  const entries = entriesRaw
    .map(parseWalletLedgerEntry)
    .filter((e): e is WalletLedgerEntry => e != null);

  return {
    availableKobo: pickNonNegInt(data.availableKobo) ?? 0,
    heldKobo: pickNonNegInt(data.heldKobo) ?? 0,
    currency: pickString(data.currency) ?? "NGN",
    entries,
  };
}

export const EMPTY_WALLET_SUMMARY: WalletSummary = {
  availableKobo: 0,
  heldKobo: 0,
  currency: "NGN",
  entries: [],
};
