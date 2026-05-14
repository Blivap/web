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

export type DonorAreaLocation = {
  country: string;
  state: string;
  city: string;
  area: string;
};

export type DonorRegisterPayload = {
  bloodType: DonorBloodType;
  /** Coarse location for donor-recipient matching (POST /donors/register). */
  areaLocation: DonorAreaLocation;
  location?: DonorLocationPoint;
};

/** POST /donors/request-activation — area + donation program (matches `?donationType=` when present). */
export type DonorRequestActivationPayload = {
  areaLocation: DonorAreaLocation;
  /** API `DonationType` snake_case, e.g. `whole_blood`. */
  donationType: string;
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

/** PATCH /donors/screening-profile — clinical / intent (separate from legacy questionnaire gender). */
export type DonorBiologicalSex = "female" | "male" | "other" | "unknown";

export type DonorScreeningProfilePayload = {
  biologicalSex?: DonorBiologicalSex | null;
  activeDonationTypes?: string[] | null;
  isActivelyLactating?: boolean | null;
  isCurrentlyPregnant?: boolean | null;
};

/** GET /donors/:id `screening` — AI questionnaire summary for the primary donation type. */
export type DonorPublicScreeningQuestion = {
  id: string;
  text?: string;
  answer?: unknown;
};

export type DonorPublicScreening = {
  donationType?: string;
  screeningComplete?: boolean;
  questions?: DonorPublicScreeningQuestion[];
};
