import type {
  DonorMedicalFormAnswers,
  DonorQuestionnairePayload,
} from "@/types/donors";

function yesNo(v: string | undefined): boolean {
  return v === "yes";
}

/** Map UI answers (yes/no + gender) to POST /donors/questionnaire body. */
export function medicalAnswersToQuestionnairePayload(
  medical: DonorMedicalFormAnswers,
): DonorQuestionnairePayload {
  const gender = (medical.gender ?? "") as DonorQuestionnairePayload["gender"];
  return {
    gender,
    age18to64: yesNo(medical.age_18_64),
    weightUnder50kg: yesNo(medical.weight_under_50kg),
    organOrTissueTransplant: yesNo(medical.organ_tissue_transplant),
    injectedDrugsOrDoping: yesNo(medical.injected_drugs_doping),
    diabetes: yesNo(medical.diabetes),
    bloodProductsOrTransfusion: yesNo(medical.blood_transfusion),
    chronicOrSeriousCondition: yesNo(medical.chronic_condition),
    hepatitisBVaccineLast2Weeks: yesNo(medical.hepatitis_b_vaccine),
  };
}
