"use client";

import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import { Modal } from "@/components/ui/modal/modal.component";
import { Textarea } from "@/components/ui/textarea";
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

const selectClass =
  "flex h-10 w-full rounded-md border border-[#66666659] bg-white px-4 text-base font-medium text-[#100F14] outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/12 dark:bg-[#111827] dark:text-white";

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
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#9794AA] dark:text-slate-400">
              Category
            </p>
            <select
              className={selectClass}
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as MeetupReportCategory)
              }
              disabled={submitting}
            >
              {MEETUP_REPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <Input
            name="reason"
            label="Reason *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Short summary"
            maxLength={500}
            disabled={submitting}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#9794AA] dark:text-slate-400">
              Details (optional)
            </p>
            <Textarea
              name="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional context"
              maxLength={4000}
              disabled={submitting}
            />
          </div>
        </div>
        {error ? (
          <p
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            loading={submitting}
          >
            {submitting ? "Sending…" : "Submit report"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
