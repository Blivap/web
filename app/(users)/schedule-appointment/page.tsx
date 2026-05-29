"use client";
import { Layout } from "@/layout/layout.component";
import { BookingRequestSentModal } from "@/components/ui/modal/booking-request-sent-modal.component";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  MapPin,
} from "lucide-react";
import { $api } from "@/app/api";
import { parseHospitalsListResponse } from "@/lib/hospitals/parseHospitalsListResponse";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import type { HospitalListItem } from "@/lib/hospitals/parseHospitalsListResponse";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadSentBookings } from "@/store/slices/bookingsSlice";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export interface AppointmentDetails {
  hospitalId: string;
  date: string;
  time: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

export interface StepThreeProps {
  appointment: AppointmentDetails;
  handleAppointmentChange: <K extends keyof AppointmentDetails>(
    field: K,
    value: AppointmentDetails[K],
  ) => void;
  canConfirm: boolean;
  onConfirm: (e: React.FormEvent) => void;
  active: boolean;
}

const TIME_SLOTS = [
  "08:00",
  "08:20",
  "08:40",
  "09:00",
  "09:20",
  "09:40",
  "10:00",
  "10:20",
  "10:40",
  "11:00",
  "11:20",
  "11:40",
  "12:00",
  "12:20",
  "13:00",
  "13:20",
  "13:40",
  "14:00",
  "14:20",
  "14:40",
  "15:00",
  "15:20",
];

// Single diamond: rows 1, 2, 3, 4, 5, 4, 3, 1 (total 22)
const DIAMOND_ROW_SIZES = [1, 2, 3, 4, 5, 4, 3, 1];

function getDiamondRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  let i = 0;
  for (const size of DIAMOND_ROW_SIZES) {
    if (i >= items.length) break;
    rows.push(items.slice(i, i + size));
    i += size;
  }
  if (i < items.length) rows.push(items.slice(i));
  return rows;
}

function buildScheduledAtIso(date: string, time: string): string {
  // Local wall time (no timezone suffix) parses as local in JS; emit UTC ISO for the API.
  const d = new Date(`${date}T${time}:00`);
  return d.toISOString();
}

