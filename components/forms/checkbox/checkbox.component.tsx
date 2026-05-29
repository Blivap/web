"use client";

import classNames from "classnames";
import {
  type ChangeEvent,
  type DetailedHTMLProps,
  type FocusEventHandler,
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";

export type CheckboxProps = {
  name: string;
  /** Copy shown beside the control (inside the bordered field). */
  label?: ReactNode;
  /** Controlled state as a boolean (maps to the native `checked` attribute). */
  value: boolean;
  /**
   * Called with the new boolean when the user toggles the checkbox.
   * Use with Formik: `(checked) => void setFieldValue('fieldName', checked)`.
   */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  error?: string;
  /** Class for the text beside the checkbox. */
  labelClassName?: string;
  /** Class for the native checkbox input. */
  checkboxClassName?: string;
  /** Class for the outer column wrapper. */
  containerClassName?: string;
  /** Class for the bordered label wrapper. */
  wrapperClassName?: string;
} & Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  "type" | "size" | "checked" | "value" | "defaultChecked" | "onChange"
>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      name,
      label,
      error,
      value,
      onChange,
      onBlur,
      labelClassName,
      checkboxClassName,
      containerClassName,
      wrapperClassName,
      disabled,
      className,
      ...rest
    },
    ref,
  ) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.checked, event);
    };

    return (
      <div
        className={classNames("flex flex-col gap-2 w-full", containerClassName)}
      >
        <div className="grid gap-px">
          <label
            className={classNames(
              "flex items-start w-full  gap-3",
              !disabled && "cursor-pointer",
              disabled && "cursor-not-allowed opacity-60",
              { "border-red-500": error },
              wrapperClassName,
            )}
          >
            <input
              ref={ref}
              type="checkbox"
              className={classNames(
                "mt-0.5 size-4 shrink-0 cursor-[inherit] rounded border border-border bg-bg-primary accent-primary",
                "text-primary outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0a0a]",
                "disabled:opacity-60 dark:border-white/20 dark:bg-[#1a1a22]",
                checkboxClassName,
                className,
              )}
              name={name}
              checked={value}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={disabled}
              {...rest}
            />
            <span
              className={classNames(
                "select-none text-xs font-medium leading-snug text-text-primary",
                labelClassName,
              )}
            >
              {label}
            </span>
          </label>
          {error ? (
            <span className="text-[10px] text-red-600 dark:text-red-400">
              {error}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
