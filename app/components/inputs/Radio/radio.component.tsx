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
  ({ children, labelClassName = "", className, ...inputProps }, ref) => {
    const { checked } = inputProps;

    return (
      <label
        className={`inline-flex items-center gap-2 cursor-pointer select-none ${
          inputProps.disabled ? "cursor-not-allowed opacity-60" : ""
        } ${labelClassName}`.trim()}
      >
        <span className="relative inline-flex shrink-0 w-[18px] h-[18px] border-[1.5px] border-[#DADADA] rounded-full">
          <input
            ref={ref}
            type="radio"
            className="sr-only peer hidden"
            {...inputProps}
          />
          <span
            className="absolute inset-0 m-1 bg-black rounded-full peer-checked:block hidden"
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
