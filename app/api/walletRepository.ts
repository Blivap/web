import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";
import type {
  CreateWalletTopupPayload,
  WalletSummaryResponse,
  WalletTopupSessionResponse,
} from "@/types/wallet";

export default function WalletRepository() {
  return {
    /** GET /wallet — balance + ledger for the authenticated user. */
    summary(): Promise<IResponse<WalletSummaryResponse>> {
      return fetcher<WalletSummaryResponse>(endpoints.wallet.summary, {
        method: "GET",
      });
    },

    /**
     * POST /wallet/topups — start Paystack checkout.
     * Body: `{ amountKobo, callbackUrl }`.
     */
    startTopup(
      payload: CreateWalletTopupPayload,
    ): Promise<IResponse<WalletTopupSessionResponse>> {
      return fetcher<WalletTopupSessionResponse>(endpoints.wallet.topups, {
        method: "POST",
        data: payload,
      });
    },

    /**
     * POST /wallet/topups/:reference/verify — settle top-up and return wallet summary.
     * Message is typically "Wallet funded".
     */
    verifyTopup(
      reference: string,
    ): Promise<IResponse<WalletSummaryResponse>> {
      return fetcher<WalletSummaryResponse>(
        endpoints.wallet.verifyTopup(reference),
        { method: "POST" },
      );
    },

    /** GET /wallet/banks — active Nigerian banks `{ bank, code }[]`. */
    listBanks(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.banks, { method: "GET" });
    },

    /**
     * POST /wallet/bank-accounts/resolve —
     * Body: `{ accountNumber, bank? }` where `bank` is a name like "First Bank".
     */
    resolveBankAccount(payload: {
      accountNumber: string;
      bank?: string;
    }): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.resolveBankAccount, {
        method: "POST",
        data: {
          accountNumber: payload.accountNumber,
          ...(payload.bank ? { bank: payload.bank } : {}),
        },
      });
    },

    /** GET /wallet/bank-accounts */
    listBankAccounts(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.bankAccounts, { method: "GET" });
    },

    /**
     * POST /wallet/bank-accounts —
     * Body: `{ accountNumber, bank? }` where `bank` is a name like "First Bank".
     */
    addBankAccount(payload: {
      accountNumber: string;
      bank?: string;
    }): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.bankAccounts, {
        method: "POST",
        data: payload,
      });
    },

    /** POST /wallet/bank-accounts/:id/primary */
    setPrimaryBankAccount(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.setPrimaryBankAccount(id), {
        method: "POST",
      });
    },

    /** DELETE /wallet/bank-accounts/:id */
    deleteBankAccount(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.deleteBankAccount(id), {
        method: "DELETE",
      });
    },

    /** POST /wallet/payouts — emails a 10-minute OTP. */
    requestPayout(payload: {
      amountKobo: number;
      bankAccountId?: string;
    }): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.payouts, {
        method: "POST",
        data: payload,
      });
    },

    /** POST /wallet/payouts/:id/confirm */
    confirmPayout(id: string, otp: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.confirmPayout(id), {
        method: "POST",
        data: { otp },
      });
    },

    /** POST /wallet/payouts/:id/resend-otp */
    resendPayoutOtp(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.resendPayoutOtp(id), {
        method: "POST",
      });
    },

    /** GET /wallet/payouts */
    listPayouts(params?: {
      skip?: number;
      limit?: number;
    }): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.payouts, {
        method: "GET",
        params,
      });
    },

    /** GET /wallet/payouts/:id */
    getPayout(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.wallet.payout(id), { method: "GET" });
    },
  };
}
