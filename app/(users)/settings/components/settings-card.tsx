import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SettingsCardProps = {
  children: ReactNode;
  className?: string;
};

export function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#DADADA] bg-white px-4 py-5 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7 md:rounded-2xl md:px-8 md:py-8 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

type SettingsSectionLabelProps = {
  title: string;
  className?: string;
};

export function SettingsSectionLabel({
  title,
  className,
}: SettingsSectionLabelProps) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] dark:text-white/50",
        className,
      )}
    >
      {title}
    </p>
  );
}
