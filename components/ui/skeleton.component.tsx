import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = ComponentPropsWithoutRef<"div">;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#E8E6E3] dark:bg-white/10",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
