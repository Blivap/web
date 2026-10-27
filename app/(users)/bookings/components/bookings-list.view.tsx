"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/button/button.component";
import { DatePicker } from "@/components/forms/date-picker/date-picker.component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { $api } from "@/app/api";
import { useSetQueryParams, useQueryParamNumber } from "@/hooks/navigation/useQueryParamState.hook";
import { usePageSize } from "@/hooks/navigation/usePageSize.hook";
import { useAppSelector } from "@/store/hooks";
import { useBuyerBookings } from "@/hooks/bookings/useBuyerBookings.hook";
import { useDonorBookings } from "@/hooks/bookings/useDonorBookings.hook";
import {
  BOOKING_LIST_FILTERS,
  BOOKING_LIST_FILTER_LABELS,
  bookingDirectionForViewer,
  bookingListApiQuery,
  bookingListEmptyCopy,
  bookingStillMatchesListQuery,
  isBookingListFilter,
  type BookingListFilter,
} from "@/lib/bookings/bookingListFilters";
import { parseBookingsPaginatedResponse } from "@/lib/bookings/parseBookingsMineResponse";
import type { Booking } from "@/types/bookings";
import type { BookingsShellRow } from "./bookings-shell.view";
import {
  BookingsShellSkeleton,
  BookingsSingleList,
} from "./bookings-shell.view";
const BookingReportModal = dynamic(
  () =>
    import("./booking-report-modal.component").then(
      (mod) => mod.BookingReportModal,
    ),
  { ssr: false },
);
const DonationRatingModal = dynamic(
  () =>
    import("./donation-rating-modal.component").then(
      (mod) => mod.DonationRatingModal,
    ),
  { ssr: false },
);

function rowsById(
  rows: readonly BookingsShellRow[],
): Map<string, BookingsShellRow> {
  return new Map(rows.map((row) => [row.id, row]));
}

function scheduledTime(booking: Booking): number {
  const time = Date.parse(booking.scheduledAt);
  return Number.isFinite(time) ? time : 0;
}

