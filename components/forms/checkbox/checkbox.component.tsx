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
                "mt-0.5 shrink-0 w-4 h-4 rounded  text-primary accent-primary focus:ring-0 focus:ring-primary/20 focus:ring-offset-0 outline-none",
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
                "text-xs font-medium text-[#100F14] select-none leading-snug",
                labelClassName,
              )}
            >
              {label}
            </span>
          </label>
          {error ? (
            <span className="text-red-500 text-[10px]">{error}</span>
          ) : null}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
