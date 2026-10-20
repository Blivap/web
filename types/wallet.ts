/** Matches backend `WalletLedgerType`. */
export type WalletLedgerEntryType =
  | "topup"
  | "welfare_payment"
  | "welfare_refund"
  | "welfare_reimbursement"
  | "withdrawal"
  | "withdrawal_reversal";

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
  withdrawal: {
    type: "withdrawal",
    direction: "debit",
    label: "Bank withdrawal",
    description: "Sent from your wallet to a saved bank account",
  },
  withdrawal_reversal: {
    type: "withdrawal_reversal",
    direction: "credit",
    label: "Withdrawal returned",
    description: "A failed or reversed withdrawal returned to your balance",
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
  /** Amount reserved for an in-flight bank withdrawal. */
  payoutHeldKobo: number;
  currency: "NGN" | (string & {});
  entries: WalletLedgerEntry[];
};

/** Matches backend `MAX_SAVED_BANK_ACCOUNTS`. */
export const MAX_SAVED_BANK_ACCOUNTS = 3;

export type WalletBankAccount = {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
};

export type WalletResolvedBankAccount = {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
};

/** POST /wallet/bank-accounts/resolve `data` — single match or several. */
export type WalletBankResolveResult =
  | WalletResolvedBankAccount
  | {
      accountNumber: string;
      matches: WalletResolvedBankAccount[];
    };

export type WalletPayoutStatus =
  | "awaiting_otp"
  | "processing"
  | "paid"
  | "failed"
  | "expired";

export type WalletPayout = {
  id: string;
  reference: string;
  amountKobo: number;
  currency: "NGN" | (string & {});
  status: WalletPayoutStatus;
  bankName: string;
  accountName: string;
  accountLast4: string;
  failureReason: string | null;
  receiptAvailable: boolean;
  createdAt: string | null;
  paidAt: string | null;
};

/** Nest-style body: `{ message, data: WalletSummary }`. */
export type WalletSummaryResponse = {
  message?: string;
  data: WalletSummary;
};

/** Paystack practical NGN minimum (₦100). */
export const MIN_WALLET_TOPUP_KOBO = 10_000;

/** Matches backend `MIN_WALLET_PAYOUT_KOBO` (₦100). */
export const MIN_WALLET_PAYOUT_KOBO = MIN_WALLET_TOPUP_KOBO;

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
