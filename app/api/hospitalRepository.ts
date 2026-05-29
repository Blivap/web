import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";

export default function HospitalRepository() {
  return {
    list(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.hospitals.list, { method: "GET" });
    },
  };
}
