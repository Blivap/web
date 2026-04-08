"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import type { DonorQuestionnaireResult } from "@/types/donors";

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
  /** Set after POST /donors/questionnaire succeeds. */
  eligibility?: DonorQuestionnaireResult | null;
}

const MOCK_HOSPITALS = [
  {
    id: "1",
    name: "Lagos Blood Bank",
    address: "Ikeja GRA, Lagos",
    distance: "5 km",
  },
  {
    id: "2",
    name: "Red Cross Donor Centre",
    address: "Victoria Island, Lagos",
    distance: "12 km",
  },
  {
    id: "3",
    name: "National Blood Service",
    address: "Yaba, Lagos",
    distance: "15 km",
  },
  {
    id: "4",
    name: "Abuja Central Blood Bank",
    address: "Garki, Abuja",
    distance: "18 km",
  },
  {
    id: "5",
    name: "Port Harcourt Donor Centre",
    address: "GRA, Port Harcourt",
    distance: "22 km",
  },
];

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

function EligibilityBanner({
  eligibility,
}: {
  eligibility: DonorQuestionnaireResult;
}) {
  const status = eligibility.eligibilityStatus ?? "";
  const isDonorRole = status === "eligible" || status === "pending_review";
  const isIneligible = status === "ineligible";

  if (isDonorRole) {
    return (
      <div className="border-l-4 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-500 flex gap-3 p-4 rounded-r-lg">
        <Info
          className="shrink-0 text-emerald-700 dark:text-emerald-400"
          size={18}
        />
        <div className="text-sm text-emerald-900 dark:text-emerald-100">
          <p className="font-semibold">Donor status</p>
          <p className="mt-1 text-xs opacity-90">
            Your eligibility is <strong>{status}</strong>. When this is{" "}
            <strong>eligible</strong> or <strong>pending_review</strong>, your
            account receives the <strong>donor</strong> role for matching. You
            can complete identity verification and bookings separately if
            required.
          </p>
        </div>
      </div>
    );
  }

  if (isIneligible) {
    return (
      <div className="border-l-4 border-amber-600 bg-amber-50 dark:bg-amber-950/35 dark:border-amber-500 flex gap-3 p-4 rounded-r-lg">
        <Info
          className="shrink-0 text-amber-800 dark:text-amber-400"
          size={18}
        />
        <div className="text-sm text-amber-950 dark:text-amber-100">
          <p className="font-semibold">Not eligible at this time</p>
          {eligibility.ineligibilityReasons &&
            eligibility.ineligibilityReasons.length > 0 && (
              <ul className="mt-2 list-disc pl-4 text-xs space-y-1">
                {eligibility.ineligibilityReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          <p className="mt-2 text-xs">
            The <strong>donor</strong> role is not added while you are marked
            ineligible. Your answers are kept on file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-4 border-[#960018] bg-[#FFE2E2] dark:bg-red-950/25 flex gap-3 p-4 rounded-r-lg">
      <Info className="shrink-0 text-primary" size={18} />
      <div className="text-sm text-[#5A403F] dark:text-red-100/90">
        <p className="font-semibold">Eligibility: {status || "Pending"}</p>
        <p className="mt-1 text-xs">
          Follow any instructions from the platform. Additional checks (such as
          identity verification) may still be required.
        </p>
      </div>
    </div>
  );
}

export function StepThree({
  appointment,
  handleAppointmentChange,
  canConfirm,
  onConfirm,
  active,
  eligibility = null,
}: StepThreeProps) {
  const [hospitalCarouselIndex, setHospitalCarouselIndex] = useState(0);
  const hospitalCarouselRef = useRef<HTMLDivElement | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

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
  }, [hospitalCarouselIndex]);

  return (
    active && (
      <form
        onSubmit={onConfirm}
        className="flex flex-col gap-6 mt-6 xl:mt-10 overflow-hidden"
      >
        {eligibility &&
          (eligibility.eligibilityStatus != null ||
            (eligibility.ineligibilityReasons?.length ?? 0) > 0) && (
            <EligibilityBanner eligibility={eligibility} />
          )}

        <h2 className="text-lg font-semibold text-text-primary">
          Schedule your inspection appointment
        </h2>
        <p className="text-sm text-text-secondary -mt-2">
          Booking a screening is separate from donor registration. During your
          first visit we may take a blood sample for testing and typing. Plan
          about one hour for this screening appointment.
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
          Below you&apos;ll find the 5 locations closest to you. Select your
          favorite or search for a new location.
        </p>

        <div className="flex flex-col flex-1 gap-4 p-4 py-6 bg-[#F7F5F3]">
          <p className="text-sm font-semibold text-text-primary text-center mb-3">
            Select a Hospital
          </p>
          <div className="relative w-full ">
            <button
              type="button"
              onClick={() =>
                setHospitalCarouselIndex((i) => Math.max(0, i - 1))
              }
              disabled={hospitalCarouselIndex === 0}
              aria-label="Previous hospital"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-text-primary hover:bg-[#F9FAFB] disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() =>
                setHospitalCarouselIndex((i) =>
                  Math.min(MOCK_HOSPITALS.length - 1, i + 1),
                )
              }
              disabled={hospitalCarouselIndex === MOCK_HOSPITALS.length - 1}
              aria-label="Next hospital"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-text-primary hover:bg-[#F9FAFB] disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={20} />
            </button>
            <div
              ref={hospitalCarouselRef}
              className="relative w-full overflow-x-auto no-scrollbar"
            >
              <div className="flex gap-4">
                {MOCK_HOSPITALS.map((h) => (
                  <label
                    key={h.id}
                    className={`shrink-0 w-full max-w-[178px] min-w-0 px-2 sm:px-4 py-4 sm:py-6 rounded-lg border-2 cursor-pointer transition-colors block  ${
                      appointment.hospitalId === h.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-white hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-text-secondary">
                        {h.distance}
                      </span>
                      <input
                        type="radio"
                        name="hospital"
                        value={h.id}
                        checked={appointment.hospitalId === h.id}
                        onChange={() => {
                          handleAppointmentChange("hospitalId", h.id);
                          setHospitalCarouselIndex(
                            MOCK_HOSPITALS.findIndex((x) => x.id === h.id),
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
        </div>

        <div>
          <p className="text-sm font-semibold text-text-primary text-center mb-4">
            Select date and time
          </p>
          <div className="grid grid-cols-1 justify-center content-center place-content-center lg:grid-cols-7 gap-6 border border-[#DADADA] px-10 py-15">
            <div className="col-span-3 flex flex-col gap-8 items-center w-full">
              <label className="block text-xs font-medium text-text-primary mb-2 bg-[#FFE2E2] rounded-[50px] px-5 py-2">
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
                    className="p-1 rounded hover:bg-[#F3F4F6] text-text-primary"
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
                    className="p-1 rounded hover:bg-[#F3F4F6] text-text-primary"
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
                        className="text-[8px] font-semibold text-black  py-1"
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
            <div className="col-span-1 h-px w-full place-self-center lg:h-full max-h-[380px] lg:w-px  bg-[#DADADA] self-center mx-auto" />
            <div className="col-span-3  flex flex-col gap-8 items-center w-full">
              <label className="block text-xs font-medium text-text-primary mb-2 bg-[#FFE2E2] rounded-[50px] px-5 py-2">
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
                        className={`px-3 py-2 text-xs rounded-lg shadow-[0px_0px_4px_#00000026] transition-colors ${
                          appointment.time === t
                            ? "bg-primary text-white border-primary"
                            : "border-border text-text-primary hover:border-primary/50"
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

        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-3 cursor-pointer text-sm text-text-primary">
            <input
              type="checkbox"
              checked={appointment.agreeTerms}
              onChange={(e) =>
                handleAppointmentChange("agreeTerms", e.target.checked)
              }
              className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <span className="text-xs">
              I agree to the terms and conditions.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer text-sm text-text-primary">
            <input
              type="checkbox"
              checked={appointment.agreePrivacy}
              onChange={(e) =>
                handleAppointmentChange("agreePrivacy", e.target.checked)
              }
              className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <span className="text-xs">
              Yes, I give Blivap permission to process and use my data as stated
              in the{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                privacy statement
              </Link>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canConfirm}
          className="text-sm font-medium py-2.5 px-5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors w-fit"
        >
          Confirm
        </button>
      </form>
    )
  );
}
