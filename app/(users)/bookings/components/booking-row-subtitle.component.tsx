import type { BookingRowDetailParts } from "@/lib/bookings/formatBookingDisplay";

export function BookingRowSubtitle({
  who,
  hospital,
  when,
}: BookingRowDetailParts) {
  return (
    <div className="min-w-0 space-y-1 text-xs leading-snug text-text-secondary sm:text-[0.8125rem]">
      <p className="text-pretty wrap-break-words">
        <span className="font-medium text-text-primary">{who}</span>
        <span className="text-text-tertiary max-sm:hidden"> · </span>
        <span className="max-sm:block max-sm:mt-0.5 sm:inline">{hospital}</span>
      </p>
      <p className="text-pretty wrap-break-words text-text-tertiary dark:text-text-secondary">
        {when}
      </p>
    </div>
  );
}
