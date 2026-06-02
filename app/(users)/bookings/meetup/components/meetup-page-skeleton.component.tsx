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

function VerificationCardSk({ emphasize }: { emphasize?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3",
        emphasize
          ? "border-primary/35 bg-primary/4 ring-1 ring-primary/15 dark:border-primary/30 dark:bg-primary/10"
          : "border-border bg-[#FAFAFA] dark:border-white/10 dark:bg-white/3",
      )}
    >
      <div className="flex items-center gap-2">
        <Sk className="size-4 shrink-0 rounded-full" />
        <Sk className="h-4 w-20" />
        <Sk className="h-4 w-14 rounded-md" />
      </div>
      <Sk className="h-[52px] w-full rounded-lg" />
      <Sk className="h-[52px] w-full rounded-lg" />
    </div>
  );
}

/**
 * Mirrors the loaded meetup session layout (hero, status + verification, mobile QR,
 * code verify, confirm, chat, actions) — responsive, no horizontal overflow.
 */
export function MeetupPageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading meetup…</span>

      {/* Hero */}
      <div className="min-w-0">
        <Sk className="h-4 w-14" />
        <Sk className="mt-3 h-8 w-56 max-w-full sm:w-64" />
        <Sk className="mt-2 h-3.5 w-full max-w-xl" />
      </div>

      {/* Status + verification */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Sk className="h-3 w-12" />
            <Sk className="mt-2 h-7 w-28" />
            <Sk className="mt-2 h-3 w-44 max-w-full" />
          </div>
          <Sk className="h-7 w-24 shrink-0 rounded-full" />
        </div>

        <div className="mt-4 border-t border-border pt-4 dark:border-white/10">
          <div className="flex items-start gap-2">
            <Sk className="mt-0.5 size-4 shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-2">
              <Sk className="h-4 w-36 max-w-full" />
              <Sk className="h-3 w-full" />
              <Sk className="h-3 w-[90%] max-w-md" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VerificationCardSk emphasize />
            <VerificationCardSk />
          </div>
        </div>
      </section>

      {/* Verify at the hospital */}
      <section className={cardClass}>
        <Sk className="h-4 w-44 max-w-full" />
        <Sk className="mt-2 h-3 w-full max-w-lg" />

        {/* Mobile QR — matches sm:hidden block in loaded UI */}
        <div className="mt-4 rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-black/20 sm:hidden">
          <Sk className="h-9 w-9 rounded-md" />
          <div className="mt-3 flex flex-col items-center gap-3 rounded-lg bg-white p-4 dark:bg-white">
            <Sk className="h-3 w-16" />
            <Sk className="aspect-square w-[min(100%,180px)] max-w-[180px] rounded-md" />
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4 dark:border-white/10">
          <Sk className="h-3.5 w-40 max-w-full" />
          <Sk className="mt-2 h-3 w-full max-w-md" />
          <div className="mt-2 flex max-w-full flex-wrap items-end gap-2">
            <Sk className="h-10 w-full max-w-44 min-w-[7rem] flex-1 rounded-lg sm:flex-none" />
            <Sk className="h-9 w-20 shrink-0 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Confirm donation */}
      <section className={cardClass}>
        <Sk className="h-4 w-40 max-w-full" />
        <Sk className="mt-2 h-3 w-full" />
        <Sk className="mt-1 h-3 w-[85%] max-w-md" />
        <div className="mt-3 space-y-2">
          <Sk className="h-3 w-48 max-w-full" />
          <Sk className="h-3 w-44 max-w-full" />
        </div>
        <Sk className="mt-4 h-9 w-full max-w-56 rounded-lg" />
      </section>

      {/* Donation chat */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Sk className="size-4 shrink-0 rounded" />
            <Sk className="h-4 w-28" />
            <Sk className="h-5 w-14 rounded-full" />
          </div>
          <Sk className="h-9 w-full max-w-[9.5rem] shrink-0 rounded-lg sm:w-36" />
        </div>
        <Sk className="mt-2 h-3 w-full max-w-xl" />
        <div className="mt-3 max-h-64 space-y-2 overflow-hidden rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-black/20">
          <div className="flex justify-end">
            <Sk className="h-9 w-[min(72%,12rem)] rounded-2xl rounded-br-md" />
          </div>
          <div className="flex justify-start">
            <Sk className="h-11 w-[min(78%,14rem)] rounded-2xl rounded-bl-md" />
          </div>
          <div className="flex justify-end">
            <Sk className="h-8 w-[min(55%,11rem)] rounded-2xl rounded-br-md" />
          </div>
        </div>
        <div className="mt-3 flex flex-row items-center gap-2">
          <Sk className="h-11 min-h-[44px] min-w-0 flex-1 rounded-lg" />
          <Sk className="size-11 shrink-0 rounded-lg" />
        </div>
      </section>

      {/* Terminate / report */}
      <div className="flex flex-wrap gap-2">
        <Sk className="h-10 w-full max-w-[8.5rem] rounded-lg sm:w-32" />
        <Sk className="h-10 w-full max-w-[8.5rem] rounded-lg sm:w-36" />
      </div>
    </div>
  );
}
