"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  filterWalletBanks,
  type WalletBankOption,
} from "@/lib/wallet/nigerianBanks";

type BankSearchSelectProps = {
  banks: readonly WalletBankOption[];
  /** Selected bank name (API `bank` field), e.g. "Access Bank". */
  value: string;
  onChange: (bankName: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string | boolean;
  label?: string;
  placeholder?: string;
};

export function BankSearchSelect({
  banks,
  value,
  onChange,
  disabled = false,
  loading = false,
  error,
  label = "Bank",
  placeholder = "Search banks",
}: BankSearchSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => {
    const wanted = value.trim().toLowerCase();
    if (!wanted) return null;
    return (
      banks.find((b) => b.bank.toLowerCase() === wanted) ??
      banks.find((b) => b.bank.toLowerCase().includes(wanted)) ??
      null
    );
  }, [banks, value]);

  const filtered = useMemo(
    () => filterWalletBanks(banks, query),
    [banks, query],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex w-full flex-col gap-1">
      {label ? (
        <p className="text-[11px] font-medium text-[#9794AA] dark:text-slate-400">
          {label}
        </p>
      ) : null}

      <button
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (!disabled && !loading) setOpen((prev) => !prev);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-[#66666659] bg-white px-3 text-left text-sm font-medium text-[#100F14] outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/12 dark:bg-[#111827] dark:text-white",
          error && "border-red-500",
          open && "border-primary ring-2 ring-primary/15",
        )}
      >
        <span
          className={cn(
            "truncate",
            !selected && "font-normal text-[#9794AA] dark:text-slate-500",
          )}
        >
          {loading
            ? "Loading banks…"
            : (selected?.bank ?? placeholder)}
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-[#9794AA]"
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_20px_48px_rgba(16,15,20,0.12)] dark:border-white/10 dark:bg-[#14141a]">
          <div className="flex items-center gap-2 border-b border-[#F0EEEB] px-3 py-2 dark:border-white/10">
            <Search className="size-4 shrink-0 text-[#9794AA]" aria-hidden />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="h-8 w-full bg-transparent text-sm text-[#100F14] outline-none placeholder:text-[#9794AA] dark:text-white"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-[#6B7280]">
                {banks.length === 0
                  ? "No banks available."
                  : `No banks match “${query.trim()}”.`}
              </li>
            ) : (
              filtered.map((row) => {
                const active =
                  selected?.code === row.code ||
                  value.trim().toLowerCase() === row.bank.toLowerCase();
                return (
                  <li key={`${row.code}-${row.bank}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/8 text-text-primary"
                          : "text-[#111827] hover:bg-[#F4F4F5] dark:text-white dark:hover:bg-white/8",
                      )}
                      onClick={() => {
                        onChange(row.bank);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        {active ? (
                          <Check className="size-3.5 text-primary" aria-hidden />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {row.bank}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}

      {typeof error === "string" && error ? (
        <p className="text-[11px] text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
