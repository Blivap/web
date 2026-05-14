"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Sparkles } from "lucide-react";
import { $api } from "@/app/api";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import { Radio } from "@/components/forms/Radio";
import {
  isQuestionnaireAnswerEnum,
  type QuestionnaireAnswerEnum,
  type QuestionnaireAnswerPayloadItem,
} from "@/lib/donors/questionnaireAnswer";
import {
  extractQuestionnaireCompatibilityWarning,
  extractQuestionnaireIdFromRecord,
  extractQuestionsFromQuestionnaireRecord,
  type ParsedQuestionnaireQuestion,
  questionnaireRecordFromMineResponse,
} from "@/lib/donors/questionnaireMineResponse";

const panelClass =
  "rounded-lg border border-border bg-[#FAFAFA] px-5 py-4 sm:px-6 dark:border-white/10 dark:bg-white/5";

const ANSWER_OPTIONS: { value: QuestionnaireAnswerEnum; label: string }[] = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "NULL", label: "Not sure" },
];

function getErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return fallback;
}

function pickRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object") return v as Record<string, unknown>;
  return null;
}

export type DonorAiQuestionnairePanelProps = {
  /**
   * Donation type for POST /questionnaire/generate (API snake_case).
   * Parent should pass `?donationType=` from the URL when set so generate matches the pathway.
   */
  primaryDonationType: string;
  disabled?: boolean;
  /** Fired when all generated questions have a YES / NO / NULL choice selected (or questionnaire is empty). */
  onCompletionChange?: (complete: boolean) => void;
};

export type DonorAiQuestionnairePanelHandle = {
  /** PATCH all current choices in one request. Returns false if validation or the request fails. */
  submitAllAnswers: () => Promise<boolean>;
};

/**
 * Loads GET /questionnaire/mine; if there is no questionnaire yet, POST
 * /questionnaire/generate runs automatically when this step is shown.
 * Answers PATCH uses `{ answers: [{ questionId, answer }] }` with YES | NO | NULL.
 */
export const DonorAiQuestionnairePanel = forwardRef<
  DonorAiQuestionnairePanelHandle,
  DonorAiQuestionnairePanelProps
