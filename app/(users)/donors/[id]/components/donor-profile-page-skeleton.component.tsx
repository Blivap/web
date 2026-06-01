import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#14141a] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#E8E6E3] dark:bg-white/10",
        className,
      )}
    />
  );
}

export function DonorProfilePageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading donor profile…</span>

      <div className={cardClass}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <Sk className="size-20 shrink-0 rounded-full sm:size-24" />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Sk className="h-3 w-24" />
                <Sk className="h-8 w-28 rounded-full" />
                <Sk className="h-4 w-40" />
              </div>
              <div className="flex gap-2">
                <Sk className="h-7 w-28 rounded-full" />
                <Sk className="h-7 w-32 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4 dark:border-white/10">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-[#FAFAFB] px-3 py-2.5 dark:border-white/10 dark:bg-white/4"
                >
                  <Sk className="h-2.5 w-16" />
                  <Sk className="mt-2 h-5 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex flex-col gap-2 border-b border-border pb-4 dark:border-white/10">
          <Sk className="h-4 w-48" />
          <Sk className="h-3 w-full max-w-lg" />
        </div>
        <div className="mt-4 grid gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-[#FAFAFB] px-3 py-3 dark:border-white/10 dark:bg-white/4"
            >
              <Sk className="h-4 flex-1 max-w-[220px]" />
              <Sk className="size-8 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3 rounded-xl border border-primary/15 bg-primary/6 p-4 dark:border-primary/25 dark:bg-primary/10">
          <Sk className="size-4 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <Sk className="h-3 w-32" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-[92%]" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Sk className="h-12 w-full max-w-[280px] rounded-none sm:rounded-sm" />
      </div>
    </div>
  );
}
