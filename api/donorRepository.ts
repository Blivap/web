import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";
import type {
  DonorLocationPoint,
  DonorQuestionnairePayload,
  DonorRegisterPayload,
} from "@/types/donors";

export default function DonorRepository() {
  return {
    register(
      payload: DonorRegisterPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(endpoints.donors.register, {
        method: "POST",
        data: payload,
      });
    },

    questionnaire(
      payload: DonorQuestionnairePayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.donors.questionnaire, {
        method: "POST",
        data: payload,
      });
    },

    me(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.donors.me, { method: "GET" });
    },

    updateLocation(location: DonorLocationPoint): Promise<IResponse<unknown>> {
      return fetcher(endpoints.donors.location, {
        method: "PATCH",
        data: { location },
      });
    },
  };
}
