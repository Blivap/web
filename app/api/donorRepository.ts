import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";
import type {
  DonorAreaLocation,
  DonorLocationPoint,
  DonorQuestionnairePayload,
  DonorRegisterPayload,
  DonorScreeningProfilePayload,
} from "@/types/donors";
import { normalizeDonationTypesList } from "@/lib/donors/screeningDonationTypes";

export default function DonorRepository() {
  return {
    list(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.donors.list, { method: "GET" });
    },

    getById(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.donors.detail(id), { method: "GET" });
    },

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

    requestActivation(payload?: { areaLocation?: DonorAreaLocation }): Promise<IResponse<unknown>> {
      return fetcher(endpoints.donors.requestActivation, {
        method: "POST",
        ...(payload ? { data: payload } : {}),
      });
    },

    requestRetake(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.donors.requestRetake, {
        method: "POST",
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

    patchScreeningProfile(
      payload: DonorScreeningProfilePayload,
    ): Promise<IResponse<unknown>> {
      const data: DonorScreeningProfilePayload = { ...payload };
      if (data.activeDonationTypes != null) {
        data.activeDonationTypes = normalizeDonationTypesList(
          data.activeDonationTypes,
        );
      }
      return fetcher(endpoints.donors.screeningProfile, {
        method: "PATCH",
        data,
      });
    },
  };
}
