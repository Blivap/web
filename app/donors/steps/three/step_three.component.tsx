"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export function StepThree({
  appointment,
  handleAppointmentChange,
  canConfirm,
  onConfirm,
  active,
}: StepThreeProps) {
  const [hospitalCarouselIndex, setHospitalCarouselIndex] = useState(0);
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

  return (
    active && (
      <form onSubmit={onConfirm} className="flex flex-col gap-6 mt-6 xl:mt-10">
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

        <h3 className="text-base font-semibold text-text-primary">
          Choose a location and time
        </h3>
        <p className="text-sm text-text-secondary -mt-2">
          Below you&apos;ll find the 5 locations closest to you. Select your
          favorite or search for a new location.
        </p>

        <div>
          <p className="text-sm font-semibold text-text-primary text-center mb-3">
            Select a Hospital
          </p>
          <div className="relative">
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
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(-${hospitalCarouselIndex * 100}%)`,
                }}
              >
                {MOCK_HOSPITALS.map((h) => (
                  <label
                    key={h.id}
                    className={`shrink-0 w-full min-w-0 px-2 sm:px-4 py-4 sm:py-6 rounded-lg border-2 cursor-pointer transition-colors block ${
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
            <div className="flex justify-center gap-1.5 mt-3">
              {MOCK_HOSPITALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHospitalCarouselIndex(i)}
                  aria-label={`Go to hospital ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${i === hospitalCarouselIndex ? "bg-primary" : "bg-border hover:bg-primary/50"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-text-primary text-center mb-4">
            Select date and time
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Choose a date
              </label>
              <div className="border border-border rounded-lg p-4 bg-white">
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
                    <ChevronLeft size={20} />
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
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <span key={d} className="text-xs text-text-tertiary py-1">
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
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Choose a time
              </label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAppointmentChange("time", t)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      appointment.time === t
                        ? "bg-primary text-white border-primary"
                        : "border-border text-text-primary hover:border-primary/50"
                    }`}
                  >
                    {t}
                  </button>
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
            <span>I agree to the terms and conditions.</span>
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
            <span>
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
