export type WalletPaymentMethodId =
  | "card"
  | "bank"
  | "ussd"
  | "bank_transfer";

export type WalletPaymentMethod = {
  id: WalletPaymentMethodId;
  label: string;
  description: string;
};

/** Methods Paystack commonly offers for NGN checkout. */
export const WALLET_PAYMENT_METHODS: readonly WalletPaymentMethod[] = [
  {
    id: "card",
    label: "Debit / credit card",
    description: "Visa, Mastercard, or Verve",
  },
  {
    id: "bank",
    label: "Bank",
    description: "Pay from your bank account",
  },
  {
    id: "ussd",
    label: "USSD",
    description: "Dial a short code from your phone",
  },
  {
    id: "bank_transfer",
    label: "Bank transfer",
    description: "Transfer to a Paystack account number",
  },
] as const;

export const DEFAULT_WALLET_PAYMENT_METHOD: WalletPaymentMethodId = "card";
