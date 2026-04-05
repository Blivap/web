import type { DonorQuestionnaireResult } from "@/types/donors";

function unwrapData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.data && typeof d.data === "object") {
    return d.data as Record<string, unknown>;
  }
  return d;
}

/** Normalizes questionnaire POST response (handles `{ data: { ... } }` or flat). */
export function parseQuestionnaireResult(
  data: unknown,
): DonorQuestionnaireResult {
  const o = unwrapData(data);
  if (!o) return {};
  const reasons = o.ineligibilityReasons;
  return {
    eligibilityStatus:
      typeof o.eligibilityStatus === "string"
        ? o.eligibilityStatus
        : undefined,
    ineligibilityReasons: Array.isArray(reasons)
      ? reasons.map((x) => String(x))
      : undefined,
  };
}
