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
 * The meetup loading state: the chat frame with message placeholders.
 */
export function MeetupPageSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading meetup…</span>
      <div className="relative flex min-h-0 flex-1">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-4 py-6 sm:px-8">
            <div className="flex justify-center">
              <Sk className="h-6 w-36 rounded-full" />
            </div>
            <div className="h-14 w-40 animate-pulse rounded-xl bg-[#F3F4F6] dark:bg-white/8" />
            <div className="ml-auto h-10 w-24 animate-pulse rounded-xl bg-[#FDE8EE] dark:bg-primary/20" />
            <div className="h-16 w-64 max-w-full animate-pulse rounded-xl bg-[#F3F4F6] dark:bg-white/8" />
          </div>

          <div className="border-t border-border px-4 py-4 sm:px-6 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Sk className="size-6 shrink-0 rounded-full" />
                <Sk className="hidden h-4 w-24 sm:block" />
                <Sk className="hidden h-5 w-12 rounded-full sm:block" />
              </div>
              <Sk className="h-6 w-[4.5rem] shrink-0 rounded-full" />
            </div>
            <div className="rounded-xl border border-[#C5CDD6] bg-white p-3 dark:border-white/15 dark:bg-[#111118]">
              <Sk className="h-16 w-full bg-transparent" />
              <div className="mt-2 flex items-center justify-end gap-1.5">
                <Sk className="size-8 rounded-md bg-[#F8D7DE] dark:bg-primary/25" />
                <Sk className="size-8 rounded-md" />
                <Sk className="size-8 rounded-md" />
                <Sk className="h-9 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
