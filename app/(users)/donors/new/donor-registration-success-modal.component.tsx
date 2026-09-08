"use client";

import { Button } from "@/components/button/button.component";
import { Modal } from "@/components/ui/modal/modal.component";
import { ArrowRight, CheckCheck, ShieldCheck, Sparkles } from "lucide-react";

type SuccessCard = {
  title: string;
  description: string;
};

export type DonorRegistrationSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  eyebrow: string;
  title: string;
  description: string;
  highlights: SuccessCard[];
  footerNote?: string;
};

export function DonorRegistrationSuccessModal({
  open,
  onClose,
  onContinue,
  eyebrow,
  title,
  description,
  highlights,
  footerNote,
}: DonorRegistrationSuccessModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-2xl overflow-hidden px-0! py-0!"
      closeOnBackdropClick={false}
    >
      <div className="w-full overflow-hidden rounded-xl  overflow-y-auto ">
        <div className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(150,0,24,0.10),rgba(150,0,24,0.03),rgba(255,255,255,0.96))] px-6 py-7 dark:border-primary/15 dark:bg-[linear-gradient(135deg,rgba(150,0,24,0.22),rgba(20,20,26,0.98),rgba(20,20,26,0.92))] sm:px-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary shadow-sm dark:border-primary/20 dark:bg-white/8">
              <Sparkles className="size-3.5" />
              {eyebrow}
            </div>
            <div className="hidden md:flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_18px_36px_rgba(150,0,24,0.25)]">
              <CheckCheck className="size-6" />
            </div>
          </div>
          <h3 className="max-w-md text-left text-xl font-semibold text-text-primary sm:text-[2rem]">
            {title}
          </h3>
          <p className="mt-3 max-w-136 text-left text-sm leading-6 text-[#4B5563] dark:text-white/70 sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-text-primary">
            <ShieldCheck className="size-4 text-primary" />
            What happens next
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {highlights.map((highlight, index) => (
              <div
                key={highlight.title}
                className="rounded-2xl border border-border bg-[#F9FAFB] p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/15">
                  0{index + 1}
                </div>
                <p className="text-xs font-semibold text-text-primary">
                  {highlight.title}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm text-text-secondary">
              {footerNote ??
                "You can safely leave this screen now and continue from your overview."}
            </p>
            <Button onClick={onContinue} className="rounded-xl! px-5 py-2.5">
              Continue <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
