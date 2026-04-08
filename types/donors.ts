/** Matches backend BloodType / donor register payload. */
export type DonorBloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type DonorGender = "female" | "male" | "other" | "prefer_not_to_say";

/** GeoJSON Point for optional donor location (coordinates: [longitude, latitude]). */
export type DonorLocationPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type DonorRegisterPayload = {
  bloodType: DonorBloodType;
  location?: DonorLocationPoint;
};

export type DonorQuestionnairePayload = {
  gender: DonorGender;
  age18to64: boolean;
  weightUnder50kg: boolean;
  organOrTissueTransplant: boolean;
  injectedDrugsOrDoping: boolean;
  diabetes: boolean;
  bloodProductsOrTransfusion: boolean;
  chronicOrSeriousCondition: boolean;
  hepatitisBVaccineLast2Weeks: boolean;
};

export type DonorEligibilityStatus =
  | "pending"
  | "eligible"
  | "ineligible"
  | "pending_review"
  | string;

/** Typical questionnaire POST response fields (see Swagger Donors). */
export type DonorQuestionnaireResult = {
  eligibilityStatus?: DonorEligibilityStatus;
  ineligibilityReasons?: string[];
};

/** Internal wizard state for health questions before mapping to API booleans. */
export type DonorMedicalFormAnswers = Record<string, string>;
