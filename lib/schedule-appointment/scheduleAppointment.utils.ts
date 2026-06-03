import {
  SCHEDULE_APPOINTMENT_DIAMOND_ROW_SIZES,
} from "./scheduleAppointment.constants";

export type ScheduleAppointmentDetails = {
  hospitalId: string;
  date: string;
  time: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
};

export function getScheduleAppointmentDiamondRows<T>(
  items: readonly T[],
): T[][] {
  const rows: T[][] = [];
  let i = 0;
  for (const size of SCHEDULE_APPOINTMENT_DIAMOND_ROW_SIZES) {
    if (i >= items.length) break;
    rows.push(items.slice(i, i + size));
    i += size;
  }
  if (i < items.length) rows.push(items.slice(i));
  return rows;
}

export function buildScheduledAtIso(date: string, time: string): string {
  const d = new Date(`${date}T${time}:00`);
  return d.toISOString();
}

export function isBookingSlotInPast(dateStr: string, timeStr: string): boolean {
  if (!dateStr || !timeStr) return false;
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

export function isCalendarDayInPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
}

export function buildCalendarDays(year: number, month: number): (number | null)[] {
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
}

export function formatCalendarMonthLabel(year: number, month: number): string {
  return new Date(year, month).toLocaleString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatBookingSuccessScheduledLabel(
  date: string,
  time: string,
): string {
  const scheduledDate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(scheduledDate.getTime())) {
    return `${date} · ${time}`;
  }
  return scheduledDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
