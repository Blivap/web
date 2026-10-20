import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type {
  WalletBankAccount,
  WalletBankResolveResult,
  WalletResolvedBankAccount,
} from "@/types/wallet";

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function pickBool(v: unknown): boolean {
  return v === true;
}

export function parseResolvedBankAccount(
  raw: unknown,
): WalletResolvedBankAccount | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const accountNumber = pickString(row.accountNumber);
  const accountName = pickString(row.accountName);
  const bankName = pickString(row.bankName);
  const bankCode = pickString(row.bankCode);
  if (!accountNumber || !accountName || !bankName || !bankCode) return null;
  return { accountNumber, accountName, bankName, bankCode };
}

export function parseBankResolveResult(
  body: unknown,
): WalletBankResolveResult | null {
  const data = unwrapApiRecord(body) ?? (body as Record<string, unknown> | null);
  if (!data) return null;

  if (Array.isArray(data.matches)) {
    const accountNumber = pickString(data.accountNumber);
    const matches = data.matches
      .map(parseResolvedBankAccount)
      .filter((m): m is WalletResolvedBankAccount => m != null);
    if (!accountNumber || !matches.length) return null;
    return { accountNumber, matches };
  }

  return parseResolvedBankAccount(data);
}

export function parseWalletBankAccount(raw: unknown): WalletBankAccount | null {
  const row =
    unwrapApiRecord(raw) ??
    (raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null);
  if (!row || Array.isArray(row)) return null;
  const id = pickString(row.id);
  const bankCode = pickString(row.bankCode);
  const bankName = pickString(row.bankName);
  const accountNumber = pickString(row.accountNumber);
  const accountName = pickString(row.accountName);
  if (!id || !bankCode || !bankName || !accountNumber || !accountName) {
    return null;
  }
  return {
    id,
    bankCode,
    bankName,
    accountNumber,
    accountName,
    isPrimary: pickBool(row.isPrimary),
  };
}

export function parseWalletBankAccounts(body: unknown): WalletBankAccount[] {
  const data = unwrapApiRecord(body);
  const list = Array.isArray(data)
    ? data
    : Array.isArray((body as { data?: unknown })?.data)
      ? ((body as { data: unknown[] }).data)
      : Array.isArray(body)
        ? body
        : [];
  return list
    .map(parseWalletBankAccount)
    .filter((a): a is WalletBankAccount => a != null)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

export function formatWalletBankLabel(account: {
  bankName: string;
  accountNumber: string;
}): string {
  const digits = account.accountNumber.replace(/\D/g, "");
  const last4 = digits.length >= 4 ? digits.slice(-4) : digits;
  return `${account.bankName} •••• ${last4}`;
}
