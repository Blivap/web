import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";

export default function WelfareRepository() {
  return {
    packages(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.welfare.packages, { method: "GET" });
    },
  };
}
