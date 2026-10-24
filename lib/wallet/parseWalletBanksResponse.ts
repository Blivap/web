import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type { WalletBankOption } from "@/lib/wallet/nigerianBanks";

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

export function parseWalletBankOption(raw: unknown): WalletBankOption | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const bank =
    pickString(row.bank) ?? pickString(row.name) ?? pickString(row.bankName);
  const code = pickString(row.code) ?? pickString(row.bankCode);
  if (!bank || !code) return null;
  return { bank, code };
}

export function parseWalletBanksResponse(body: unknown): WalletBankOption[] {
  const unwrapped = unwrapApiRecord(body);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((body as { data?: unknown })?.data)
      ? (body as { data: unknown[] }).data
      : Array.isArray(body)
        ? body
        : [];

  return list
    .map(parseWalletBankOption)
    .filter((b): b is WalletBankOption => b != null)
    .sort((a, b) => a.bank.localeCompare(b.bank));
}
