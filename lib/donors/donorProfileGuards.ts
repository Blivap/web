import type { DonorQuestionnaireResult } from "@/types/donors";

/**
 * Best-effort detection from GET /donors/me (or nested `data`) that the health
 * questionnaire was already submitted. Backend field names vary; we accept several.
 */
export function isQuestionnaireAnswered(
  raw: Record<string, unknown>,
): boolean {
  const truthy = (v: unknown) => v === true || v === "true";

  if (truthy(raw.questionnaireSubmitted)) return true;
  if (truthy(raw.questionnaireCompleted)) return true;
  if (truthy(raw.hasCompletedQuestionnaire)) return true;
  if (typeof raw.questionnaireSubmittedAt === "string") return true;
  if (typeof raw.questionnaire_completed_at === "string") return true;

  if (truthy(raw.questionnaire_submitted)) return true;

  const status = raw.eligibilityStatus ?? raw.eligibility_status;
  if (typeof status === "string" && status.length > 0) return true;

  const reasons = raw.ineligibilityReasons ?? raw.ineligibility_reasons;
  if (Array.isArray(reasons) && reasons.length > 0) return true;

  const q = raw.questionnaire;
  if (q && typeof q === "object") {
    const qo = q as Record<string, unknown>;
    if (qo.submittedAt || qo.completedAt || qo.answers != null) return true;
  }

  if (raw.questionnaireAnswers != null && typeof raw.questionnaireAnswers === "object")
    return true;

  return false;
}

export function extractQuestionnaireResultFromProfile(
  raw: Record<string, unknown>,
): DonorQuestionnaireResult {
  const status =
    (typeof raw.eligibilityStatus === "string" && raw.eligibilityStatus) ||
    (typeof raw.eligibility_status === "string" && raw.eligibility_status) ||
    undefined;
  const reasons =
    raw.ineligibilityReasons ?? raw.ineligibility_reasons;
  return {
    eligibilityStatus: status,
    ineligibilityReasons: Array.isArray(reasons)
      ? reasons.map(String)
      : undefined,
  };
}
