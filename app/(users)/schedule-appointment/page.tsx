"use client";
import { Layout } from "@/layout/layout.component";
import { BookingRequestSentModal } from "@/components/ui/modal/booking-request-sent-modal.component";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { $api } from "@/app/api";
import { parseHospitalsListResponse } from "@/lib/hospitals/parseHospitalsListResponse";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import type { HospitalListItem } from "@/lib/hospitals/parseHospitalsListResponse";

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

function ScheduleAppointmentPageContent() {
  const searchParams = useSearchParams();
  const donorUserId = searchParams.get("donorId")?.trim() ?? "";
  const bloodRequestId = searchParams.get("bloodRequestId")?.trim() ?? "";

  const [hospitals, setHospitals] = useState<HospitalListItem[]>([]);
  const [hospitalsLoadState, setHospitalsLoadState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);

  const [hospitalCarouselIndex, setHospitalCarouselIndex] = useState(0);
  const hospitalCarouselRef = useRef<HTMLDivElement | null>(null);
  const [bookingRequestSentOpen, setBookingRequestSentOpen] = useState(false);
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
      setHospitalCarouselIndex(0);
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

  // Keep the selected hospital card smoothly in view when index changes
  // by scrolling the carousel container itself. Users can still scroll it
  // with mouse or touch; this just recenters on button/index changes.
  useEffect(() => {
    const container = hospitalCarouselRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLLabelElement>("label");
    if (!items.length) return;

    const maxIndex = items.length - 1;
    const clampedIndex = Math.max(0, Math.min(hospitalCarouselIndex, maxIndex));
    const current = items[clampedIndex];
    if (!current) return;

    const containerWidth = container.clientWidth;
    const itemWidth = current.clientWidth;
    const itemLeft = current.offsetLeft;

    const targetScrollLeft =
      itemLeft - Math.max(0, (containerWidth - itemWidth) / 2);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, [hospitalCarouselIndex, hospitals.length]);

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

      const { status } = await $api.bookings.create(payload);
      if (status < 200 || status >= 300) {
        setSubmitError("Could not create the booking. Please try again.");
        return;
      }
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
        <h2 className="text-lg font-semibold text-text-primary">
          Schedule your inspection appointment
        </h2>
        <p className="text-sm text-text-secondary -mt-2">
          During your first visit we will take a blood sample for testing and
          blood typing. Plan about one hour for this screening appointment.
        </p>
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Tip:</span> If the
          nearest blood bank is full, you can schedule a screening at a
          different location. You can indicate your preferred blood bank during
          the screening.
        </p>
        <p className="text-sm text-text-primary">
          <span className="font-semibold "> Choose a location and time</span>
          <br />
          Below you&apos;ll find locations you can book. Select your favorite.
        </p>

        {!donorUserId ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-100">
            Open this page from a donor profile using &quot;Schedule
            appointment&quot; so we know which donor to invite.
          </div>
        ) : null}

        <div className="flex flex-col flex-1 gap-4 p-4 py-6 bg-[#F7F5F3]">
          <p className="text-sm font-semibold text-text-primary text-center mb-3">
            Select a Hospital
          </p>
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
            <div className="relative w-full ">
              <button
                type="button"
                onClick={() =>
                  setHospitalCarouselIndex((i) => Math.max(0, i - 1))
                }
                disabled={hospitalCarouselIndex === 0}
                aria-label="Previous hospital"
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md text-text-primary hover:bg-[#F9FAFB] disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/6"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setHospitalCarouselIndex((i) =>
                    Math.min(hospitals.length - 1, i + 1),
                  )
                }
                disabled={hospitalCarouselIndex === hospitals.length - 1}
                aria-label="Next hospital"
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md text-text-primary hover:bg-[#F9FAFB] disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/6"
              >
                {" "}
                <ChevronRight size={20} />
              </button>
              <div
                ref={hospitalCarouselRef}
                className="relative w-full overflow-x-auto no-scrollbar"
              >
                <div className="flex gap-4">
                  {hospitals.map((h) => (
                    <label
                      key={h.id}
                      className={`shrink-0 w-full max-w-[178px] min-w-0 px-2 sm:px-4 py-4 sm:py-6 rounded-lg border-2 cursor-pointer transition-colors block  ${
                        appointment.hospitalId === h.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-white hover:border-primary/50 dark:border-white/10 dark:bg-[#1a1a22]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-text-secondary">
                          {h.distance ?? "—"}
                        </span>
                        <input
                          type="radio"
                          name="hospital"
                          value={h.id}
                          checked={appointment.hospitalId === h.id}
                          onChange={() => {
                            handleAppointmentChange("hospitalId", h.id);
                            setHospitalCarouselIndex(
                              hospitals.findIndex((x) => x.id === h.id),
                            );
                          }}
                          className="sr-only"
                        />
                        <span
                          className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            appointment.hospitalId === h.id
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {appointment.hospitalId === h.id && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary mt-2">
                        {h.name}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {h.address}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            </div>
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
                    {row.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleAppointmentChange("time", t)}
                        className={`rounded-lg border px-3 py-2 text-xs shadow-[0px_0px_4px_#00000026] transition-colors dark:shadow-[0px_0px_8px_rgba(0,0,0,0.4)] ${
                          appointment.time === t
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-white text-text-primary hover:border-primary/50 dark:border-white/10 dark:bg-[#1a1a22]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
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
