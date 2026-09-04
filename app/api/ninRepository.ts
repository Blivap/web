import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";

export default function NinRepository() {
  return {
    /**
     * POST /nin-verification — JSON body with `nin`.
     */
    verifyNin(nin: string) {
      return fetcher(endpoints.ninVerification, {
        method: "POST",
        data: { nin },
      });
    },
  };
}
