import { cn } from "@/lib/utils";

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#E5E7EB] dark:bg-white/10",
        className,
      )}
      aria-hidden
    />
  );
}

/**
 * Mirrors the meetup session layout: chat thread on the left, status and
 * verification on the right.
 */
export function MeetupPageSkeleton() {
  return (
    <div
      className="flex h-full min-h-[28rem] w-full min-w-0 flex-col lg:flex-row"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading meetup…</span>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-hidden px-4 py-6 sm:px-8">
          <div className="flex justify-center">
            <Sk className="h-6 w-40 rounded-full" />
          </div>
          <div className="flex items-start gap-2">
            <Sk className="size-8 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Sk className="h-3 w-28" />
              <Sk className="h-10 w-16 rounded-xl" />
            </div>
          </div>
          <div className="flex items-start justify-end gap-2">
            <div className="flex flex-col items-end gap-2">
              <Sk className="h-3 w-32" />
              <Sk className="h-10 w-20 rounded-xl bg-[#F8D7DE] dark:bg-primary/20" />
            </div>
            <Sk className="size-8 shrink-0 rounded-full" />
          </div>
          <div className="flex items-start gap-2">
            <Sk className="size-8 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Sk className="h-3 w-28" />
              <Sk className="h-16 w-64 max-w-full rounded-xl" />
            </div>
          </div>
        </div>
        <div className="border-t border-border px-4 py-4 sm:px-6 dark:border-white/10">
          <Sk className="mb-2 h-4 w-36" />
          <Sk className="h-28 w-full rounded-xl" />
        </div>
      </div>

      <aside className="hidden w-[22.5rem] shrink-0 flex-col gap-4 border-l border-border px-5 py-6 lg:flex dark:border-white/10">
        <Sk className="h-3 w-14" />
        <Sk className="h-7 w-28" />
        <Sk className="h-3 w-44" />
        <Sk className="mt-4 h-4 w-36" />
        <Sk className="h-28 w-full rounded-xl" />
        <Sk className="h-28 w-full rounded-xl" />
      </aside>
    </div>
  );
}
