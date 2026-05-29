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

      <div
        className={`${cardClass} overflow-hidden bg-gradient-to-br from-[#FFF8F7] via-white to-[#FAFAFB] p-0 dark:from-[#1a1416] dark:via-[#14141a] dark:to-[#101014]`}
      >
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
          <div className="relative shrink-0">
            <Sk className="size-28 rounded-full ring-4 ring-white dark:ring-[#1a1a22] sm:size-32" />
            <Sk className="absolute -bottom-1 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Sk className="h-8 w-24 rounded-full" />
              <Sk className="h-4 w-28" />
            </div>
            <div className="space-y-2">
              <Sk className="h-8 w-[72%] max-w-sm sm:h-9" />
              <Sk className="h-4 w-full max-w-md" />
              <Sk className="h-4 w-[85%] max-w-lg" />
            </div>
            <div className="max-w-md space-y-2">
              <div className="flex justify-between gap-2">
                <Sk className="h-3 w-24" />
                <Sk className="h-3 w-14" />
              </div>
              <Sk className="h-2.5 w-full rounded-full" />
            </div>
            <div className="flex items-start gap-2">
              <Sk className="mt-0.5 size-4 shrink-0 rounded" />
              <Sk className="h-4 flex-1 max-w-xs" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-[#FAFAFB] p-4 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex items-start gap-3">
              <Sk className="size-9 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Sk className="h-2.5 w-28" />
                <Sk className="h-6 w-12" />
                <Sk className="h-2.5 w-full max-w-[140px]" />
              </div>
            </div>
          </div>
        ))}
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
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-[#FAFAFB] px-3 py-3 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Sk className="h-4 flex-1 max-w-[220px]" />
              <Sk className="size-8 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3 rounded-xl border border-primary/15 bg-primary/[0.06] p-4 dark:border-primary/25 dark:bg-primary/10">
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
