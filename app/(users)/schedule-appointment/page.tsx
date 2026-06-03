"use client";

import { Suspense } from "react";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  MapPin,
} from "lucide-react";
import { Layout } from "@/layout/layout.component";
import { BookingRequestSentModal } from "@/components/ui/modal/booking-request-sent-modal.component";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/button/button.component";
import { SCHEDULE_APPOINTMENT_TIME_SLOTS } from "@/lib/schedule-appointment/scheduleAppointment.constants";
import {
  formatDateIso,
  getScheduleAppointmentDiamondRows,
  isBookingSlotInPast,
  isCalendarDayInPast,
} from "@/lib/schedule-appointment/scheduleAppointment.utils";
import { useScheduleAppointment } from "@/hooks/schedule-appointment/useScheduleAppointment.hook";
import { BlivapLogo } from "@/public/svg";

function ScheduleAppointmentPageContent() {
  const {
    donorUserId,
    hospitals,
    hospitalsLoadState,
    hospitalsError,
    loadHospitals,
    setCarouselApi,
    appointment,
    handleAppointmentChange,
    calendarMonth,
    calendarDays,
    monthLabel,
    goToPreviousMonth,
    goToNextMonth,
    canConfirmAppointment,
    isSendingBooking,
    handleSubmit,
    bookingRequestSentOpen,
    closeBookingRequestSentModal,
    bookingSuccessSummary,
  } = useScheduleAppointment();

  const timeSlotRows = getScheduleAppointmentDiamondRows<string>([
    ...SCHEDULE_APPOINTMENT_TIME_SLOTS,
  ]);

  return (
    <Layout>
      <form
        className="mt-6 flex flex-col gap-6 overflow-hidden xl:mt-10"
        onSubmit={handleSubmit}
      >
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:border-white/10 dark:bg-[#14141a] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-start sm:gap-6 sm:px-8 sm:py-8">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/[0.18] dark:ring-primary/25"
              aria-hidden
            >
              <CalendarClock className="size-7" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Screening visit
                </p>
                <h2 className="mt-1.5 text-pretty text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                  Schedule your inspection appointment
                </h2>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-text-secondary">
                  Your first visit includes a blood sample for testing and blood
                  typing. Please allow about{" "}
                  <span className="font-medium text-text-primary">
                    one hour on site
                  </span>{" "}
                  for this screening.
                </p>
              </div>
              <div className="flex gap-3 rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-amber-50/40 px-4 py-3.5 dark:border-amber-400/25 dark:from-amber-950/50 dark:to-amber-950/25">
                <Lightbulb
                  className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-50/95">
                  <span className="font-semibold">Tip:</span> If the nearest
                  blood bank is full, book another location here—you can mention
                  a preferred bank during the screening.
                </p>
              </div>
              <p className="border-t border-border pt-4 text-sm leading-relaxed text-text-secondary dark:border-white/10">
                <span className="font-semibold text-text-primary">
                  Next steps:
                </span>{" "}
                choose a hospital, then pick a date and time. You can adjust
                your choices before you confirm.
              </p>
            </div>
          </div>
        </section>

        {!donorUserId ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-100">
            Open this page from a donor profile using &quot;Schedule
            appointment&quot; so we know which donor to invite.
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-border bg-gradient-to-b from-[#FAFAF9] via-[#F7F5F3] to-[#F0EEEB] p-5 shadow-sm dark:border-white/10 dark:from-[#18181f] dark:via-[#14141a] dark:to-[#101014] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-1 flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15 dark:bg-primary/18 dark:ring-primary/25"
                aria-hidden
              >
                <MapPin className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  Select a hospital
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                  Drag the row or use the arrows. Your choice is used for the
                  inspection appointment.
                </p>
              </div>
            </div>
            {hospitals.length > 0 ? (
              <p className="shrink-0 text-xs font-medium tabular-nums text-text-tertiary sm:pt-1">
                {hospitals.length} location{hospitals.length === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
          {hospitalsLoadState === "loading" ? (
            <div className="flex min-h-[120px] items-center justify-center gap-2 text-sm text-text-secondary">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading hospitals…
            </div>
          ) : hospitalsLoadState === "error" ? (
            <div className="rounded-lg border border-border bg-white px-4 py-4 text-center dark:border-white/10 dark:bg-[#1a1a22]">
              <p className="text-sm text-text-primary">
                {hospitalsError ?? "Could not load hospitals."}
              </p>
              <Button
                type="button"
                variant="link"
                size="xs"
                className="mt-3 h-auto p-0 text-xs"
                onClick={() => void loadHospitals()}
              >
                Try again
              </Button>
            </div>
          ) : hospitals.length === 0 ? (
            <p className="text-center text-sm text-text-secondary">
              No hospitals available yet.
            </p>
          ) : (
            <Carousel
              setApi={setCarouselApi}
              opts={{ align: "start", loop: false }}
              className="w-full"
            >
              <CarouselPrevious
                aria-label="Previous hospital"
                className="left-0 sm:left-1"
              />
              <CarouselNext
                aria-label="Next hospital"
                className="right-0 sm:right-1"
              />
              <div className="mx-9 sm:mx-11">
                <CarouselContent className="-ml-3 md:-ml-4">
                  {hospitals.map((h) => (
                    <CarouselItem
                      key={h.id}
                      className="basis-[min(100%,280px)] pl-3 sm:basis-[248px] md:pl-4 lg:basis-[260px]"
                    >
                      <label
                        className={`flex h-full min-h-[148px] cursor-pointer flex-col rounded-xl border-2 bg-white/90 p-4 shadow-sm transition-all dark:bg-[#1a1a22]/95 dark:shadow-none ${
                          appointment.hospitalId === h.id
                            ? "border-primary ring-2 ring-primary/25 dark:ring-primary/35"
                            : "border-border hover:border-primary/45 hover:shadow-md dark:border-white/10 dark:hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary dark:bg-white/10 dark:text-text-secondary">
                            {h.distance ?? "—"}
                          </span>
                          <input
                            type="radio"
                            name="hospital"
                            value={h.id}
                            checked={appointment.hospitalId === h.id}
                            onChange={() => {
                              handleAppointmentChange("hospitalId", h.id);
                            }}
                            className="sr-only"
                          />
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              appointment.hospitalId === h.id
                                ? "border-primary bg-primary"
                                : "border-border dark:border-white/25"
                            }`}
                          >
                            {appointment.hospitalId === h.id ? (
                              <span className="size-2 rounded-full bg-white" />
                            ) : null}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold leading-snug text-text-primary">
                          {h.name}
                        </p>
                        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-text-secondary">
                          {h.address}
                        </p>
                      </label>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
            </Carousel>
          )}
        </div>

        <div>
          <p className="mb-4 text-center text-sm font-semibold text-text-primary">
            Select date and time
          </p>
          <div className="grid grid-cols-1 content-center justify-center gap-6 border border-[#DADADA] px-10 py-15 lg:grid-cols-7 dark:border-white/10">
            <div className="col-span-3 flex w-full flex-col items-center gap-8">
              <label className="mb-2 block rounded-[50px] bg-[#FFE2E2] px-5 py-2 text-xs font-medium text-text-primary dark:bg-primary/20">
                Choose a date
              </label>
              <div className="w-full">
                <div className="mb-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={goToPreviousMonth}
                    className="rounded p-1"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} strokeWidth={0.8} />
                  </Button>
                  <span className="text-sm font-medium capitalize text-text-primary">
                    {monthLabel}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={goToNextMonth}
                    className="rounded p-1"
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} strokeWidth={0.8} />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <span
                        key={d}
                        className="py-1 text-[8px] font-semibold text-text-primary"
                      >
                        {d}
                      </span>
                    ),
                  )}
                  {calendarDays.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const dateStr = formatDateIso(
                      calendarMonth.year,
                      calendarMonth.month,
                      day,
                    );
                    const isSelected = appointment.date === dateStr;
                    const isPast = isCalendarDayInPast(dateStr);
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() =>
                          !isPast && handleAppointmentChange("date", dateStr)
                        }
                        disabled={isPast}
                        className={`rounded py-1.5 text-sm ${isSelected ? "bg-primary font-medium text-white" : isPast ? "cursor-not-allowed text-text-tertiary" : "text-text-primary hover:bg-primary/10"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="col-span-1 mx-auto h-px max-h-[380px] w-full place-self-center self-center bg-[#DADADA] lg:h-full lg:w-px dark:bg-white/10" />
            <div className="col-span-3 flex w-full flex-col items-center gap-8">
              <label className="mb-2 block rounded-[50px] bg-[#FFE2E2] px-5 py-2 text-xs font-medium text-text-primary dark:bg-primary/20">
                Choose a time
              </label>
              <div className="flex flex-col items-center gap-2">
                {timeSlotRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex flex-wrap justify-center gap-2"
                  >
                    {row.map((t) => {
                      const slotPast =
                        appointment.date &&
                        isBookingSlotInPast(appointment.date, t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={Boolean(slotPast)}
                          onClick={() => {
                            if (slotPast) return;
                            handleAppointmentChange("time", t);
                          }}
                          className={`rounded-lg border px-3 py-2 text-xs shadow-[0px_0px_4px_#00000026] transition-colors dark:shadow-[0px_0px_8px_rgba(0,0,0,0.4)] ${
                            slotPast
                              ? "cursor-not-allowed border-border bg-[#F3F4F6] text-text-tertiary opacity-70 dark:border-white/10 dark:bg-white/5"
                              : appointment.time === t
                                ? "border-primary bg-primary text-white"
                                : "border-border bg-white text-text-primary hover:border-primary/50 dark:border-white/10 dark:bg-[#1a1a22]"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!canConfirmAppointment || isSendingBooking}
          loading={isSendingBooking}
          className="w-fit px-5 py-2.5 text-sm font-medium"
        >
          Confirm
        </Button>
      </form>

      <BookingRequestSentModal
        open={bookingRequestSentOpen}
        onClose={closeBookingRequestSentModal}
        scheduledLabel={bookingSuccessSummary?.scheduledLabel}
        hospitalName={bookingSuccessSummary?.hospitalName}
      />
    </Layout>
  );
}

export default function ScheduleAppointmentPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="mt-6 flex min-h-[200px] items-center justify-center gap-2 text-sm text-text-secondary xl:mt-10">
            <BlivapLogo fill="#960018" className="size-17" />
          </div>
        </Layout>
      }
    >
      <ScheduleAppointmentPageContent />
    </Suspense>
  );
}
