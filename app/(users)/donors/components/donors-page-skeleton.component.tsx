import { cn } from "@/lib/utils";

const DONOR_CARD_CLASS =
  "flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-5 sm:py-5 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]";

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

function DonorCardSkeleton() {
  return (
    <article className={DONOR_CARD_CLASS} aria-hidden>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sk className="size-11 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Sk className="h-3 w-12" />
            <Sk className="h-2.5 w-14" />
          </div>
        </div>
        <Sk className="h-5 w-10 shrink-0 rounded-full" />
      </div>

      <div className="mb-4 flex items-center gap-4">
        <Sk className="h-3 w-10" />
        <Sk className="h-3 w-24" />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <Sk className="h-3 w-[min(100%,9rem)] flex-1" />
        <Sk className="h-8 w-29 shrink-0 rounded-lg sm:h-9 sm:w-32" />
      </div>
    </article>
  );
}

type DonorsPageSkeletonProps = {
  /** Matches PAGE_SIZE on the donors list page. */
  count?: number;
};

export function DonorsPageSkeleton({ count = 9 }: DonorsPageSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 xl:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading donors…</span>
      {Array.from({ length: count }, (_, i) => (
        <DonorCardSkeleton key={i} />
      ))}
    </div>
  );
}
