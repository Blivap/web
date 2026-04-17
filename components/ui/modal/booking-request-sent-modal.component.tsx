"use client";

import { Button } from "@/components/button/button.component";
import { routes } from "@/config/routes";
import { Check } from "lucide-react";
import Link from "next/link";
import { Modal } from "./modal.component";

export type BookingRequestSentModalProps = {
  open: boolean;
  onClose: () => void;
};

export function BookingRequestSentModal({
  open,
  onClose,
}: BookingRequestSentModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-lg px-6 py-9 sm:px-10 sm:py-10"
      closeOnBackdropClick={false}
    >
      <h2 className="mb-3 text-center font-serif text-3xl font-bold tracking-tight text-primary sm:text-[2rem]">
        Request sent
      </h2>
      <p className="mb-8 text-center text-sm leading-snug text-text-secondary sm:text-base">
        Your booking request is pending. The donor has been notified.
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
        When they accept, you&apos;ll both see the same meeting verification code
        in Bookings and in your notifications. No code is set until they
        respond.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="primary"
          className="rounded-none! min-w-[140px] px-10 py-3.5 text-base font-bold shadow-none"
          onClick={onClose}
        >
          OK
        </Button>
        <Link
          href={routes.bookings}
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          View bookings
        </Link>
      </div>
    </Modal>
  );
}
