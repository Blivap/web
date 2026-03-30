"use client";

import { Button } from "@/components/button/button.component";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "./modal.component";

export type AppointmentBookedModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called when the user submits the email code; modal closes after this resolves. */
  onSendCode?: (code: string) => void | Promise<void>;
};

export function AppointmentBookedModal({
  open,
  onClose,
  onSendCode,
}: AppointmentBookedModalProps) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setSending(false);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    if (onSendCode) {
      setSending(true);
      try {
        await onSendCode(trimmed);
        onClose();
      } finally {
        setSending(false);
      }
    } else {
      onClose();
    }
  }, [code, onClose, onSendCode]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-lg px-6 py-9 sm:px-10 sm:py-10"
      closeOnBackdropClick={false}
    >
      <h2 className="mb-3 text-center font-serif text-3xl font-bold tracking-tight text-primary sm:text-[2rem]">
        Congratulations
      </h2>
      <p className="mb-8 text-center text-sm leading-snug text-gray-500 sm:text-base">
        You Have Successfully Booked An Appointment
      </p>
      <div
        className="mb-8 flex size-20 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-sm sm:size-24"
        aria-hidden
      >
        <Check
          className="size-10 stroke-[2.5] sm:size-12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </div>
      <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-text-primary">
        A code was sent to your email. This code will be your means of
        identification and other users will use this code to identify you.
      </p>
      <div className="flex w-full max-w-md flex-col items-stretch gap-2">
        <label
          htmlFor="appointment-booking-code"
          className="text-center text-sm font-medium text-text-primary"
        >
          Enter Code
        </label>
        <input
          id="appointment-booking-code"
          type="text"
          name="bookingCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          autoComplete="one-time-code"
          className="w-full rounded-md border border-[#D1D5DB] bg-white px-4 py-3 text-center text-sm text-text-primary placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
        <p className="mt-1 text-center text-xs leading-relaxed text-text-secondary">
          We sent a code to your email. Please enter the code here to confirm
          you got it.
        </p>
      </div>
      <Button
        type="button"
        variant="primary"
        loading={sending}
        disabled={!code.trim() || sending}
        className="mt-8 rounded-none! min-w-[140px] px-10 py-3.5 text-base font-bold shadow-none"
        onClick={() => void handleSend()}
      >
        Send
      </Button>
    </Modal>
  );
}
