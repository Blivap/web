import type { QuestionnaireAnswerEnum } from "@/lib/donors/questionnaireAnswer";
import { answerDraftFromApiQuestionRow } from "@/lib/donors/questionnaireAnswer";

function pickObject(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

/**
 * Normalizes GET /questionnaire/my (mine), POST /questionnaire/generate, and similar
 * envelopes into one questionnaire record.
 *
 * Supported shapes:
 * - `{ message, data: { questionnaireId, questions, donationType, version, … } }`
 * - `{ data: [ { questionnaireId, questions, status?, … } ] }` (legacy list)
 * - A bare questionnaire object `{ questionnaireId, questions }`
 */
export function questionnaireRecordFromMineResponse(
  responseData: unknown,
): Record<string, unknown> | null {
  if (responseData == null) return null;

  let node: unknown = responseData;
  const top = pickObject(node);
  if (top?.data !== undefined) {
    node = top.data;
  }

  if (Array.isArray(node)) {
    const items = node
      .map((x) => pickObject(x))
      .filter(Boolean) as Record<string, unknown>[];
    if (items.length === 0) return null;
    const active = items.find(
      (r) => String(r.status ?? "").toLowerCase() === "active",
    );
    return active ?? items[0] ?? null;
  }

  return pickObject(node);
}

/** Non-blocking notice from the API (e.g. screening compatibility). */
export function extractQuestionnaireCompatibilityWarning(
  root: Record<string, unknown> | null,
): string | null {
  if (!root) return null;
  const v =
    root.compatibilityWarning ??
    root.compatibility_warning ??
    root.warning;
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

export function extractQuestionnaireIdFromRecord(
  root: Record<string, unknown>,
): string | null {
  if (
    typeof root.questionnaireId === "string" &&
    root.questionnaireId.trim()
  ) {
    return root.questionnaireId.trim();
  }
  if (
    typeof root.questionnaire_id === "string" &&
    root.questionnaire_id.trim()
  ) {
    return root.questionnaire_id.trim();
  }
  if (typeof root.id === "string" && root.id.trim()) return root.id.trim();
  if (typeof root._id === "string" && root._id.trim()) return root._id.trim();
  const nested = pickObject(root.questionnaire ?? root.data);
  if (nested) {
    const nestedId =
      typeof nested.questionnaireId === "string"
        ? nested.questionnaireId.trim()
        : typeof nested.id === "string"
          ? nested.id.trim()
          : typeof nested._id === "string"
            ? nested._id.trim()
            : null;
    if (nestedId) return nestedId;
  }
  return null;
}

export type ParsedQuestionnaireQuestion = {
  /** Logical id for PATCH body (`questionId`). */
  id: string;
  text: string;
  /** YES | NO | NULL when answered; "" when still open on the server. */
  answer: QuestionnaireAnswerEnum | "";
};

export function extractQuestionsFromQuestionnaireRecord(
  root: Record<string, unknown>,
): ParsedQuestionnaireQuestion[] {
  const candidates = [
    root.questions,
    root.items,
    pickObject(root.questionnaire)?.questions,
  ];

  for (const c of candidates) {
    if (!Array.isArray(c)) continue;
    const out: ParsedQuestionnaireQuestion[] = [];
    for (const raw of c) {
      const q = pickObject(raw);
      if (!q) continue;

      const id =
        typeof q.questionId === "string" && q.questionId.trim()
          ? q.questionId.trim()
          : typeof q.id === "string" && q.id.trim()
            ? q.id.trim()
            : typeof q._id === "string" && q._id.trim()
              ? q._id.trim()
              : null;
      if (!id) continue;

      const text =
        typeof q.question === "string"
          ? q.question
          : typeof q.text === "string"
            ? q.text
            : typeof q.prompt === "string"
              ? q.prompt
              : id;

      const answer = answerDraftFromApiQuestionRow(q);
      out.push({ id, text, answer });
    }
    if (out.length > 0) return out;
  }
  return [];
}
