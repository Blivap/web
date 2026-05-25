"use client";

import { Modal } from "@/components/ui/modal/modal.component";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  MEETUP_REPORT_CATEGORIES,
  type MeetupReportCategory,
  type MeetupReportPayload,
} from "@/types/meetups";

export type MeetupReportModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MeetupReportPayload) => Promise<void>;
};

const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-[#1a1a22]";

export function MeetupReportModal({
  open,
  onClose,
  onSubmit,
}: MeetupReportModalProps) {
  const [category, setCategory] = useState<MeetupReportCategory>("other");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCategory("other");
    setReason("");
    setDetails("");
    setError(null);
    setSubmitting(false);
  }, [open]);

  const handleSubmit = useCallback(async () => {
    const r = reason.trim();
    if (!r) {
      setError("Please enter a short reason.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const d = details.trim();
      await onSubmit({
        category,
        reason: r,
        ...(d ? { details: d } : {}),
      });
      onClose();
    } catch (e) {
      setError(
        axios.isAxiosError(e)
          ? getAxiosErrorMessage(
              e,
              "Could not send the report. Please try again.",
            )
          : e instanceof Error && e.message.trim()
            ? e.message.trim()
            : "Could not send the report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [category, details, onClose, onSubmit, reason]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-md text-left">
        <h3 className="text-lg font-semibold text-text-primary">
          Report this meetup
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          Our team reviews reports according to platform rules.
        </p>
        <label className="mt-4 block text-xs font-medium text-text-primary">
          Category
        </label>
        <select
          className={`${fieldClass} mt-1`}
          value={category}
          onChange={(e) => setCategory(e.target.value as MeetupReportCategory)}
          disabled={submitting}
        >
          {MEETUP_REPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <label className="mt-3 block text-xs font-medium text-text-primary">
          Reason <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          className={`${fieldClass} mt-1`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Short summary"
          maxLength={500}
          disabled={submitting}
        />
        <label className="mt-3 block text-xs font-medium text-text-primary">
          Details (optional)
        </label>
        <textarea
          className={`${fieldClass} mt-1 min-h-[88px] resize-y`}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional context"
          maxLength={4000}
          disabled={submitting}
        />
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
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Submit report"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
