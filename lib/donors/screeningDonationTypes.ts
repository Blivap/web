/**
 * Backend `DonationType` for POST /questionnaire/generate and PATCH screening-profile.
 * Must match server validation (snake_case).
 */
export const QUESTIONNAIRE_DONATION_TYPE_VALUES = [
  "whole_blood",
  "plasma",
  "platelets",
  "kidney",
  "liver",
  "heart",
  "lung",
  "pancreas",
  "intestine",
  "multi_organ",
  "cornea",
  "skin",
  "bone",
  "heart_valve",
  "tendon_ligament",
  "vascular_tissue",
  "sperm_egg_gametes",
  "surrogate_embryo_carrier",
  "milk_placenta_cord_blood",
  "clinical_trial_participation",
  "deceased_brain_body_education",
  "whole_body_anatomy_education",
] as const;

export type QuestionnaireDonationType =
  (typeof QUESTIONNAIRE_DONATION_TYPE_VALUES)[number];

const KNOWN = new Set<string>(QUESTIONNAIRE_DONATION_TYPE_VALUES);

/** UI: primary + additional interests — values are API `DonationType` strings. */
export const SCREENING_DONATION_TYPE_OPTIONS: readonly {
  value: QuestionnaireDonationType;
  label: string;
}[] = [
  { value: "whole_blood", label: "Whole blood" },
  { value: "plasma", label: "Plasma" },
  { value: "platelets", label: "Platelets" },
  { value: "sperm_egg_gametes", label: "Sperm / egg / gametes" },
  { value: "surrogate_embryo_carrier", label: "Surrogacy / embryo carrier" },
  {
    value: "milk_placenta_cord_blood",
    label: "Breast milk, placenta, or cord blood",
  },
  { value: "kidney", label: "Kidney" },
  { value: "liver", label: "Liver" },
  { value: "heart", label: "Heart" },
  { value: "lung", label: "Lung" },
  { value: "pancreas", label: "Pancreas" },
  { value: "intestine", label: "Intestine" },
  { value: "multi_organ", label: "Multi-organ" },
  { value: "cornea", label: "Cornea" },
  { value: "skin", label: "Skin" },
  { value: "bone", label: "Bone" },
  { value: "heart_valve", label: "Heart valve" },
  { value: "tendon_ligament", label: "Tendon / ligament" },
  { value: "vascular_tissue", label: "Vascular tissue" },
  {
    value: "clinical_trial_participation",
    label: "Clinical trial participation",
  },
  {
    value: "deceased_brain_body_education",
    label: "Brain / body donation (research or education)",
  },
  {
    value: "whole_body_anatomy_education",
    label: "Whole body donation (anatomy education)",
  },
];

export type ScreeningDonationTypeValue =
  (typeof SCREENING_DONATION_TYPE_OPTIONS)[number]["value"];

/** Older UI / drafts used SCREAMING_SNAKE — map to API snake_case. */
const LEGACY_DONATION_TYPE_MAP: Readonly<
  Record<string, QuestionnaireDonationType>
> = {
  WHOLE_BLOOD: "whole_blood",
  PLASMA: "plasma",
  PLATELETS: "platelets",
  SPERM: "sperm_egg_gametes",
  OOCYTE: "sperm_egg_gametes",
  EGG: "sperm_egg_gametes",
  EMBRYO: "surrogate_embryo_carrier",
  CORD_BLOOD: "milk_placenta_cord_blood",
  BONE_MARROW: "clinical_trial_participation",
  KIDNEY: "kidney",
  LIVER: "liver",
  HEART: "heart",
  LUNG: "lung",
  PANCREAS: "pancreas",
  INTESTINE: "intestine",
  MULTI_ORGAN: "multi_organ",
  CORNEA: "cornea",
  SKIN: "skin",
  BONE: "bone",
  HEART_VALVE: "heart_valve",
  TENDON_LIGAMENT: "tendon_ligament",
  VASCULAR_TISSUE: "vascular_tissue",
  SPERM_EGG_GAMETES: "sperm_egg_gametes",
  SURROGATE_EMBRYO_CARRIER: "surrogate_embryo_carrier",
  MILK_PLACENTA_CORD_BLOOD: "milk_placenta_cord_blood",
  CLINICAL_TRIAL_PARTICIPATION: "clinical_trial_participation",
  DECEASED_BRAIN_BODY_EDUCATION: "deceased_brain_body_education",
  WHOLE_BODY_ANATOMY_EDUCATION: "whole_body_anatomy_education",
};

/**
 * Coerce any stored or UI string to a valid API donation type (for generate + PATCH).
 */
export function normalizeDonationTypeForApi(
  input: string | null | undefined,
): QuestionnaireDonationType {
  if (!input || typeof input !== "string") return "whole_blood";
  const t = input.trim();
  if (!t) return "whole_blood";
  const lower = t.toLowerCase();
  if (KNOWN.has(lower)) return lower as QuestionnaireDonationType;
  const upper = t.replace(/-/g, "_").toUpperCase();
  const mapped = LEGACY_DONATION_TYPE_MAP[upper];
  if (mapped) return mapped;
  return "whole_blood";
}

/** Normalize every entry in `activeDonationTypes` from profile/API. */
export function normalizeDonationTypesList(
  types: string[] | null | undefined,
): QuestionnaireDonationType[] {
  if (!types || !Array.isArray(types)) return [];
  const out: QuestionnaireDonationType[] = [];
  for (const raw of types) {
    const n = normalizeDonationTypeForApi(raw);
    if (!out.includes(n)) out.push(n);
  }
  return out;
}
