"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/layout/layout.component";
import { routes } from "@/config/routes";
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
import { $api } from "@/app/api";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";
import {
  parseMeetupCareQuote,
  type MeetupCareQuote,
} from "@/lib/donors/donorWelfarePreferences";
import { pickPaystackReferenceFromSearch } from "@/lib/wallet/parseWalletTopupResponse";
import {
  loadScheduleAppointmentDraft,
  saveScheduleAppointmentDraft,
} from "@/lib/schedule-appointment/scheduleAppointmentDraft";
import {
  MeetupCareBreakdown,
  careLinesFromQuote,
} from "./meetup-care-breakdown";
import { ScheduleAppointmentPaymentView } from "./schedule-appointment-payment.view";

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
  const [step, setStep] = useState<"details" | "payment">("details");
  const restoredDraft = useRef(false);
  const [careQuote, setCareQuote] = useState<MeetupCareQuote | null>(null);
  const [careState, setCareState] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [careError, setCareError] = useState<string | null>(null);
  const [careReload, setCareReload] = useState(0);
  const careLines = careLinesFromQuote(donorUserId ? (careQuote?.lines ?? []) : []);
  const careDueKobo = donorUserId ? (careQuote?.dueKobo ?? 0) : 0;
  const visibleCareState = !donorUserId
    ? "idle"
    : careState === "idle"
      ? "loading"
      : careState;
  const careReady = !donorUserId || visibleCareState === "ready";
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

  const hospitalSearch = hospitalQuery.trim();
  const filteredHospitals = useMemo(() => {
    const q = hospitalSearch.toLowerCase();
    if (!q) return [];
    return hospitals.filter((h) => {
      const haystack =
        `${h.name} ${h.address} ${h.distance ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [hospitals, hospitalSearch]);
  const selectedHospital = hospitals.find(
    (hospital) => hospital.id === appointment.hospitalId,
  );
  const selectionInInput =
    selectedHospital != null && hospitalSearch === selectedHospital.name;

  useEffect(() => {
    if (restoredDraft.current) return;
    restoredDraft.current = true;
    const draft = loadScheduleAppointmentDraft();
    if (!draft || draft.donorUserId !== donorUserId) return;
    const resume =
      new URLSearchParams(window.location.search).get("pay") === "1" ||
      pickPaystackReferenceFromSearch(
        new URLSearchParams(window.location.search),
      );
    if (!resume) return;
    handleAppointmentChange("hospitalId", draft.hospitalId);
    handleAppointmentChange("date", draft.date);
    handleAppointmentChange("time", draft.time);
    queueMicrotask(() => setStep("payment"));
  }, [donorUserId, handleAppointmentChange]);

  useEffect(() => {
    if (!donorUserId) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setCareState("loading");
      setCareError(null);
      try {
        const res = await $api.bookings.meetupCareQuote({
          donorId: donorUserId,
        });
        if (cancelled) return;
        if (res.status < 200 || res.status >= 300) {
          setCareQuote(null);
          setCareState("error");
          setCareError(res.error ?? res.message ?? "Could not load meetup care");
          return;
        }
        const quote = parseMeetupCareQuote(res.data ?? res);
        if (!quote) {
          setCareQuote(null);
          setCareState("error");
          setCareError("Could not load meetup care");
          return;
        }
        setCareQuote(quote);
        setCareState("ready");
      } catch (err) {
        if (cancelled) return;
        setCareQuote(null);
        setCareState("error");
        setCareError(getAxiosErrorMessage(err, "Could not load meetup care"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [donorUserId, careReload]);

  const continueToPayment = () => {
    if (!canConfirmAppointment) return;
    saveScheduleAppointmentDraft({
      donorUserId,
      hospitalId: appointment.hospitalId,
      date: appointment.date,
      time: appointment.time,
    });
    setStep("payment");
  };

  return (
    <Layout>
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          if (!careReady) {
            event.preventDefault();
            return;
          }
          if (careDueKobo > 0 && step === "details") {
            event.preventDefault();
            continueToPayment();
            return;
          }
          void handleSubmit(event);
        }}
      >
        <Link
          href={
            donorUserId ? routes.donorsDetail(donorUserId) : routes.donors
          }
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
        <header className="flex items-center gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Schedule appointment
          </h1>
          <InfoHint
            title="About this screening"
            label="Screening information"
            className="size-7"
          >
            <p>
              Your first visit includes screening for the donation you booked.
              Please allow about one hour on site.
            </p>
            <p>
              If the nearest facility is full, book another location here. You
              can mention a preferred place during screening.
            </p>
            <p>
              Choose a hospital, then pick a date and time. You can adjust your
              choices before you confirm.
            </p>
          </InfoHint>
        </header>

        {!donorUserId ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-100">
            Open this page from a donor profile using &quot;Schedule
            appointment&quot; so we know which donor to invite.
          </div>
        ) : null}

        {step === "details" ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-text-primary">
                Hospital
              </h3>
              <InfoHint
                title="Hospital choice"
                label="Hospital selection information"
                className="size-7"
              >
                <p>
                  Your selected hospital is used for the inspection appointment.
                  Search by name, city, or address.
                </p>
              </InfoHint>
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
                {selectionInInput && selectedHospital ? (
                  <div className="flex min-h-11 w-full items-center gap-2 rounded-md border border-[#66666659] bg-white px-3 py-2 dark:border-white/12 dark:bg-[#111827]">
                    <Search
                      className="size-4 shrink-0 text-text-tertiary"
                      aria-hidden
                    />
                    <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md border border-[#E5E7EB] bg-[#F4F4F5] py-1 pr-1 pl-2.5 text-sm font-medium text-[#100F14] dark:border-white/10 dark:bg-white/10 dark:text-white">
                      <span className="truncate">{selectedHospital.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${selectedHospital.name}`}
                        onClick={() => {
                          handleAppointmentChange("hospitalId", "");
                          setHospitalQuery("");
                        }}
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-[#6B7280] hover:bg-white hover:text-[#111827] dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <X className="size-3.5" strokeWidth={2} aria-hidden />
                      </button>
                    </span>
                  </div>
                ) : (
                  <Input
                    name="hospitalSearch"
                    placeholder="Search hospitals…"
                    value={hospitalQuery}
                    onChange={(e) => {
                      const next = e.target.value;
                      setHospitalQuery(next);
                      if (
                        selectedHospital &&
                        next.trim() !== selectedHospital.name
                      ) {
                        handleAppointmentChange("hospitalId", "");
                      }
                    }}
                    icon={
                      <Search
                        className="size-4 text-text-tertiary"
                        aria-hidden
                      />
                    }
                    labelClassName="hidden"
                    containerClassName="gap-0"
                    aria-label="Search hospitals"
                  />
                )}

                {hospitalSearch.length === 0 ||
                selectionInInput ? null : filteredHospitals.length === 0 ? (
                  <p className="rounded-lg border border-border bg-white px-4 py-6 text-center text-sm text-text-secondary dark:border-white/10 dark:bg-[#1a1a22]">
                    No hospitals match “{hospitalSearch}”.
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
                            onClick={() => {
                              handleAppointmentChange("hospitalId", h.id);
                              setHospitalQuery(h.name);
                            }}
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
          </section>
        ) : null}

        {step === "payment" ? (
          <ScheduleAppointmentPaymentView
            hospitalName={selectedHospital?.name ?? "Selected hospital"}
            dateLabel={appointment.date}
            time={appointment.time}
            lines={careLines.filter(
              (line) => line.payer === "you" && line.amountKobo > 0,
            )}
            totalKobo={careDueKobo}
            scheduling={isSendingBooking}
            onBack={() => setStep("details")}
            onPay={() => void handleSubmit()}
            onBeforeRedirect={() =>
              saveScheduleAppointmentDraft({
                donorUserId,
                hospitalId: appointment.hospitalId,
                date: appointment.date,
                time: appointment.time,
              })
            }
          />
        ) : (
          <>
            <MeetupCareBreakdown
              lines={careLines}
              loading={visibleCareState === "loading"}
              error={visibleCareState === "error" ? careError : null}
              onRetry={() => setCareReload((value) => value + 1)}
            />

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
                              !isPast &&
                              handleAppointmentChange("date", dateStr)
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
              disabled={!canConfirmAppointment || isSendingBooking || !careReady}
              loading={isSendingBooking}
              className="w-fit px-5 py-2.5 text-sm font-medium"
            >
              {careDueKobo > 0 ? "Continue" : "Confirm"}
            </Button>
          </>
        )}
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