>(function DonorAiQuestionnairePanel(
  { primaryDonationType, disabled = false, onCompletionChange },
  ref,
) {
  const [busy, setBusy] = useState(false);
  const [mineError, setMineError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestionnaireQuestion[]>([]);
  const [draftAnswers, setDraftAnswers] = useState<
    Record<string, QuestionnaireAnswerEnum | "">
  >({});
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  /** Fetch mine and apply to state. Does not touch `busy`. */
  const fetchAndApplyMine = useCallback(async (): Promise<{
    id: string | null;
    questionCount: number;
  }> => {
    setMineError(null);
    try {
      const { data, status } = await $api.questionnaire.mine();
      if (status < 200 || status >= 300 || data == null) {
        setQuestionnaireId(null);
        setQuestions([]);
        setDraftAnswers({});
        setLastWarning(null);
        return { id: null, questionCount: 0 };
      }
      const raw = questionnaireRecordFromMineResponse(data);
      if (!raw) {
        setQuestionnaireId(null);
        setQuestions([]);
        setDraftAnswers({});
        setLastWarning(null);
        return { id: null, questionCount: 0 };
      }
      const id = extractQuestionnaireIdFromRecord(raw);
      const qs = extractQuestionsFromQuestionnaireRecord(raw);
      const drafts: Record<string, QuestionnaireAnswerEnum | ""> = {};
      for (const q of qs) {
        drafts[q.id] = q.answer;
      }
      setQuestionnaireId(id);
      setQuestions(qs);
      setDraftAnswers(drafts);
      setLastWarning(extractQuestionnaireCompatibilityWarning(raw));
      return { id, questionCount: qs.length };
    } catch (e) {
      setMineError(getErrorMessage(e, "Could not load questionnaire status."));
      setQuestionnaireId(null);
      setQuestions([]);
      setDraftAnswers({});
      setLastWarning(null);
      return { id: null, questionCount: 0 };
    }
  }, []);

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;

    (async () => {
      setBusy(true);
      setActionError(null);
      setLastWarning(null);
      try {
        const first = await fetchAndApplyMine();
        if (cancelled) return;

        const needsGenerate = first.id == null;
        if (needsGenerate) {
          const { data, status } =
            await $api.questionnaire.generate(primaryDonationType);
          if (cancelled) return;

          if (status === 403) {
            setActionError(
              "The server declined this questionnaire (compatibility or policy). You can still request blood donor activation without it.",
            );
            return;
          }
          if (status < 200 || status >= 300) {
            setActionError("Could not generate questionnaire.");
            return;
          }
          const raw = unwrapApiRecord(data) ?? pickRecord(data);
          const compat = extractQuestionnaireCompatibilityWarning(raw);
          if (compat) {
            setLastWarning(compat);
          } else if (
            raw &&
            typeof raw.warning === "string" &&
            raw.warning.trim()
          ) {
            setLastWarning(raw.warning.trim());
          }
          await fetchAndApplyMine();
        }
      } catch (e) {
        if (!cancelled) {
          setActionError(
            getErrorMessage(e, "Could not prepare questionnaire."),
          );
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [disabled, primaryDonationType, fetchAndApplyMine]);

  const incomplete = questions.filter(
    (q) => !isQuestionnaireAnswerEnum(draftAnswers[q.id] ?? ""),
  );

  const allDraftsFilled =
    questions.length > 0 &&
    questions.every((q) => isQuestionnaireAnswerEnum(draftAnswers[q.id] ?? ""));

  const emptyQuestionnaireDone =
    Boolean(questionnaireId) && questions.length === 0;

  const isComplete = allDraftsFilled || emptyQuestionnaireDone;

  useEffect(() => {
    onCompletionChange?.(isComplete);
  }, [isComplete, onCompletionChange]);

  useImperativeHandle(
    ref,
    () => ({
      async submitAllAnswers(): Promise<boolean> {
        if (questions.length === 0) return true;
        const payload: QuestionnaireAnswerPayloadItem[] = [];
        for (const q of questions) {
          const choice = draftAnswers[q.id] ?? "";
          if (!isQuestionnaireAnswerEnum(choice)) {
            setActionError(
              "Choose Yes, No, or Not sure for every question before continuing.",
            );
            return false;
          }
          payload.push({ questionId: q.id, answer: choice });
        }
        if (!questionnaireId) {
          setActionError(
            "Questionnaire is not ready yet. Wait for loading to finish or refresh.",
          );
          return false;
        }
        setActionError(null);
        setBusy(true);
        try {
          await $api.questionnaire.answer(questionnaireId, payload);
          await fetchAndApplyMine();
          return true;
        } catch (e) {
          setActionError(
            getErrorMessage(
              e,
              "Could not save answers. Check the expected body in API docs.",
            ),
          );
          return false;
        } finally {
          setBusy(false);
        }
      },
    }),
    [questionnaireId, questions, draftAnswers, fetchAndApplyMine],
  );

  if (disabled) return null;

  return (
    <div className={`${panelClass} space-y-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary">
          Typed questionnaire (AI)
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-text-secondary">
        Questions load automatically for your donation type. Choose Yes, No, or
        Not sure for each item, then use Continue to save them and move on. This
        supports your donor profile and review — it does not replace the
        activation gate.
      </p>
      {mineError ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {mineError}
        </p>
      ) : null}
      {actionError ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}
      {lastWarning ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {lastWarning}
        </p>
      ) : null}

      {busy && questions.length === 0 && !actionError ? (
        <p className="text-xs text-text-secondary" aria-live="polite">
          Loading your questionnaire…
        </p>
      ) : null}

      {questions.length > 0 ? (
        <ul className="space-y-3 pt-1 max-h-[300px] lg:max-h-[450px] overflow-y-auto custom-scrollbar">
          {questions.map((q) => {
            const selected = draftAnswers[q.id] ?? "";
            const name = `questionnaire-${q.id}`;
            return (
              <li
                key={q.id}
                className="rounded-md border border-border bg-white px-4 py-3 dark:border-white/10 dark:bg-[#1a1a22]"
              >
                <p className="text-xs font-medium text-text-primary">
                  {q.text}
                </p>
                <fieldset className="mt-3 flex flex-wrap gap-4">
                  <legend className="sr-only">Your answer</legend>
                  {ANSWER_OPTIONS.map(({ value, label }) => (
                    <Radio
                      key={value}
                      name={name}
                      value={value}
                      checked={selected === value}
                      disabled={busy}
                      onChange={() =>
                        setDraftAnswers((prev) => ({
                          ...prev,
                          [q.id]: value,
                        }))
                      }
                    >
                      <span className="text-xs text-text-primary">{label}</span>
                    </Radio>
                  ))}
                </fieldset>
              </li>
            );
          })}
        </ul>
      ) : !busy && !actionError ? (
        <p className="text-xs text-text-tertiary">
          No questions were returned. You can still continue if your profile
          already satisfies activation rules (primary type:{" "}
          <span className="font-mono">{primaryDonationType}</span>).
        </p>
      ) : null}

      {questions.length > 0 && incomplete.length === 0 ? (
        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
          Every question has an answer — use Continue below to save them on the
          server and go to activation.
        </p>
      ) : null}
    </div>
  );
});
