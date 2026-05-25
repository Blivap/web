"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyableTextLabelProps = {
  value: string;
  className?: string;
  /** Shown when value is empty and copy is disabled */
  emptyFallback?: string;
};

export function CopyableTextLabel({
  value,
  className,
  emptyFallback = "—",
}: CopyableTextLabelProps) {
  const [copied, setCopied] = useState(false);
  const trimmed = value.trim();
  const canCopy = trimmed.length > 0;

  const handleCopy = useCallback(async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [canCopy, trimmed]);

  if (!canCopy) {
    return (
      <span
        className={cn(
          "inline-flex w-fit max-w-full items-center rounded-full border border-border bg-[#F4F4F5] px-2.5 py-1 text-xs font-medium text-text-tertiary dark:border-white/10 dark:bg-white/8",
          className,
        )}
      >
        {emptyFallback}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      title="Click to copy"
      aria-label={copied ? "Copied to clipboard" : `Copy email: ${trimmed}`}
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-border bg-[#F4F4F5] px-2.5 py-1 text-left text-xs font-medium text-text-primary transition hover:border-primary/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:border-white/10 dark:bg-white/8 dark:hover:border-primary/30 dark:hover:bg-white/10",
        className,
      )}
    >
      <span className="min-w-0 truncate">{copied ? "Copied!" : trimmed}</span>
      {copied ? (
        <Check
          className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
      ) : (
        <Copy className="size-3 shrink-0 text-text-tertiary" aria-hidden />
      )}
    </button>
  );
}
