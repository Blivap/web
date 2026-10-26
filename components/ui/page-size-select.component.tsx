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
  triggerClassName?: string;
};

export function PageSizeSelect({
  value,
  onChange,
  disabled = false,
  options = PAGE_SIZE_OPTIONS,
  className,
  triggerClassName,
}: PageSizeSelectProps) {
  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      <span className="text-xs whitespace-nowrap text-text-secondary">
        Per page
      </span>
      <Select
        value={String(value)}
        onValueChange={(next) => onChange(Number(next))}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Items per page"
          className={cn(
            "h-8 w-[4.75rem] border-border bg-white text-xs shadow-none dark:border-white/10 dark:bg-[#1a1a22]",
            triggerClassName,
          )}
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
