"use client";

import { Suspense, useMemo } from "react";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { Layout } from "@/layout/layout.component";
import { Button } from "@/components/button/button.component";
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import { Input } from "@/components/forms/inputs/input.component";
import { useDebouncedSearch } from "@/hooks/navigation/useDebouncedSearch.hook";
import {
  useQueryParam,
  useSetQueryParams,
} from "@/hooks/navigation/useQueryParamState.hook";
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
  } = useScheduleAppointment();

  const setParams = useSetQueryParams();
  const [urlHospitalQuery] = useQueryParam("hq", "", { omitWhen: "" });
  const [hospitalQuery, setHospitalQuery] = useDebouncedSearch(
    urlHospitalQuery,
    (trimmed) => {
      setParams({ hq: trimmed || null });
    },
  );

  const timeSlotRows = getScheduleAppointmentDiamondRows<string>([
    ...SCHEDULE_APPOINTMENT_TIME_SLOTS,
  ]);

  const filteredHospitals = useMemo(() => {
    const q = hospitalQuery.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) => {
      const haystack =
        `${h.name} ${h.address} ${h.distance ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [hospitals, hospitalQuery]);

  return (
    <Layout>
      <form
        className="mt-6 flex flex-col gap-6 overflow-hidden xl:mt-10"
        onSubmit={handleSubmit}
      >
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:border-white/10 dark:bg-[#14141a] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-8 sm:py-6">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/[0.18] dark:ring-primary/25"
              aria-hidden
            >
              <CalendarClock className="size-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                Screening visit
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <h2 className="text-pretty text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                  Schedule your inspection appointment
                </h2>
                <InfoHint
                  title="About this screening"
                  label="Screening information"
                  className="size-7"
                >
                  <p>
                    Your first visit includes a blood sample for testing and
                    blood typing. Please allow about one hour on site.
                  </p>
                  <p>
                    If the nearest blood bank is full, book another location
                    here—you can mention a preferred bank during the screening.
                  </p>
                  <p>
                    Choose a hospital, then pick a date and time. You can adjust
                    your choices before you confirm.
                  </p>
                </InfoHint>
              </div>
            </div>
          </div>
        </section>

        {!donorUserId ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-100">
            Open this page from a donor profile using &quot;Schedule
            appointment&quot; so we know which donor to invite.
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-border bg-linear-to-b from-[#FAFAF9] via-[#F7F5F3] to-[#F0EEEB] p-5 shadow-sm dark:border-white/10 dark:from-[#18181f] dark:via-[#14141a] dark:to-[#101014] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15 dark:bg-primary/18 dark:ring-primary/25"
                aria-hidden
              >
                <MapPin className="size-5" />
              </span>
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="text-sm font-semibold text-text-primary">
                  Select a hospital
                </p>
                <InfoHint
                  title="Hospital choice"
                  label="Hospital selection information"
                  className="size-7"
                >
                  <p>
                    Your selected hospital is used for the inspection
                    appointment. Search by name, city, or address.
                  </p>
                </InfoHint>
              </div>
            </div>
            {hospitals.length > 0 ? (
              <p className="shrink-0 text-xs font-medium tabular-nums text-text-tertiary">
                {hospitals.length} location{hospitals.length === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>

          {hospitalsLoadState === "loading" ? (
            <div className="flex min-h-30 items-center justify-center gap-2 text-sm text-text-secondary">
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
            <div className="flex flex-col gap-3">
              <Input
                name="hospitalSearch"
                placeholder="Search hospitals…"
                value={hospitalQuery}
                onChange={(e) => setHospitalQuery(e.target.value)}
                icon={
                  <Search className="size-4 text-text-tertiary" aria-hidden />
                }
                labelClassName="hidden"
                containerClassName="gap-0"
                aria-label="Search hospitals"
              />

              {filteredHospitals.length === 0 ? (
                <p className="rounded-lg border border-border bg-white px-4 py-6 text-center text-sm text-text-secondary dark:border-white/10 dark:bg-[#1a1a22]">
                  No hospitals match “{hospitalQuery.trim()}”.
                </p>
              ) : (
                <ul
                  className="max-h-72 overflow-y-auto rounded-xl border border-border bg-white dark:border-white/10 dark:bg-[#1a1a22]"
                  role="listbox"
                  aria-label="Hospitals"
                >
                  {filteredHospitals.map((h, index) => {
                    const selected = appointment.hospitalId === h.id;
                    return (
                      <li key={h.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() =>
                            handleAppointmentChange("hospitalId", h.id)
                          }
                          className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors ${
                            index > 0
                              ? "border-t border-[#F0EEEB] dark:border-white/10"
                              : ""
                          } ${
                            selected
                              ? "bg-[#FFF5F5] dark:bg-primary/15"
                              : "hover:bg-[#FAFAF9] dark:hover:bg-white/5"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-primary bg-primary"
                                : "border-[#D1D5DB] bg-transparent dark:border-white/30"
                            }`}
                            aria-hidden
                          >
                            {selected ? (
                              <span className="size-1.5 rounded-full bg-white" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-text-primary">
                              {h.name}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">
                              {h.address}
                            </span>
                          </span>
                          {h.distance ? (
                            <span className="shrink-0 rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary dark:bg-white/10">
                              {h.distance}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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
            <div className="col-span-1 mx-auto h-px max-h-95 w-full place-self-center self-center bg-[#DADADA] lg:h-full lg:w-px dark:bg-white/10" />
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
    </Layout>
  );
}

export default function ScheduleAppointmentPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="mt-6 flex min-h-50 items-center justify-center gap-2 text-sm text-text-secondary xl:mt-10">
            <BlivapLogo fill="#960018" className="size-17" />
          </div>
        </Layout>
      }
    >
      <ScheduleAppointmentPageContent />
    </Suspense>
  );
}
