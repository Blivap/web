import { Skeleton } from "@/components/ui/skeleton.component";

function NotificationRowSkeleton({ showBorderTop }: { showBorderTop?: boolean }) {
  return (
    <div
      className={`flex gap-4 px-5 py-4 sm:px-6 ${
        showBorderTop ? "border-t border-border dark:border-white/10" : ""
      }`}
      aria-hidden
    >
      <Skeleton className="size-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-[min(100%,14rem)]" />
          <Skeleton className="size-2 shrink-0 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full max-w-md" />
        <Skeleton className="h-3 w-[min(100%,11rem)]" />
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="size-8 shrink-0 rounded-lg" />
    </div>
  );
}

type OverviewNotificationsTabSkeletonProps = {
  count?: number;
};

export function OverviewNotificationsTabSkeleton({
  count = 4,
}: OverviewNotificationsTabSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading notifications…</span>
      <ul>
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <NotificationRowSkeleton showBorderTop={index > 0} />
          </li>
        ))}
      </ul>
    </div>
  );
}
