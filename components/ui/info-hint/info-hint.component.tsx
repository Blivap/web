"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type InfoHintProps = {
  title: string;
  /** Short dialog subtitle under the title. */
  description?: string;
  /** Extra detail shown inside the dialog body. */
  children: ReactNode;
  /** Accessible label for the icon button. */
  label?: string;
  className?: string;
  iconClassName?: string;
};

/**
 * Compact info control for page chrome.
 * Prefer this over always-visible educational cards: put secondary copy behind the icon.
 */
export function InfoHint({
  title,
  description,
  children,
  label = "More information",
  className,
  iconClassName,
}: InfoHintProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-[#F4F4F5] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:hover:bg-white/10",
            className,
          )}
        >
          <Info className={cn("size-4", iconClassName)} aria-hidden />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-[#F0EEEB] px-5 py-4 pr-12 dark:border-white/10">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex flex-col gap-4 px-5 py-5 text-sm leading-relaxed text-text-secondary">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
