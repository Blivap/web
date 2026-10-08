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
  };
}
