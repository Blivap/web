import { getDonationTypeBySlug } from "@/lib/donations/donation-types";
import type { QuestionnaireDonationType } from "@/lib/donors/screeningDonationTypes";

/**
 * API `DonationType` aligned with each overview / pathway slug for `?donationType=`
 * deep links (questionnaire + screening).
 */
const QUESTIONNAIRE_TYPE_BY_SLUG: Record<string, QuestionnaireDonationType> = {
  "blood-donation": "whole_blood",
  "sperm-donation": "sperm_egg_gametes",
  "egg-ovum-donation": "sperm_egg_gametes",
};

export function questionnaireDonationTypeForSlug(
  slug: string,
): QuestionnaireDonationType {
  return QUESTIONNAIRE_TYPE_BY_SLUG[slug] ?? "whole_blood";
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

/** Overview link: straight into donor registration for the pathway. */
export function donationPathwayOverviewHref(slug: string): string {
  const t = questionnaireDonationTypeForSlug(slug);
  const entry = getDonationTypeBySlug(slug);
  if (!entry) {
    return withDonationTypeQuery("/donors/new?type=blood", t);
  }
  return withDonationTypeQuery(entry.integration.registerHref, t);
}
