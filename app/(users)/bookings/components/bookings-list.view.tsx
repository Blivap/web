"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useSetQueryParams } from "@/hooks/navigation/useQueryParamState.hook";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import { formatPublicId } from "@/lib/users/formatPublicId";
import { useBuyerBookings } from "@/hooks/bookings/useBuyerBookings.hook";
import { useDonorBookings } from "@/hooks/bookings/useDonorBookings.hook";
import {
  BOOKING_LIST_FILTERS,
  BOOKING_LIST_FILTER_LABELS,
  bookingListEmptyCopy,
  bookingMatchesDate,
  bookingMatchesListFilter,
  isBookingListFilter,
  type BookingListFilter,
} from "@/lib/bookings/bookingListFilters";
import type { Booking } from "@/types/bookings";
import type { BookingsShellRow } from "./bookings-shell.view";
import {
  BookingsShellSkeleton,
  BookingsSingleList,
} from "./bookings-shell.view";
import { BookingReportModal } from "./booking-report-modal.component";
import { DonationRatingModal } from "./donation-rating-modal.component";

function rowsById(
  rows: readonly BookingsShellRow[],
): Map<string, BookingsShellRow> {
  return new Map(rows.map((row) => [row.id, row]));
}

function publicIdFromProfileBody(body: unknown): string | null {
  const root = unwrapApiRecord(body);
  const record =
    root ??
    (body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null);
  if (!record) return null;
  const direct = formatPublicId(
    typeof record.publicId === "string"
      ? record.publicId
      : typeof record.public_id === "string"
        ? record.public_id
        : null,
  );
  if (direct) return direct;
  const user = record.user;
  if (!user || typeof user !== "object") return null;
  const nested = user as Record<string, unknown>;
  return formatPublicId(
    typeof nested.publicId === "string"
      ? nested.publicId
      : typeof nested.public_id === "string"
        ? nested.public_id
        : null,
  );
}

function scheduledTime(booking: Booking): number {
  const time = Date.parse(booking.scheduledAt);
  return Number.isFinite(time) ? time : 0;
}

export function BookingsListView() {
  const donor = useDonorBookings();
  const buyer = useBuyerBookings();
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

  const [resolvedHandles, setResolvedHandles] = useState<
    Record<string, string>
  >({});

  const missingHandleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const booking of buyer.bookings) {
      if (!formatPublicId(booking.donorPublicId) && booking.donorUserId) {
        ids.add(booking.donorUserId);
      }
    }
    for (const booking of donor.bookings) {
      if (!formatPublicId(booking.requesterPublicId) && booking.requesterId) {
        ids.add(booking.requesterId);
      }
    }
    return [...ids].sort();
  }, [buyer.bookings, donor.bookings]);

  useEffect(() => {
    const pending = missingHandleIds.filter((id) => !(id in resolvedHandles));
    if (pending.length === 0) return;
    let cancelled = false;
    void Promise.all(
      pending.map(async (userId) => {
        try {
          const { data, status } = await $api.donors.publicByUserId(userId);
          if (status < 200 || status >= 300) return [userId, ""] as const;
          return [userId, publicIdFromProfileBody(data) ?? ""] as const;
        } catch {
          return [userId, ""] as const;
        }
      }),
    ).then((pairs) => {
      if (cancelled) return;
      setResolvedHandles((current) => {
        const next = { ...current };
        for (const [userId, publicId] of pairs) next[userId] = publicId;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [missingHandleIds, resolvedHandles]);

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

    const titleFor = (
      booking: Booking,
      direction: "incoming" | "outgoing",
      row: BookingsShellRow,
    ): BookingsShellRow => {
      const fromBooking =
        direction === "outgoing"
          ? booking.donorPublicId
          : booking.requesterPublicId;
      const userId =
        direction === "outgoing" ? booking.donorUserId : booking.requesterId;
      const handle =
        formatPublicId(fromBooking) ??
        formatPublicId(resolvedHandles[userId]) ??
        "";
      return handle === row.title ? row : { ...row, title: handle };
    };

    for (const booking of donor.bookings) {
      if (!bookingMatchesListFilter(booking, "incoming", filter)) continue;
      if (!bookingMatchesDate(booking, dateFilter)) continue;
      const row = incoming.get(booking.id);
      if (row) {
        picked.push({
          row: titleFor(booking, "incoming", row),
          at: scheduledTime(booking),
        });
      }
    }
    for (const booking of buyer.bookings) {
      if (!bookingMatchesListFilter(booking, "outgoing", filter)) continue;
      if (!bookingMatchesDate(booking, dateFilter)) continue;
      const row = outgoing.get(booking.id);
      if (row) {
        picked.push({
          row: titleFor(booking, "outgoing", row),
          at: scheduledTime(booking),
        });
      }
    }

    picked.sort((a, b) => b.at - a.at);
    return picked.map((item) => item.row);
  }, [
    buyer.bookings,
    dateFilter,
    donor.bookings,
    filter,
    incomingRows,
    outgoingRows,
    resolvedHandles,
  ]);

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

  if (!donor.user?.id && !buyer.user?.id) {
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

  const donorLoading =
    donor.loadState === "loading" || donor.loadState === "idle";
  const buyerLoading =
    buyer.loadState === "loading" || buyer.loadState === "idle";
  if (donorLoading && buyerLoading) {
    return <BookingsShellSkeleton tabLabels={["Bookings"]} />;
  }

  const bothFailed =
    donor.loadState === "error" && buyer.loadState === "error";
  if (bothFailed) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-[#1a1a22]">
        <p className="text-sm font-medium text-text-primary">
          {donor.loadError ?? buyer.loadError ?? "Something went wrong."}
        </p>
        <Button
          type="button"
          variant="link"
          size="xs"
          className="mt-3 h-auto p-0 text-xs"
          onClick={() => {
            void donor.loadData();
            void buyer.loadData();
          }}
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
        columnLabels={["When", "Booking", "Status"]}
        rows={rows}
        actionsColumnLabel="Actions"
        tableEmptyMessage={emptyCopy.title}
        emptyDescription={emptyCopy.description}
        headerAside={
          <div className="flex items-center gap-2">
          <div className="relative">
            <DatePicker
              name="bookingDate"
              value={dateFilter}
              placeholder="Any date"
              valueClassName="text-xs font-medium"
              aria-label="Filter by date"
              containerClassName="w-44 gap-0"
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
              className="h-9 w-40 text-xs sm:text-sm"
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
