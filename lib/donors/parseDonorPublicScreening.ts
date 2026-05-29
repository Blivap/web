import type {
  DonorPublicScreening,
  DonorPublicScreeningQuestion,
} from "@/types/donors";

function pickString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function parseQuestion(raw: unknown): DonorPublicScreeningQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  const id = pickString(q.id ?? q._id ?? q.questionId);
  if (!id) return null;
  const text =
    pickString(q.text ?? q.prompt ?? q.question ?? q.label) ?? undefined;
  const answer = q.answer ?? q.value ?? q.response;
  return { id, text, answer };
}

/** Parses `screening` on GET /donors/:id for public / recipient-facing block. */
export function parseDonorPublicScreening(
  raw: unknown,
): DonorPublicScreening | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const donationType = pickString(s.donationType ?? s.donation_type);
  const screeningComplete =
    typeof s.screeningComplete === "boolean"
      ? s.screeningComplete
      : typeof s.screening_complete === "boolean"
        ? s.screening_complete
        : undefined;

  const qRaw = s.questions ?? s.items;
  let questions: DonorPublicScreeningQuestion[] | undefined;
  if (Array.isArray(qRaw)) {
    const parsed = qRaw
      .map(parseQuestion)
      .filter((x): x is DonorPublicScreeningQuestion => x != null);
    if (parsed.length > 0) questions = parsed;
  }

  if (!donationType && screeningComplete === undefined && !questions) {
    return null;
  }

  return {
    ...(donationType ? { donationType } : {}),
    ...(screeningComplete !== undefined ? { screeningComplete } : {}),
    ...(questions ? { questions } : {}),
  };
}
