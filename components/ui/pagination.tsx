"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        "flex flex-row flex-wrap items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="pagination-item" className={cn("", className)} {...props} />
  );
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<VariantProps<typeof buttonVariants>, "size"> &
  React.ComponentProps<"button">;

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, size = "icon-xs", ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        isActive &&
          "pointer-events-none border-primary/40 bg-primary/5 font-semibold text-primary dark:bg-primary/10",
        !isActive &&
          "text-text-primary hover:bg-[#ECECED] dark:hover:bg-white/10",
        className,
        " border-none p-0",
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  ),
);
PaginationLink.displayName = "PaginationLink";

function PaginationPrevious({
  className,
  "aria-label": ariaLabel = "Previous page",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon-xs" }),
        "border-border bg-background text-text-primary shadow-sm dark:border-white/15 dark:bg-[#25252e]",
        className,
      )}
      {...props}
    >
      <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
    </button>
  );
}

function PaginationNext({
  className,
  "aria-label": ariaLabel = "Next page",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon-xs" }),
        "border-border bg-background text-text-primary shadow-sm dark:border-white/15 dark:bg-[#25252e]",
        className,
      )}
      {...props}
    >
      <ChevronRight className="size-3.5 shrink-0" aria-hidden />
    </button>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex size-6 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-3.5 text-text-tertiary" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
