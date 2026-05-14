"use client";

import { forwardRef } from "react";

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Optional label content rendered after the custom radio visual */
  children?: React.ReactNode;
  /** Optional class for the wrapper label */
  labelClassName?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ children, labelClassName = "", ...inputProps }, ref) => {
    return (
      <label
        className={`inline-flex items-center gap-2 cursor-pointer select-none ${
          inputProps.disabled ? "cursor-not-allowed opacity-60" : ""
        } ${labelClassName}`.trim()}
      >
        <span
          className="relative inline-flex size-[18px] shrink-0 rounded-full border-[1.5px] border-border bg-bg-primary has-focus-visible:ring-2 has-focus-visible:ring-ring/40 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-white dark:border-white/25 dark:bg-[#1a1a22] dark:has-focus-visible:ring-offset-[#0a0a0a]"
        >
          <input
            ref={ref}
            type="radio"
            className="peer sr-only hidden"
            {...inputProps}
          />
          <span
            className="absolute inset-0 m-1 hidden rounded-full bg-primary peer-checked:block"
            aria-hidden
          />
        </span>
        {children}
      </label>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
