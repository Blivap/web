/** PATCH /questionnaire/:id/answer — per-question value. */
export type QuestionnaireAnswerEnum = "YES" | "NO" | "NULL";

export type QuestionnaireAnswerPayloadItem = {
  questionId: string;
  answer: QuestionnaireAnswerEnum;
};

export function isQuestionnaireAnswerEnum(
  v: string,
): v is QuestionnaireAnswerEnum {
  return v === "YES" || v === "NO" || v === "NULL";
}

/**
 * Map a GET row to a draft value: "" = not answered yet; otherwise YES | NO | NULL.
 * Unanswered rows often use `answer: "NULL"` with `answeredAt: null` — those become "".
 */
export function answerDraftFromApiQuestionRow(
  q: Record<string, unknown>,
): QuestionnaireAnswerEnum | "" {
  const answeredAt = q.answeredAt ?? q.answered_at;
  const raw = q.answer ?? q.value;
  const str = raw != null && typeof raw !== "object" ? String(raw).trim() : "";
  const upper = str.toUpperCase();

  const hasAnswerTimestamp =
    answeredAt != null &&
    answeredAt !== "" &&
    !(typeof answeredAt === "string" && answeredAt.trim() === "");

  if (!hasAnswerTimestamp) {
    if (upper === "YES" || upper === "NO")
      return upper as QuestionnaireAnswerEnum;
    if (upper === "NULL" || upper === "") return "";
    return "";
  }

  if (upper === "YES" || upper === "NO" || upper === "NULL") {
    return upper as QuestionnaireAnswerEnum;
  }
  return "";
}
