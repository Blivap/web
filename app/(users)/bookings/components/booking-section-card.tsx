import classNames from "classnames";
import type { ReactNode } from "react";

type BookingSectionCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  /** Override default muted body text (e.g. donor stat numbers). */
  contentClassName?: string;
};

export function BookingSectionCard({
  title,
  children,
  className,
  contentClassName,
}: BookingSectionCardProps) {
  return (
    <section
      className={classNames(
        "rounded-lg border border-[#E5E7EB] bg-white px-6 py-5 dark:border-white/10 dark:bg-[#1a1a22]",
        className,
      )}
    >
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-primary">
        {title}
      </h2>
      <div
        className={classNames(
          "mt-3 text-sm font-normal text-text-secondary",
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
