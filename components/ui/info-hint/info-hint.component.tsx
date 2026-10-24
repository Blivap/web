"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type InfoHintProps = {
  title: string;
  /** Short subtitle under the title. */
  description?: string;
  /** Extra detail shown inside the popover body. */
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
    <Popover>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent
        align="center"
        collisionPadding={16}
        className="w-80 gap-0 p-0"
      >
        <div className="border-b border-[#F0EEEB] px-4 py-3 dark:border-white/10">
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 px-4 py-3 text-sm leading-relaxed text-text-secondary">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}
