const STORAGE_KEY = "blivap:schedule-appointment-draft";

export type ScheduleAppointmentDraft = {
  donorUserId: string;
  hospitalId: string;
  date: string;
  time: string;
};

export function saveScheduleAppointmentDraft(
  draft: ScheduleAppointmentDraft,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadScheduleAppointmentDraft(): ScheduleAppointmentDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ScheduleAppointmentDraft>;
    if (
      typeof parsed.donorUserId !== "string" ||
      typeof parsed.hospitalId !== "string" ||
      typeof parsed.date !== "string" ||
      typeof parsed.time !== "string"
    ) {
      return null;
    }
    if (!parsed.donorUserId || !parsed.hospitalId || !parsed.date || !parsed.time) {
      return null;
    }
    return {
      donorUserId: parsed.donorUserId,
      hospitalId: parsed.hospitalId,
      date: parsed.date,
      time: parsed.time,
    };
  } catch {
    return null;
  }
}

export function clearScheduleAppointmentDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
