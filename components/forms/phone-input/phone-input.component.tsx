"use client";

import classNames from "classnames";
import { ChevronDown } from "lucide-react";
import {
  type ChangeEvent,
  type ChangeEventHandler,
  type FocusEventHandler,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PHONE_COUNTRY_OPTIONS,
  getDialOptionsForStored,
} from "@/lib/phone-country-codes";

export type PhoneInputDialOption = { code: string; label: string };

export type PhoneInputProps = {
  countryCodeName: string;
  nationalFieldName: string;
  countryCode: string;
  national: string;
  onCountryCodeChange: ChangeEventHandler<HTMLSelectElement>;
  /** Receives digits only (non-digits stripped). */
  onNationalDigitsChange: (digits: string) => void;
  onBlur?: FocusEventHandler<HTMLSelectElement | HTMLInputElement>;
  /** When set, dial list includes the current code if it is missing from the catalog. */
  storedFullPhone?: string | null;
  /** When set, overrides `storedFullPhone` / default list. */
  dialOptions?: PhoneInputDialOption[];
  label?: string;
  labelClassName?: string;
  errorNational?: string;
  errorCountryCode?: string;
  placeholderNational?: string;
  disabled?: boolean;
  /** Applied to the country-code trigger (width, etc.). */
  selectClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  rowClassName?: string;
  autoCompleteNational?: string;
};

function fireSelectChange(
  handler: ChangeEventHandler<HTMLSelectElement>,
  name: string,
  value: string,
) {
  const event = {
    target: { name, value },
    currentTarget: { name, value },
  } as ChangeEvent<HTMLSelectElement>;
  handler(event);
}

export function PhoneInput({
  countryCodeName,
  nationalFieldName,
  countryCode,
  national,
  onCountryCodeChange,
  onNationalDigitsChange,
  onBlur,
  storedFullPhone,
  dialOptions: dialOptionsProp,
  label,
  labelClassName,
  errorNational,
  errorCountryCode,
  placeholderNational = "8012345678",
  disabled,
  selectClassName,
  inputClassName,
  containerClassName,
  rowClassName,
  autoCompleteNational = "tel-national",
}: PhoneInputProps) {
  const reactId = useId();
  const nationalId = `${reactId}-phone-national`;
  const listboxId = `${reactId}-phone-country-listbox`;
  const pickerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const dialOptions = useMemo(() => {
    if (dialOptionsProp && dialOptionsProp.length > 0) {
      return dialOptionsProp;
    }
    if (storedFullPhone !== undefined) {
      return getDialOptionsForStored(storedFullPhone);
    }
    return PHONE_COUNTRY_OPTIONS;
  }, [dialOptionsProp, storedFullPhone]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const hasError = Boolean(errorNational || errorCountryCode);
  const errorMessage = errorNational || errorCountryCode;

  const emitCountryBlur = () => {
    onBlur?.({
      target: { name: countryCodeName },
      currentTarget: { name: countryCodeName },
    } as React.FocusEvent<HTMLSelectElement>);
  };

  return (
    <div className={classNames("flex flex-col gap-1", containerClassName)}>
      {label ? (
        <label
          className={classNames(
            "text-[11px] font-medium text-[#111827] dark:text-white/90",
            labelClassName,
          )}
          htmlFor={nationalId}
        >
          {label}
        </label>
      ) : null}

      <div
        className={classNames(
          "flex w-full items-stretch gap-0 rounded-md border border-[#66666659]",
          hasError && "border-red-500",
          rowClassName,
        )}
      >
        <div
          ref={pickerRef}
          className={classNames(
            "relative shrink-0",
            selectClassName === undefined && "max-w-[min(55%,12rem)]",
            selectClassName,
          )}
        >
          <button
            type="button"
            id={`${reactId}-phone-country-trigger`}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-label="Country calling code"
            className={classNames(
              "flex h-full w-full min-w-0 items-center justify-between gap-1 border-0 bg-transparent py-1.5 pl-3 pr-2 text-left text-xs font-medium text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 dark:text-white/90",
            )}
            onClick={() => !disabled && setOpen((o) => !o)}
            onBlur={() => {
              window.requestAnimationFrame(() => {
                const el = document.activeElement;
                if (pickerRef.current?.contains(el)) return;
                emitCountryBlur();
              });
            }}
          >
            <span className="min-w-0 truncate tabular-nums">{countryCode}</span>
            <ChevronDown
              className={classNames(
                "size-3.5 shrink-0 text-[#9794AA] transition-transform dark:text-white/50",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {open ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Country and dial code"
              className="absolute left-0 top-full z-50 mt-1 max-h-56 w-max min-w-full overflow-y-auto rounded-md border border-[#66666659] bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
            >
              {dialOptions.map((o) => (
                <li key={o.code} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={o.code === countryCode}
                    className={classNames(
                      "w-full px-3 py-2 text-left text-xs text-[#111827] hover:bg-[#F3F4F6] dark:text-white/90 dark:hover:bg-white/10",
                      o.code === countryCode && "bg-[#F3F4F6] dark:bg-white/10",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      fireSelectChange(
                        onCountryCodeChange,
                        countryCodeName,
                        o.code,
                      );
                      setOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div
          className="my-1.5 w-px shrink-0 self-stretch bg-[#66666659]"
          aria-hidden
        />
        <input
          id={nationalId}
          type="tel"
          inputMode="numeric"
          name={nationalFieldName}
          value={national}
          disabled={disabled}
          onChange={(e) => {
            onNationalDigitsChange(e.target.value.replace(/\D/g, ""));
          }}
          onBlur={onBlur}
          placeholder={placeholderNational}
          autoComplete={autoCompleteNational}
          className={classNames(
            "min-w-0 flex-1 border-0 bg-transparent py-3 pr-3 pl-2 text-xs font-medium text-[#111827] outline-none placeholder:text-[#9794AA] disabled:opacity-50 dark:text-white/90 dark:placeholder:text-white/40",
            inputClassName,
          )}
        />
      </div>

      {errorMessage ? (
        <p className="text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </div>
  );
}