/** True when the local wall slot (date + time) is strictly before now. */
function isBookingSlotInPast(dateStr: string, timeStr: string): boolean {
  if (!dateStr || !timeStr) return false;
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

function ScheduleAppointmentPageContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const donorUserId = searchParams.get("donorId")?.trim() ?? "";
  const bloodRequestId = searchParams.get("bloodRequestId")?.trim() ?? "";

  const [hospitals, setHospitals] = useState<HospitalListItem[]>([]);
  const [hospitalsLoadState, setHospitalsLoadState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [bookingRequestSentOpen, setBookingRequestSentOpen] = useState(false);
  const [bookingSuccessSummary, setBookingSuccessSummary] = useState<{
    scheduledLabel: string;
    hospitalName: string;
  } | null>(null);
  const [isSendingBooking, setIsSendingBooking] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentDetails>({
    hospitalId: "",
    date: "",
    time: "",
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const loadHospitals = useCallback(async () => {
    setHospitalsLoadState("loading");
    setHospitalsError(null);
    try {
      const { data, status } = await $api.hospitals.list();
      if (status < 200 || status >= 300 || data === undefined) {
        setHospitals([]);
        setHospitalsLoadState("error");
        setHospitalsError("Could not load hospitals. Please try again.");
        return;
      }
      const parsed = parseHospitalsListResponse(data);
      setHospitals(parsed);
      setHospitalsLoadState("ok");
      setAppointment((prev) => ({ ...prev, hospitalId: "" }));
    } catch (e) {
      setHospitals([]);
      setHospitalsLoadState("error");
      setHospitalsError(
        getAxiosErrorMessage(e, "Could not load hospitals. Please try again."),
      );
    }
  }, []);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = last.getDate();
    const total = startPad + daysInMonth;
    const rows = Math.ceil(total / 7);
    const days: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length < rows * 7) days.push(null);
    return days;
  }, [calendarMonth]);

  const monthLabel = useMemo(
    () =>
      new Date(calendarMonth.year, calendarMonth.month).toLocaleString(
        "en-NG",
        { month: "long", year: "numeric" },
      ),
    [calendarMonth],
  );

  useEffect(() => {
    if (!carouselApi) return;
    if (!appointment.hospitalId) {
      carouselApi.scrollTo(0);
      return;
    }
    const idx = hospitals.findIndex((h) => h.id === appointment.hospitalId);
    if (idx >= 0) carouselApi.scrollTo(idx);
  }, [carouselApi, appointment.hospitalId, hospitals]);

  useEffect(() => {
    setAppointment((prev) => {
      if (!prev.date || !prev.time) return prev;
      if (!isBookingSlotInPast(prev.date, prev.time)) return prev;
      return { ...prev, time: "" };
    });
  }, [appointment.date]);

  const handleAppointmentChange = <K extends keyof AppointmentDetails>(
    field: K,
    value: AppointmentDetails[K],
  ) => {
    setAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const canConfirmAppointment = Boolean(
    donorUserId &&
    appointment.hospitalId &&
    appointment.date &&
    appointment.time,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirmAppointment || isSendingBooking) return;
    if (isBookingSlotInPast(appointment.date, appointment.time)) {
      setSubmitError("That time has already passed. Pick another slot.");
      return;
    }
    if (user?.nationalIdentificationNumberVerified !== true) {
      setSubmitError(
        "Verify your National Identification Number before creating a booking.",
      );
      return;
    }
    setSubmitError(null);
    setIsSendingBooking(true);
    try {
      const scheduledAt = buildScheduledAtIso(
        appointment.date,
        appointment.time,
      );
      const payload: {
        donorUserId: string;
        hospitalId: string;
        scheduledAt: string;
        bloodRequestId?: string;
      } = {
        donorUserId,
        hospitalId: appointment.hospitalId,
        scheduledAt,
      };
      if (bloodRequestId) payload.bloodRequestId = bloodRequestId;

      const { status, data } = await $api.bookings.request(payload);
      if (status < 200 || status >= 300) {
        setSubmitError(
          getApiMessageFromData(data) ??
            "Could not create the booking. Please try again.",
        );
        return;
      }
      void dispatch(loadSentBookings({ silent: true }));
      const hospital = hospitals.find((h) => h.id === appointment.hospitalId);
      const scheduledDate = new Date(
        `${appointment.date}T${appointment.time}:00`,
      );
      const scheduledLabel = Number.isNaN(scheduledDate.getTime())
        ? `${appointment.date} · ${appointment.time}`
        : scheduledDate.toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
      setBookingSuccessSummary({
        scheduledLabel,
        hospitalName: hospital?.name?.trim() ?? "Selected hospital",
      });
      setBookingRequestSentOpen(true);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const st = e.response?.status;
        if (st === 404) {
          setSubmitError(
            getAxiosErrorMessage(
              e,
              "Hospital not found. Pick another location.",
            ),
          );
          return;
        }
        if (st === 409) {
          setSubmitError(
            getAxiosErrorMessage(
              e,
              "The donor already has a booking in this time window.",
            ),
          );
          return;
        }
      }
      setSubmitError(
        getAxiosErrorMessage(
          e,
          "Could not create the booking. Please try again.",
        ),
      );
    } finally {
      setIsSendingBooking(false);
    }
  };

  return (
    <Layout>
      <form
        className="flex flex-col gap-6 mt-6 xl:mt-10 overflow-hidden"
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

        <div className="flex flex-col flex-1 gap-4 rounded-2xl border border-border bg-gradient-to-b from-[#FAFAF9] via-[#F7F5F3] to-[#F0EEEB] p-5 shadow-sm dark:from-[#18181f] dark:via-[#14141a] dark:to-[#101014] dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
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
              <button
                type="button"
                onClick={() => void loadHospitals()}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Try again
              </button>
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
                      className="pl-3 md:pl-4 basis-[min(100%,280px)] sm:basis-[248px] lg:basis-[260px]"
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
          <p className="text-sm font-semibold text-text-primary text-center mb-4">
            Select date and time
          </p>
          <div className="grid grid-cols-1 place-content-center justify-center gap-6 border border-[#DADADA] px-10 py-15 content-center lg:grid-cols-7 dark:border-white/10">
            <div className="col-span-3 flex flex-col gap-8 items-center w-full">
              <label className="mb-2 block rounded-[50px] bg-[#FFE2E2] px-5 py-2 text-xs font-medium text-text-primary dark:bg-primary/20">
                Choose a date
              </label>
              <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth((prev) => {
                        const d = new Date(prev.year, prev.month - 1);
                        return { year: d.getFullYear(), month: d.getMonth() };
                      })
                    }
                    className="rounded p-1 text-text-primary hover:bg-[#F3F4F6] dark:hover:bg-white/10"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} strokeWidth={0.8} />
                  </button>
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth((prev) => {
                        const d = new Date(prev.year, prev.month + 1);
                        return { year: d.getFullYear(), month: d.getMonth() };
                      })
                    }
                    className="rounded p-1 text-text-primary hover:bg-[#F3F4F6] dark:hover:bg-white/10"
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} strokeWidth={0.8} />
                  </button>
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
                    const dateStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSelected = appointment.date === dateStr;
                    const isPast =
                      new Date(dateStr) <
                      new Date(new Date().setHours(0, 0, 0, 0));
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() =>
                          !isPast && handleAppointmentChange("date", dateStr)
                        }
                        disabled={isPast}
                        className={`py-1.5 text-sm rounded ${isSelected ? "bg-primary text-white font-medium" : isPast ? "text-text-tertiary cursor-not-allowed" : "text-text-primary hover:bg-primary/10"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="col-span-1 mx-auto h-px max-h-[380px] w-full place-self-center self-center bg-[#DADADA] lg:h-full lg:w-px dark:bg-white/10" />
            <div className="col-span-3  flex flex-col gap-8 items-center w-full">
              <label className="mb-2 block rounded-[50px] bg-[#FFE2E2] px-5 py-2 text-xs font-medium text-text-primary dark:bg-primary/20">
                Choose a time
              </label>
              <div className="flex flex-col items-center gap-2">
                {getDiamondRows(TIME_SLOTS).map((row, rowIndex) => (
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

        {submitError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canConfirmAppointment || isSendingBooking}
          className="text-sm font-medium py-2.5 px-5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors w-fit"
        >
          {isSendingBooking ? "Sending…" : "Confirm"}
        </button>
      </form>

      <BookingRequestSentModal
        open={bookingRequestSentOpen}
        onClose={() => setBookingRequestSentOpen(false)}
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
            <Loader2 className="size-5 animate-spin text-primary" />
            Loading…
          </div>
        </Layout>
      }
    >
      <ScheduleAppointmentPageContent />
    </Suspense>
  );
}
