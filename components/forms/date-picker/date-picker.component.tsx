"use client";

import classNames from "classnames";
import {
  addMonths,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type FocusEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type DatePickerProps = {
  name: string;
  /** Controlled value as `YYYY-MM-DD` (empty string when unset). */
  value: string;
  label?: string;
  error?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  fieldClassName?: string;
  min?: string;
  max?: string;
  /** Shown when no date is selected. */
  placeholder?: string;
} & Omit<
  ComponentPropsWithoutRef<"button">,
  "type" | "value" | "onChange" | "children" | "onBlur"
>;

function monthIndex(y: number, m: number): number {
  return y * 12 + m;
}

function parseYmd(s: string): Date | null {
  if (!s?.trim()) return null;
  const d = parseISO(s);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
}

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function createChangeEvent(
  name: string,
  value: string,
): ChangeEvent<HTMLInputElement> {
  return {
    target: { name, value } as EventTarget & HTMLInputElement,
    currentTarget: { name, value } as EventTarget & HTMLInputElement,
    type: "change",
  } as ChangeEvent<HTMLInputElement>;
}

function createBlurEvent(name: string): FocusEvent<HTMLInputElement> {
  return {
    target: { name } as EventTarget & HTMLInputElement,
    currentTarget: { name } as EventTarget & HTMLInputElement,
    type: "blur",
  } as FocusEvent<HTMLInputElement>;
}

function isMonthDisabled(
  month: number,
  year: number,
  minD?: Date | null,
  maxD?: Date | null,
): boolean {
  if (minD) {
    const minY = minD.getFullYear();
    const minM = minD.getMonth();
    if (year < minY || (year === minY && month < minM)) return true;
  }
  if (maxD) {
    const maxY = maxD.getFullYear();
    const maxM = maxD.getMonth();
    if (year > maxY || (year === maxY && month > maxM)) return true;
  }
  return false;
}

/**
 * Fully custom date picker (no native `input type="date"`).
 * Calendar popover + Formik-friendly synthetic `change` / `blur` events.
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      name,
      value,
      error,
      label,
      onBlur,
      onChange,
      labelClassName,
      inputClassName,
      containerClassName,
      fieldClassName,
      min,
      max,
      disabled,
      placeholder = "Select date",
      className,
      ...rest
    },
    ref,
  ) {
    const id = useId();
    const listboxId = `${id}-calendar`;
    const containerRef = useRef<HTMLDivElement>(null);
    const monthDropdownRef = useRef<HTMLDivElement>(null);
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [monthMenuOpen, setMonthMenuOpen] = useState(false);
    const [yearMenuOpen, setYearMenuOpen] = useState(false);

    const closePopover = useCallback(() => {
      setMonthMenuOpen(false);
      setYearMenuOpen(false);
      setOpen(false);
    }, []);

    const minDate = useMemo(() => (min ? parseYmd(min) : undefined), [min]);
    const maxDate = useMemo(() => (max ? parseYmd(max) : undefined), [max]);

    const selected = useMemo(() => parseYmd(value), [value]);

    const clampCursor = useCallback(
      (year: number, month: number) => {
        let y = year;
        let m = month;
        if (minDate) {
          const cur = monthIndex(y, m);
          const lo = monthIndex(minDate.getFullYear(), minDate.getMonth());
          if (cur < lo) {
            y = minDate.getFullYear();
            m = minDate.getMonth();
          }
        }
        if (maxDate) {
          const cur = monthIndex(y, m);
          const hi = monthIndex(maxDate.getFullYear(), maxDate.getMonth());
          if (cur > hi) {
            y = maxDate.getFullYear();
            m = maxDate.getMonth();
          }
        }
        return { year: y, month: m };
      },
      [minDate, maxDate],
    );

    const [cursor, setCursor] = useState(() => {
      const base = selected ?? new Date();
      return { year: base.getFullYear(), month: base.getMonth() };
    });

    /* Sync calendar month to selection when opening or when value changes while open. */
    useEffect(() => {
      if (!open) return;
      const base = selected ?? new Date();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- align cursor with `selected` when popover opens or value changes
      setCursor(clampCursor(base.getFullYear(), base.getMonth()));
    }, [open, selected, clampCursor]);

    const calendarDays = useMemo(() => {
      const { year, month } = cursor;
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const startPad = (first.getDay() + 6) % 7;
      const daysInMonth = last.getDate();
      const days: (number | null)[] = [];
      for (let i = 0; i < startPad; i++) days.push(null);
      for (let d = 1; d <= daysInMonth; d++) days.push(d);
      const rows = Math.ceil(days.length / 7);
      while (days.length < rows * 7) days.push(null);
      return days;
    }, [cursor]);

    const displayText = useMemo(() => {
      if (!selected) return "";
      return format(selected, "d MMMM yyyy");
    }, [selected]);

    const isDayDisabled = useCallback(
      (day: number) => {
        const cell = startOfDay(new Date(cursor.year, cursor.month, day));
        if (minDate && isBefore(cell, minDate)) return true;
        if (maxDate && isAfter(cell, maxDate)) return true;
        return false;
      },
      [cursor.month, cursor.year, minDate, maxDate],
    );

    useEffect(() => {
      if (!open) return;
      const onDoc = (e: MouseEvent) => {
        const el = containerRef.current;
        if (el && !el.contains(e.target as Node)) closePopover();
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [open, closePopover]);

    useEffect(() => {
      if (!monthMenuOpen) return;
      const onDoc = (e: MouseEvent) => {
        const el = monthDropdownRef.current;
        if (el && !el.contains(e.target as Node)) setMonthMenuOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [monthMenuOpen]);

    useEffect(() => {
      if (!yearMenuOpen) return;
      const onDoc = (e: MouseEvent) => {
        const el = yearDropdownRef.current;
        if (el && !el.contains(e.target as Node)) setYearMenuOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [yearMenuOpen]);

    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        if (yearMenuOpen) {
          setYearMenuOpen(false);
        } else if (monthMenuOpen) {
          setMonthMenuOpen(false);
        } else {
          closePopover();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, monthMenuOpen, yearMenuOpen, closePopover]);

    const commitValue = (ymd: string) => {
      onChange?.(createChangeEvent(name, ymd));
      closePopover();
      requestAnimationFrame(() => onBlur?.(createBlurEvent(name)));
    };

    const goMonth = (delta: number) => {
      const d = addMonths(new Date(cursor.year, cursor.month, 1), delta);
      setCursor(clampCursor(d.getFullYear(), d.getMonth()));
    };

    const canPrevMonth = useMemo(() => {
      if (!minDate) return true;
      return (
        monthIndex(cursor.year, cursor.month) >
        monthIndex(minDate.getFullYear(), minDate.getMonth())
      );
    }, [cursor.month, cursor.year, minDate]);

    const canNextMonth = useMemo(() => {
      if (!maxDate) return true;
      return (
        monthIndex(cursor.year, cursor.month) <
        monthIndex(maxDate.getFullYear(), maxDate.getMonth())
      );
    }, [cursor.month, cursor.year, maxDate]);

    const yearOptions = useMemo(() => {
      const nowY = new Date().getFullYear();
      const yMin = minDate?.getFullYear() ?? nowY - 120;
      const yMax = maxDate?.getFullYear() ?? nowY + 10;
      const years: number[] = [];
      for (let y = yMax; y >= yMin; y--) years.push(y);
      return years;
    }, [minDate, maxDate]);

    const selectTriggerClass =
      "w-full cursor-pointer rounded-md border border-[#66666659] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#100F14] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition-[border-color,box-shadow] hover:border-[#8A8A8A] focus:border-primary focus:ring-2 focus:ring-primary/15";

    return (
      <div
        ref={containerRef}
        className={classNames(
          "relative flex flex-col gap-2 w-full",
          containerClassName,
        )}
      >
        {label ? (
          <p
            className={classNames(
              "text-[#9794AA] text-xs font-medium",
              labelClassName,
            )}
          >
            {label}
          </p>
        ) : null}
        <div className="grid gap-px">
          <div
            className={classNames(
              "flex items-center border border-[#66666659] rounded-md w-full px-4 gap-2",
              { "border-red-500": error },
              { "opacity-60 pointer-events-none": disabled },
              fieldClassName,
            )}
          >
            <button
              type="button"
              ref={ref}
              id={id}
              disabled={disabled}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={listboxId}
              className={classNames(
                "outline-none py-2.5 w-full min-w-0 text-left text-sm font-medium",
                !displayText && "text-[#9794AA]",
                inputClassName,
                className,
              )}
              onClick={() => !disabled && setOpen((o) => !o)}
              onBlur={(e) => {
                if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                  onBlur?.(createBlurEvent(name));
                }
              }}
              {...rest}
            >
              {displayText || (
                <span className="text-[#9794AA] text-xs font-medium">
                  {placeholder}
                </span>
              )}
            </button>
          </div>

          {open && !disabled ? (
            <div
              id={listboxId}
              role="dialog"
              aria-modal="true"
              aria-label="Choose date"
              className="absolute left-0 top-full z-50 mt-1 w-[232px] rounded-md border border-[#66666659] bg-white p-2 shadow-[0_6px_16px_rgba(15,23,42,0.1)]"
            >
              <div className="mb-1.5 flex items-center gap-0.5">
                <button
                  type="button"
                  className="shrink-0 rounded p-0.5 text-[#100F14] hover:bg-[#F3F4F6] disabled:opacity-30"
                  aria-label="Previous month"
                  disabled={!canPrevMonth}
                  onClick={() => canPrevMonth && goMonth(-1)}
                >
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <div ref={monthDropdownRef} className="relative min-w-0 flex-1">
                  <button
                    type="button"
                    aria-label="Month"
                    aria-haspopup="listbox"
                    aria-expanded={monthMenuOpen}
                    id={`${id}-month-trigger`}
                    className={classNames(
                      selectTriggerClass,
                      "flex items-center justify-between gap-1 text-left",
                    )}
                    onClick={() => {
                      setYearMenuOpen(false);
                      setMonthMenuOpen((v) => !v);
                    }}
                  >
                    <span className="min-w-0 truncate">
                      {MONTHS_SHORT[cursor.month]}
                    </span>
                    <ChevronDown
                      className={classNames(
                        "size-3.5 shrink-0 text-[#9794AA] transition-transform duration-150",
                        monthMenuOpen && "rotate-180",
                      )}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>
                  {monthMenuOpen ? (
                    <ul
                      role="listbox"
                      aria-labelledby={`${id}-month-trigger`}
                      className="absolute left-0 right-0 top-full z-60 mt-0.5 max-h-42 overflow-y-auto rounded-md border border-[#66666659] bg-white py-0.5 shadow-[0_6px_16px_rgba(15,23,42,0.12)]"
                    >
                      {MONTHS_SHORT.map((monthLabel, m) => {
                        const disabled = isMonthDisabled(
                          m,
                          cursor.year,
                          minDate,
                          maxDate,
                        );
                        const isActive = cursor.month === m;
                        return (
                          <li key={monthLabel} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              disabled={disabled}
                              className={classNames(
                                "flex w-full px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                                isActive &&
                                  "bg-[#FDF2F4] font-semibold text-primary",
                                !disabled &&
                                  !isActive &&
                                  "text-[#100F14] hover:bg-[#F9FAFB]",
                                disabled && "cursor-not-allowed text-[#D1D5DB]",
                              )}
                              onClick={() => {
                                if (disabled) return;
                                setCursor(clampCursor(cursor.year, m));
                                setMonthMenuOpen(false);
                              }}
                            >
                              {monthLabel}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
                <div ref={yearDropdownRef} className="relative w-22 shrink-0 ">
                  <button
                    type="button"
                    aria-label="Year"
                    aria-haspopup="listbox"
                    aria-expanded={yearMenuOpen}
                    id={`${id}-year-trigger`}
                    className={classNames(
                      selectTriggerClass,
                      "flex items-center justify-end gap-1 text-right tabular-nums tracking-tight",
                    )}
                    onClick={() => {
                      setMonthMenuOpen(false);
                      setYearMenuOpen((v) => !v);
                    }}
                  >
                    <span className="min-w-0">{cursor.year}</span>
                    <ChevronDown
                      className={classNames(
                        "size-3.5 shrink-0 text-[#9794AA] transition-transform duration-150",
                        yearMenuOpen && "rotate-180",
                      )}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>
                  {yearMenuOpen ? (
                    <ul
                      role="listbox"
                      aria-labelledby={`${id}-year-trigger`}
                      className="absolute left-0 right-0 top-full z-60 mt-0.5 max-h-42 overflow-y-auto rounded-md border border-[#66666659] bg-white py-0.5 pr-2 shadow-[0_6px_16px_rgba(15,23,42,0.12)]"
                    >
                      {yearOptions.map((y) => {
                        const isActive = cursor.year === y;
                        return (
                          <li key={y} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              className={classNames(
                                "flex w-full justify-end px-2.5 py-1.5 text-right text-xs font-medium tabular-nums tracking-tight transition-colors",
                                isActive &&
                                  "bg-[#FDF2F4] font-semibold text-primary",
                                !isActive &&
                                  "text-[#100F14] hover:bg-[#F9FAFB]",
                              )}
                              onClick={() => {
                                setCursor(clampCursor(y, cursor.month));
                                setYearMenuOpen(false);
                              }}
                            >
                              {y}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded p-0.5 text-[#100F14] hover:bg-[#F3F4F6] disabled:opacity-30"
                  aria-label="Next month"
                  disabled={!canNextMonth}
                  onClick={() => canNextMonth && goMonth(1)}
                >
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-px text-center">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <span
                    key={d}
                    className="text-[8px] font-semibold leading-none text-[#9794AA]"
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px">
                {calendarDays.map((day, i) => {
                  if (day === null) {
                    return <div key={`e-${i}`} className="h-7 w-7" />;
                  }
                  const ymd = toYmd(new Date(cursor.year, cursor.month, day));
                  const isSelected =
                    selected && format(selected, "yyyy-MM-dd") === ymd;
                  const dimmed = isDayDisabled(day);
                  return (
                    <button
                      key={ymd}
                      type="button"
                      disabled={dimmed}
                      onClick={() => !dimmed && commitValue(ymd)}
                      className={classNames(
                        "flex h-7 w-7 items-center justify-center rounded text-[11px] font-medium transition-colors",
                        dimmed &&
                          "cursor-not-allowed text-[#D1D5DB] line-through decoration-[#D1D5DB]",
                        !dimmed &&
                          "text-[#100F14] hover:bg-[#FCE7E7] hover:text-primary",
                        isSelected &&
                          !dimmed &&
                          "bg-primary text-white hover:bg-primary hover:text-white",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? (
            <span className="text-red-500 text-[10px]">{error}</span>
          ) : null}
        </div>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";
