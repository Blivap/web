import { cn } from "@/lib/utils";

const cardClass =
  "rounded-xl border border-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]";

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
 * Mirrors the loaded meetup session layout (hero, status + verification, QR,
 * verify, confirm, chat) so loading feels like the real page — no spinner.
 */
export function MeetupPageSkeleton() {
  return (
    <div
      className="mx-auto flex flex-col gap-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading meetup…</span>

      {/* Hero — back link, title, subtitle */}
      <div>
        <Sk className="h-4 w-36" />
        <Sk className="mt-4 h-8 w-64 max-w-full sm:w-72" />
        <Sk className="mt-2 h-3 w-full max-w-xl" />
        <Sk className="mt-2 h-3 w-[92%] max-w-lg" />
      </div>

      {/* Status + verification (same card as loaded UI) */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Sk className="h-3 w-14" />
            <Sk className="mt-2 h-7 w-28" />
            <Sk className="mt-2 h-3 w-48" />
          </div>
          <Sk className="h-7 w-24 shrink-0 rounded-full" />
        </div>

        <div className="mt-4 border-t border-border pt-4 dark:border-white/10">
          <div className="flex items-start gap-2">
            <Sk className="mt-0.5 size-4 shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-2">
              <Sk className="h-4 w-40" />
              <Sk className="h-3 w-full max-w-md" />
              <Sk className="h-3 w-full max-w-sm" />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xl border border-border p-3 dark:border-white/12 dark:bg-[#23232d]">
              <div className="flex items-center gap-2">
                <Sk className="size-4 rounded" />
                <Sk className="h-4 w-16" />
                <Sk className="h-4 w-14 rounded-md" />
              </div>
              <Sk className="h-16 w-full rounded-lg" />
              <Sk className="h-16 w-full rounded-lg" />
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-border p-3 dark:border-white/12 dark:bg-[#23232d]">
              <div className="flex items-center gap-2">
                <Sk className="size-4 rounded" />
                <Sk className="h-4 w-28" />
              </div>
              <Sk className="h-16 w-full rounded-lg" />
              <Sk className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Verify at the hospital — your code + QR, then their code */}
      <section className={cardClass}>
        <Sk className="h-4 w-48" />
        <Sk className="mt-2 h-3 w-full" />
        <Sk className="mt-1 h-3 w-[82%]" />
        <div className="mt-4 rounded-lg border border-border p-3 dark:border-white/10">
          <Sk className="h-3 w-20" />
          <Sk className="mt-2 h-8 w-36" />
          <div className="mt-4 flex justify-center rounded-lg border border-border bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <Sk className="size-[180px] max-w-full rounded-md" />
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4 dark:border-white/10">
          <Sk className="h-3 w-36" />
          <div className="mt-2 flex flex-wrap gap-2">
            <Sk className="h-10 w-44 max-w-full rounded-lg" />
            <Sk className="h-10 w-40 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Confirm donation */}
      <section className={cardClass}>
        <Sk className="h-4 w-40" />
        <Sk className="mt-2 h-3 w-full" />
        <Sk className="mt-1 h-3 w-[78%]" />
        <div className="mt-3 space-y-2">
          <Sk className="h-3 w-56" />
          <Sk className="h-3 w-52" />
        </div>
        <Sk className="mt-4 h-10 w-56 rounded-lg" />
      </section>

      {/* Donation chat */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sk className="size-4 rounded" />
            <Sk className="h-4 w-32" />
          </div>
          <Sk className="h-9 w-40 rounded-lg" />
        </div>
        <Sk className="mt-2 h-3 w-full max-w-xl" />
        <Sk className="mt-1 h-3 w-[72%] max-w-lg" />
        <div className="mt-3 space-y-2 rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-black/20">
          <div className="flex justify-end">
            <Sk className="h-9 w-[72%] max-w-xs rounded-2xl rounded-br-md" />
          </div>
          <div className="flex justify-start">
            <Sk className="h-11 w-[78%] max-w-sm rounded-2xl rounded-bl-md" />
          </div>
          <div className="flex justify-end">
            <Sk className="h-8 w-[55%] max-w-[220px] rounded-2xl rounded-br-md" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Sk className="h-10 min-w-0 flex-1 rounded-lg" />
          <Sk className="h-10 w-20 shrink-0 rounded-lg" />
        </div>
      </section>
    </div>
  );
}
