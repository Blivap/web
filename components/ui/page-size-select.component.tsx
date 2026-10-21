"use client";

import {
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from "@/hooks/navigation/usePageSize.hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PageSizeSelectProps = {
  value: PageSizeOption | number;
  onChange: (next: number) => void;
  disabled?: boolean;
  options?: readonly number[];
  className?: string;
};

export function PageSizeSelect({
  value,
  onChange,
  disabled = false,
  options = PAGE_SIZE_OPTIONS,
  className,
}: PageSizeSelectProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 sm:justify-start",
        className,
      )}
    >
      <span className="text-xs text-text-secondary whitespace-nowrap">
        Per page
      </span>
      <Select
        value={String(value)}
        onValueChange={(next) => onChange(Number(next))}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Items per page"
          className="h-8 w-[4.75rem] border-border bg-white text-xs shadow-none dark:border-white/10 dark:bg-[#1a1a22]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
