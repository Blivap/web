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
  wallet: "Wallet",
  history: "History",
  settings: "Settings",
  new: "New",
  "verify-id": "Verify ID",
  "schedule-appointment": "Schedule appointment",
  select_avatar: "Select avatar",
};

function humanize(segment: string): string {
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function labelForSegment(segment: string, prev?: string): string {
  if (SEGMENT_LABEL[segment]) return SEGMENT_LABEL[segment];
  if (prev === "donors" && segment.length >= 20 && /^[\w-]+$/.test(segment)) {
    return "Donor profile";
  }
  return humanize(segment);
}

function crumbsForPath(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ href: routes.overview, label: "Overview", current: true }];
  }

  return segments.map((segment, i) => ({
    href: `/${segments.slice(0, i + 1).join("/")}`,
    label: labelForSegment(segment, i > 0 ? segments[i - 1] : undefined),
    current: i === segments.length - 1,
  }));
}

export function LayoutBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const items = useMemo(() => crumbsForPath(pathname), [pathname]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("min-w-0", className)}
    >
      <ol className="flex min-w-0 list-none flex-wrap items-center gap-1 text-xs sm:text-sm">
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
