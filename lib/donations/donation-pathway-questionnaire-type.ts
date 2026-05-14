import type { QuestionnaireDonationType } from "@/lib/donors/screeningDonationTypes";

/**
 * API `DonationType` aligned with each overview / pathway slug for `?donationType=`
 * deep links (questionnaire + screening).
 */
const QUESTIONNAIRE_TYPE_BY_SLUG: Record<string, QuestionnaireDonationType> = {
  "blood-donation": "whole_blood",
  "plasma-donation": "plasma",
  "platelet-donation": "platelets",
  "bone-marrow-donation": "clinical_trial_participation",
  "stem-cell-donation": "clinical_trial_participation",
  "organ-donation": "multi_organ",
  "kidney-donation": "kidney",
  "liver-donation": "liver",
  "lung-donation": "lung",
  "pancreas-donation": "pancreas",
  "intestine-donation": "intestine",
  "uterus-donation": "surrogate_embryo_carrier",
  "tissue-donation": "clinical_trial_participation",
  "cornea-donation": "cornea",
  "skin-donation": "skin",
  "bone-donation": "bone",
  "tendon-donation": "tendon_ligament",
  "heart-valve-donation": "heart_valve",
  "cartilage-donation": "tendon_ligament",
  "blood-vessel-donation": "vascular_tissue",
  "sperm-donation": "sperm_egg_gametes",
  "egg-ovum-donation": "sperm_egg_gametes",
  "embryo-donation": "surrogate_embryo_carrier",
  "breast-milk-donation": "milk_placenta_cord_blood",
  "placenta-donation": "milk_placenta_cord_blood",
  "umbilical-cord-blood-donation": "milk_placenta_cord_blood",
  surrogacy: "surrogate_embryo_carrier",
  "traditional-surrogacy": "surrogate_embryo_carrier",
  "gestational-surrogacy": "surrogate_embryo_carrier",
  "whole-body-donation-to-science": "whole_body_anatomy_education",
  "brain-donation": "deceased_brain_body_education",
  "dna-donation": "clinical_trial_participation",
  "genetic-sample-donation": "clinical_trial_participation",
  "clinical-trial-participation": "clinical_trial_participation",
  "hair-donation": "clinical_trial_participation",
  "skin-cell-donation": "clinical_trial_participation",
  "cosmetic-research-tissue-donation": "clinical_trial_participation",
};

export function questionnaireDonationTypeForSlug(
  slug: string,
): QuestionnaireDonationType {
  return QUESTIONNAIRE_TYPE_BY_SLUG[slug] ?? "whole_blood";
}

/** Overview / directory link into `/donations/[slug]` with typed deep link. */
export function donationPathwayOverviewHref(slug: string): string {
  const t = questionnaireDonationTypeForSlug(slug);
  return `/donations/${encodeURIComponent(slug)}?donationType=${encodeURIComponent(t)}`;
}

/** Merge or set `donationType` on an internal href (preserves existing query). */
export function withDonationTypeQuery(
  href: string,
  donationType: QuestionnaireDonationType,
): string {
  const q = href.indexOf("?");
  const path = q >= 0 ? href.slice(0, q) : href;
  const params = new URLSearchParams(q >= 0 ? href.slice(q + 1) : "");
  params.set("donationType", donationType);
  return `${path}?${params.toString()}`;
}
