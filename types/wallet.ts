/** Matches backend `WalletLedgerType`. */
export type WalletLedgerEntryType =
  | "topup"
  | "welfare_payment"
  | "welfare_refund"
  | "welfare_reimbursement";

/** Matches backend `WelfareLedgerDirection`. */
export type WalletLedgerDirection = "credit" | "debit";

/**
 * Canonical ledger catalog (backend `WALLET_ENTRY_LABELS` + direction).
 *
 * | type                    | direction | label                  |
 * | ----------------------- | --------- | ---------------------- |
 * | topup                   | credit    | Wallet top-up          |
 * | welfare_payment         | debit     | Donor welfare          |
 * | welfare_refund          | credit    | Welfare refund         |
 * | welfare_reimbursement   | credit    | Welfare reimbursement  |
 */
export const WALLET_LEDGER_CATALOG = {
  topup: {
    type: "topup",
    direction: "credit",
    label: "Wallet top-up",
    description: "Funds added to your available balance",
  },
  welfare_payment: {
    type: "welfare_payment",
    direction: "debit",
    label: "Donor welfare",
    description: "Held for an active donation booking",
  },
  welfare_refund: {
    type: "welfare_refund",
    direction: "credit",
    label: "Welfare refund",
    description: "Held funds returned to your available balance",
  },
  welfare_reimbursement: {
    type: "welfare_reimbursement",
    direction: "credit",
    label: "Welfare reimbursement",
    description: "Support credited after a completed donation",
  },
} as const satisfies Record<
  WalletLedgerEntryType,
  {
    type: WalletLedgerEntryType;
    direction: WalletLedgerDirection;
    label: string;
    description: string;
  }
>;

export const WALLET_LEDGER_ENTRY_TYPES = Object.keys(
  WALLET_LEDGER_CATALOG,
) as WalletLedgerEntryType[];

export function isWalletLedgerEntryType(
  value: string,
): value is WalletLedgerEntryType {
  return value in WALLET_LEDGER_CATALOG;
}

export type WalletLedgerEntry = {
  type: WalletLedgerEntryType | (string & {});
  label: string;
  direction: WalletLedgerDirection;
  amountKobo: number;
  bookingId: string | null;
  /** ISO timestamp from the API. */
  createdAt: string | null;
};

/** GET /wallet `data` payload. */
export type WalletSummary = {
  availableKobo: number;
  heldKobo: number;
  currency: "NGN" | (string & {});
  entries: WalletLedgerEntry[];
};

/** Nest-style body: `{ message, data: WalletSummary }`. */
export type WalletSummaryResponse = {
  message?: string;
  data: WalletSummary;
};

/** Paystack practical NGN minimum (₦100). */
export const MIN_WALLET_TOPUP_KOBO = 10_000;

/** POST /wallet/topups body. */
export type CreateWalletTopupPayload = {
  amountKobo: number;
  /** Absolute URL Paystack redirects to after checkout (e.g. https://app/wallet). */
  callbackUrl: string;
};

/** POST /wallet/topups `data` payload. */
export type WalletTopupSession = {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amountKobo: number;
};

export type WalletTopupSessionResponse = {
  message?: string;
  data: WalletTopupSession;
};
