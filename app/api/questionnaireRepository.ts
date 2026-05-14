import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import { normalizeDonationTypeForApi } from "@/lib/donors/screeningDonationTypes";
import type { QuestionnaireAnswerPayloadItem } from "@/lib/donors/questionnaireAnswer";
import type { IResponse } from "@/types";

export default function QuestionnaireRepository() {
  return {
    generate(donationType: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.questionnaire.generate, {
        method: "POST",
        data: { donationType: normalizeDonationTypeForApi(donationType) },
      });
    },

    answer(
      questionnaireId: string,
      answers: QuestionnaireAnswerPayloadItem[],
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.questionnaire.answer(questionnaireId), {
        method: "PATCH",
        data: { answers },
      });
    },

    mine(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.questionnaire.mine, { method: "GET" });
    },

    regenerate(questionnaireId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.questionnaire.regenerate(questionnaireId), {
        method: "DELETE",
      });
    },
  };
}