export function BookingsListView() {
  const setParams = useSetQueryParams();
  const searchParams = useSearchParams();
  const rawFilter = searchParams.get("filter") ?? "";
  const legacyView = searchParams.get("view");
  const legacyTab = searchParams.get("tab");
  const rawDate = searchParams.get("date") ?? "";
  const dateFilter = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : "";

  const filter: BookingListFilter = isBookingListFilter(rawFilter)
    ? rawFilter
    : legacyView === "outgoing"
      ? "outgoing"
      : legacyView === "incoming"
        ? "incoming"
        : legacyTab === "confirmed" || legacyTab === "referrals"
          ? "confirmed"
          : legacyTab === "pending" || legacyTab === "active"
            ? "pending"
            : "all";

  const listQuery = useMemo(
    () => bookingListApiQuery(filter, dateFilter),
    [dateFilter, filter],
  );
  const [page] = useQueryParamNumber("page", 1, { omitWhen: 1 });
  const [pageSize] = usePageSize();
  const user = useAppSelector((state) => state.auth.user);
  const [retryKey, setRetryKey] = useState(0);
  const retry = useCallback(() => setRetryKey((key) => key + 1), []);
  const requestKey = `${page}|${pageSize}|${filter}|${dateFilter}`;
  const requestKeyRef = useRef(requestKey);
  const [pageBookings, setPageBookings] = useState<Booking[]>([]);
  const pageBookingsRef = useRef(pageBookings);
  useEffect(() => {
    pageBookingsRef.current = pageBookings;
  }, [pageBookings]);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const queryChanged = requestKeyRef.current !== requestKey;
    requestKeyRef.current = requestKey;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoadState("loading");
      setLoadError(null);
      if (queryChanged) {
        setPageBookings([]);
        setTotalCount(undefined);
      }
      try {
        const response = await $api.bookings.list({
          page,
          limit: pageSize,
          ...listQuery,
        });
        if (cancelled) return;
        if (response.status < 200 || response.status >= 300) {
          setLoadState("error");
          setLoadError("Could not load bookings.");
          setPageBookings([]);
          setTotalCount(undefined);
          return;
        }
        const parsed = parseBookingsPaginatedResponse(response.data);
        setPageBookings(parsed.bookings);
        setTotalCount(parsed.meta?.total);
        setLoadState("ok");
      } catch {
        if (cancelled) return;
        setLoadState("error");
        setLoadError("Could not load bookings.");
        setPageBookings([]);
        setTotalCount(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateFilter, filter, listQuery, page, pageSize, requestKey, retryKey, user?.id]);

  const onBookingPatched = useCallback(
    (id: string, patch: Partial<Booking>) => {
      const current = pageBookingsRef.current;
      let removed = 0;
      const next = current.flatMap((row) => {
        if (row.id !== id) return [row];
        const updated = { ...row, ...patch };
        if (
          bookingStillMatchesListQuery(updated, filter, dateFilter, user?.id)
        ) {
          return [updated];
        }
        removed += 1;
        return [];
      });
      pageBookingsRef.current = next;
      setPageBookings(next);
      if (removed > 0) {
        setTotalCount((total) =>
          typeof total === "number" ? Math.max(0, total - removed) : total,
        );
      }
    },
    [dateFilter, filter, user?.id],
  );

  const { incomingBookings, outgoingBookings } = useMemo(() => {
    const incomingBookings: Booking[] = [];
    const outgoingBookings: Booking[] = [];
    for (const booking of pageBookings) {
      if (bookingDirectionForViewer(booking, user?.id, filter) === "incoming") {
        incomingBookings.push(booking);
      } else {
        outgoingBookings.push(booking);
      }
    }
    return { incomingBookings, outgoingBookings };
  }, [filter, pageBookings, user?.id]);

  const donor = useDonorBookings({
    enabled: false,
    bookings: incomingBookings,
    onBookingPatched,
  });
  const buyer = useBuyerBookings({
    enabled: false,
    bookings: outgoingBookings,
    onBookingPatched,
  });

  const incomingRows = useMemo(() => {
    return donor.shellTabs.flatMap((tab) => tab.panel.rows);
  }, [donor.shellTabs]);

  const outgoingRows = useMemo(() => {
    return (
      buyer.shellTabs.find((tab) => tab.value === "sent")?.panel.rows ?? []
    );
  }, [buyer.shellTabs]);

  const rows = useMemo(() => {
    const incoming = rowsById(incomingRows);
    const outgoing = rowsById(outgoingRows);
    const picked: { row: BookingsShellRow; at: number }[] = [];

    for (const booking of incomingBookings) {
      const row = incoming.get(booking.id);
      if (row) picked.push({ row, at: scheduledTime(booking) });
    }
    for (const booking of outgoingBookings) {
      const row = outgoing.get(booking.id);
      if (row) picked.push({ row, at: scheduledTime(booking) });
    }

    picked.sort((a, b) => b.at - a.at);
    return picked.map((item) => item.row);
  }, [incomingBookings, incomingRows, outgoingBookings, outgoingRows]);

  const selectFilter = (next: BookingListFilter) => {
    setParams({
      filter: next === "all" ? null : next,
      page: null,
      tab: null,
      view: null,
    });
  };

  const selectDate = (next: string) => {
    setParams({
      date: next || null,
      page: null,
    });
  };

  if (!user?.id) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
          <CalendarDays className="size-5" aria-hidden />
        </div>
        <h3 className="mt-3 text-base font-semibold text-text-primary">
          Your bookings
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          Sign in to view and manage your booking requests.
        </p>
      </div>
    );
  }

  if (loadState === "loading" && pageBookings.length === 0) {
    return <BookingsShellSkeleton tabLabels={["Bookings"]} />;
  }

  if (loadState === "error" && pageBookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-[#1a1a22]">
        <p className="text-sm font-medium text-text-primary">
          {loadError ?? "Something went wrong."}
        </p>
        <Button
          type="button"
          variant="link"
          size="xs"
          className="mt-3 h-auto p-0 text-xs"
          onClick={retry}
        >
          Try again
        </Button>
      </div>
    );
  }

  const emptyCopy = bookingListEmptyCopy(filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          Bookings
        </h1>
        <p className="text-sm text-text-secondary">
          Incoming and outgoing requests in one list.
        </p>
      </div>

      <BookingReportModal
        open={donor.reportBookingId !== null}
        bookingId={donor.reportBookingId}
        onClose={() => donor.setReportBookingId(null)}
        onSubmit={donor.submitReport}
      />
      {buyer.activeRatingBooking ? (
        <DonationRatingModal
          open={buyer.ratingOpen}
          onClose={buyer.closeRating}
          bookingId={buyer.activeRatingBooking.id}
          donorLabel={buyer.activeRatingDonorLabel}
          onSuccess={buyer.handleRatingSuccess}
        />
      ) : null}

      <BookingsSingleList
        summarySections={[]}
        mainListTitle={BOOKING_LIST_FILTER_LABELS[filter]}
        columnLabels={["Date", "Booking", "When", "Status"]}
        rows={rows}
        totalCount={totalCount}
        actionsColumnLabel="Actions"
        tableEmptyMessage={emptyCopy.title}
        emptyDescription={emptyCopy.description}
        headerAside={
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <DatePicker
                name="bookingDate"
                value={dateFilter}
                placeholder="Any date"
                valueClassName="text-xs font-medium"
                aria-label="Filter by date"
                containerClassName="w-full min-w-0 gap-0 sm:w-44"
                fieldClassName={dateFilter ? "h-9 pr-8 pl-3" : "h-9 px-3"}
                onChange={(event) => selectDate(event.target.value)}
              />
              {dateFilter ? (
                <button
                  type="button"
                  aria-label="Clear date filter"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  onClick={() => selectDate("")}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
            <Select
              value={filter}
              onValueChange={(value) => {
                if (isBookingListFilter(value)) selectFilter(value);
              }}
            >
              <SelectTrigger
                aria-label="Filter bookings"
                className="h-9 w-full min-w-0 flex-1 text-xs sm:w-40 sm:flex-none sm:text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {BOOKING_LIST_FILTERS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {BOOKING_LIST_FILTER_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
