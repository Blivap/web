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
  ({ className, isActive, size = "icon-sm", ...props }, ref) => (
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
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  ),
);
PaginationLink.displayName = "PaginationLink";

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1 pl-2 border-border bg-background text-text-primary shadow-sm dark:border-white/15 dark:bg-[#25252e]",
        className,
      )}
      {...props}
    >
      <ChevronLeft className="size-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Previous</span>
    </button>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1 pr-2 border-border bg-background text-text-primary shadow-sm dark:border-white/15 dark:bg-[#25252e]",
        className,
      )}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="size-4 shrink-0" aria-hidden />
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
      className={cn(
        "flex size-8 items-center justify-center sm:size-9",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="size-4 text-text-tertiary" />
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
