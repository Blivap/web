"use client";

import { Modal } from "@/components/ui/modal/modal.component";
import { useSubmitBookingRating } from "@/hooks/ratings/useSubmitBookingRating.hook";
import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const COMMENT_MAX = 500;

const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-[#1a1a22]";

export type DonationRatingModalProps = {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  donorLabel?: string;
  onSuccess?: () => void;
};

export function DonationRatingModal({
  open,
  onClose,
  bookingId,
  donorLabel,
  onSuccess,
}: DonationRatingModalProps) {
  const { submitRating, busy } = useSubmitBookingRating();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form when modal opens
    setScore(0);
    setComment("");
    setError(null);
  }, [open, bookingId]);

  const handleSubmit = useCallback(async () => {
    if (score < 1) {
      setError("Select a rating from 1 to 5 stars.");
      return;
    }
    setError(null);
    const res = await submitRating(bookingId, score, comment);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    onSuccess?.();
    onClose();
  }, [score, comment, submitRating, bookingId, onSuccess, onClose]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-md text-left">
        <h3 className="text-lg font-semibold text-text-primary">
          Rate your donation experience
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {donorLabel
            ? `How did your meetup with ${donorLabel} go?`
            : "Your feedback helps other requesters choose donors."}
        </p>

        <p className="mt-4 text-xs font-medium text-text-primary">
          Rating <span className="text-red-600">*</span>
        </p>
        <div
          className="mt-2 flex gap-1"
          role="radiogroup"
          aria-label="Star rating"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy}
              className="rounded-md p-1 transition hover:bg-[#F4F4F5] disabled:opacity-50 dark:hover:bg-white/8"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={score >= n}
              onClick={() => {
                setScore(n);
                if (error) setError(null);
              }}
            >
              <Star
                className={`size-8 ${
                  score >= n
                    ? "fill-[#FACC15] text-[#FACC15]"
                    : "text-[#D4D4D8] dark:text-white/25"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-medium text-text-primary">
          Comment (optional)
        </label>
        <textarea
          className={`${fieldClass} mt-1 min-h-[88px] resize-y`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what went well or what could improve"
          maxLength={COMMENT_MAX}
          disabled={busy}
        />
        <p className="mt-1 text-[11px] text-text-tertiary">
          {comment.length}/{COMMENT_MAX}
        </p>

        {error ? (
          <p
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/6"
            onClick={onClose}
            disabled={busy}
          >
            Not now
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
            onClick={() => void handleSubmit()}
            disabled={busy || score < 1}
          >
            {busy ? "Submitting…" : "Submit rating"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
