"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { $api } from "@/app/api";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import { Button } from "@/components/button/button.component";

const panelClass =
  "rounded-lg border border-border bg-[#FAFAFA] px-5 py-4 sm:px-6 dark:border-white/10 dark:bg-white/5";

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

function extractQuestionnaireId(root: Record<string, unknown>): string | null {
  const direct =
    typeof root.id === "string"
      ? root.id
      : typeof root._id === "string"
        ? root._id
        : null;
  if (direct) return direct;
  const nested = pickRecord(root.questionnaire ?? root.data);
  if (nested) {
    const id =
      typeof nested.id === "string"
        ? nested.id
        : typeof nested._id === "string"
          ? nested._id
          : null;
    if (id) return id;
  }
  return null;
}

type QnItem = { id: string; text: string; answer: string };

function extractQuestions(root: Record<string, unknown>): QnItem[] {
  const candidates = [
    root.questions,
    root.items,
    pickRecord(root.questionnaire)?.questions,
  ];
  for (const c of candidates) {
    if (!Array.isArray(c)) continue;
    const out: QnItem[] = [];
    for (const raw of c) {
      const q = pickRecord(raw);
      if (!q) continue;
      const id =
        typeof q.id === "string"
          ? q.id
          : typeof q._id === "string"
            ? q._id
            : null;
      if (!id) continue;
      const text =
        typeof q.text === "string"
          ? q.text
          : typeof q.prompt === "string"
            ? q.prompt
            : typeof q.question === "string"
              ? q.question
              : id;
      const ans =
        q.answer != null && typeof q.answer !== "object"
          ? String(q.answer)
          : typeof q.value === "string"
            ? q.value
            : "";
      out.push({ id, text, answer: ans });
    }
    if (out.length > 0) return out;
  }
  return [];
}

export type DonorAiQuestionnairePanelProps = {
  /** Primary donation type from screening profile (defaults to whole blood). */
  primaryDonationType: string;
  disabled?: boolean;
};

/**
 * Optional POST /questionnaire/generate + PATCH …/answer flow.
 * Request/response shapes may vary by gateway — adjust parsing if Swagger differs.
 */
export function DonorAiQuestionnairePanel({
  primaryDonationType,
  disabled = false,
}: DonorAiQuestionnairePanelProps) {
  const [busy, setBusy] = useState(false);
  const [mineError, setMineError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QnItem[]>([]);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  const refreshMine = useCallback(async () => {
    setMineError(null);
    setBusy(true);
    try {
      const { data, status } = await $api.questionnaire.mine();
      if (status < 200 || status >= 300 || data == null) {
        setQuestionnaireId(null);
        setQuestions([]);
        return;
      }
      const raw = unwrapApiRecord(data) ?? pickRecord(data);
      if (!raw) {
        setQuestionnaireId(null);
        setQuestions([]);
        return;
      }
      const id = extractQuestionnaireId(raw);
      setQuestionnaireId(id);
      setQuestions(extractQuestions(raw));
      const nextDraft: Record<string, string> = {};
      for (const q of extractQuestions(raw)) {
        nextDraft[q.id] = q.answer ?? "";
      }
      setDraftAnswers(nextDraft);
    } catch (e) {
      setMineError(getErrorMessage(e, "Could not load questionnaire status."));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!disabled) void refreshMine();
  }, [disabled, refreshMine]);

  const handleGenerate = async () => {
    setActionError(null);
    setLastWarning(null);
    setBusy(true);
    try {
      const { data, status } = await $api.questionnaire.generate(
        primaryDonationType,
      );
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
      if (raw && typeof raw.warning === "string" && raw.warning.trim()) {
        setLastWarning(raw.warning.trim());
      }
      await refreshMine();
    } catch (e) {
      setActionError(
        getErrorMessage(
          e,
          "Could not generate questionnaire. It may already exist — try refresh.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const saveOne = async (questionId: string) => {
    if (!questionnaireId) return;
    setActionError(null);
    setBusy(true);
    try {
      const value = draftAnswers[questionId] ?? "";
      await $api.questionnaire.answer(questionnaireId, {
        questionId,
        answer: value,
      });
      await refreshMine();
    } catch (e) {
      setActionError(
        getErrorMessage(e, "Could not save answer. Check the expected body in API docs."),
      );
    } finally {
      setBusy(false);
    }
  };

  if (disabled) return null;

  const incomplete = questions.filter(
    (q) => !(draftAnswers[q.id] ?? "").trim(),
  );

  return (
    <div className={`${panelClass} space-y-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary">
          Optional typed questionnaire (AI)
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-text-secondary">
        This does not unlock active donor status. After your screening profile
        looks right for your primary donation type, you can generate typed
        questions for richer screening and your public donor card.
      </p>
      {mineError ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">{mineError}</p>
      ) : null}
      {actionError ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}
      {lastWarning ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">{lastWarning}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          loading={busy}
          onClick={() => void handleGenerate()}
          className="rounded-md! px-5 py-2 text-xs"
        >
          Generate questionnaire
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void refreshMine()}
          className="rounded-md! px-5 py-2 text-xs"
        >
          Refresh status
        </Button>
      </div>

      {questions.length > 0 ? (
        <ul className="space-y-3 pt-1">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-md border border-border bg-white px-4 py-3 dark:border-white/10 dark:bg-[#1a1a22]"
            >
              <p className="text-xs font-medium text-text-primary">{q.text}</p>
              <textarea
                className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-xs text-text-primary outline-none focus:border-primary dark:border-white/10 dark:bg-[#14141a]"
                rows={2}
                value={draftAnswers[q.id] ?? ""}
                onChange={(e) =>
                  setDraftAnswers((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
                placeholder="Your answer"
              />
              <Button
                type="button"
                variant="primary"
                disabled={busy || !(draftAnswers[q.id] ?? "").trim()}
                loading={busy}
                onClick={() => void saveOne(q.id)}
                className="mt-2 rounded-md! px-5 py-2 text-xs"
              >
                Save answer
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-text-tertiary">
          No questionnaire loaded yet. Use Generate (primary type:{" "}
          <span className="font-mono">{primaryDonationType}</span>) or Refresh.
        </p>
      )}

      {questions.length > 0 && incomplete.length === 0 ? (
        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
          All listed answers are non-empty — confirm completion rules on the
          backend if the public card still shows incomplete.
        </p>
      ) : null}
    </div>
  );
}
