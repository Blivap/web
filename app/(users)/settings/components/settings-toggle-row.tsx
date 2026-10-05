"use client";

import { cn } from "@/lib/utils";

type SettingsToggleRowProps = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  showDivider?: boolean;
};

export function SettingsToggleRow({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  showDivider = true,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-1 py-3.5 sm:px-2",
        showDivider && "border-b border-[#E5E7EB] dark:border-white/10",
      )}
    >
      <div className="min-w-0 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-[#111827] dark:text-white/90">
          {title}
        </p>
        {description ? (
          <p className="text-xs text-[#6B7280] dark:text-white/50">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={title}
        disabled={disabled}
        onClick={() => onValueChange(!value)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50",
          value ? "bg-primary" : "bg-[#D1D5DB] dark:bg-white/20",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
            value && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
