"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

type Crumb = { href: string; label: string; current: boolean };

const SEGMENT_LABEL: Record<string, string> = {
  overview: "Overview",
  dashboard: "Dashboard",
  donors: "Donors",
  bookings: "Bookings",
  booking: "Booking",
  meetup: "Meetup",
  wallet: "Wallet",
  history: "History",
  settings: "Settings",
  new: "New",
  "verify-id": "Verify ID",
  "schedule-appointment": "Schedule appointment",
  select_avatar: "Select avatar",
};

/** Label for the final crumb when the URL ends with a dynamic id (not the raw id). */
const TRAILING_ID_LABEL: Record<string, string> = {
  meetup: "Meetup session",
  donors: "Donor profile",
  bookings: "Booking",
  booking: "Booking",
};

function humanize(segment: string): string {
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function isUuidSegment(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    segment,
  );
}

/** Route params that should never appear as breadcrumb text (UUID, ObjectId, long opaque ids). */
function isDynamicRouteParamId(segment: string): boolean {
  if (isUuidSegment(segment)) return true;
  if (/^[a-f0-9]{24}$/i.test(segment) || /^[a-f0-9]{32}$/i.test(segment))
    return true;
  if (segment.length >= 20 && /^[a-z0-9_-]+$/i.test(segment)) return true;
  if (/^\d{8,}$/.test(segment)) return true;
  return false;
}

function labelForTrailingDynamicId(parentSegment: string | undefined): string {
  if (parentSegment && TRAILING_ID_LABEL[parentSegment])
    return TRAILING_ID_LABEL[parentSegment];
  return "Details";
}

function labelForSegment(segment: string): string {
  if (SEGMENT_LABEL[segment]) return SEGMENT_LABEL[segment];
  return humanize(segment);
}

function crumbsForPath(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ href: routes.overview, label: "Overview", current: true }];
  }

  const crumbs: Crumb[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;

    if (isDynamicRouteParamId(segment)) {
      if (isLast) {
        const parent = segments[i - 1];
        crumbs.push({
          href: pathname,
          label: labelForTrailingDynamicId(parent),
          current: true,
        });
        return crumbs;
      }
      continue;
    }

    crumbs.push({
      href: `/${segments.slice(0, i + 1).join("/")}`,
      label: labelForSegment(segment),
      current: isLast,
    });
  }

  return crumbs;
}

export function LayoutBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const items = useMemo(() => crumbsForPath(pathname), [pathname]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 list-none flex-wrap items-center gap-1 text-xs sm:text-sm font-bold font-poppins">
        {items.map((crumb, i) => (
          <li
            key={`${crumb.href}-${i}`}
            className="flex min-w-0 max-w-full items-center gap-1"
          >
            {i > 0 ? (
              <ChevronRight
                className="size-3.5 shrink-0 text-[#9CA3AF] dark:text-white/40"
                aria-hidden
              />
            ) : null}
            {crumb.current ? (
              <span
                className="truncate font-medium text-[#111827] dark:text-white"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="truncate font-medium text-[#6B7280] transition-colors hover:text-primary dark:text-white/60 dark:hover:text-primary"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
