"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconBtnBase =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-40";

const variants = {
  default:
    "border-border bg-white text-text-secondary hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/8",
  primary:
    "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 dark:border-primary/40 dark:bg-primary/15",
  danger:
    "border-red-200/80 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
  ghost:
    "border-transparent bg-transparent text-text-tertiary hover:border-border hover:bg-[#F9FAFB] hover:text-text-primary dark:hover:bg-white/8",
} as const;

type Variant = keyof typeof variants;

type BookingIconButtonProps = {
  label: string;
  icon: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  onNavigate?: () => void;
};

export function BookingIconButton({
  label,
  icon,
  variant = "default",
  disabled,
  onClick,
  href,
  onNavigate,
}: BookingIconButtonProps) {
  const className = cn(iconBtnBase, variants[variant]);

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={className}
        title={label}
        aria-label={label}
        onClick={onNavigate}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export function BookingIconActions({
  children,
  hint,
  className,
}: {
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col items-end gap-1", className)}>
      <div className="flex flex-row flex-nowrap items-center justify-end gap-1">
        {children}
      </div>
      {hint ? (
        <p className="max-w-full text-right text-[10px] leading-snug text-amber-800 dark:text-amber-300">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
