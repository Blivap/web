import {
  WALLET_LEDGER_CATALOG,
  isWalletLedgerEntryType,
  type WalletLedgerEntryType,
} from "@/types/wallet";

export function walletEntryCopy(type: string, fallbackLabel: string) {
  if (isWalletLedgerEntryType(type)) {
    const row = WALLET_LEDGER_CATALOG[type];
    return {
      title: row.label,
      description: row.description,
      direction: row.direction,
    };
  }
  return {
    title: fallbackLabel,
    description: "Wallet activity",
    direction: null as null,
  };
}

export function expectedWalletEntryDirection(type: WalletLedgerEntryType) {
  return WALLET_LEDGER_CATALOG[type].direction;
}
