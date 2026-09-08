"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { $api } from "@/app/api";
import { parseHospitalsListResponse } from "@/lib/hospitals/parseHospitalsListResponse";
import type { HospitalListItem } from "@/lib/hospitals/parseHospitalsListResponse";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import {
  buildCalendarDays,
  buildScheduledAtIso,
  formatBookingSuccessScheduledLabel,
  formatCalendarMonthLabel,
  isBookingSlotInPast,
  type ScheduleAppointmentDetails,
} from "@/lib/schedule-appointment/scheduleAppointment.utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadSentBookings } from "@/store/slices/bookingsSlice";
import type { CarouselApi } from "@/components/ui/carousel";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";

export type { ScheduleAppointmentDetails } from "@/lib/schedule-appointment/scheduleAppointment.utils";

const emptyAppointment = (): ScheduleAppointmentDetails => ({
  hospitalId: "",
  date: "",
  time: "",
  agreeTerms: false,
  agreePrivacy: false,
});

export function useScheduleAppointment() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { showSnackbar } = useSnackbar();

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
  const [appointment, setAppointment] =
    useState<ScheduleAppointmentDetails>(emptyAppointment);
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

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth.year, calendarMonth.month),
    [calendarMonth],
  );

  const monthLabel = useMemo(
    () => formatCalendarMonthLabel(calendarMonth.year, calendarMonth.month),
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

  const handleAppointmentChange = useCallback(
    <K extends keyof ScheduleAppointmentDetails>(
      field: K,
      value: ScheduleAppointmentDetails[K],
    ) => {
      setAppointment((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const goToPreviousMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  const canConfirmAppointment = Boolean(
    donorUserId &&
    appointment.hospitalId &&
    appointment.date &&
    appointment.time,
  );

  const closeBookingRequestSentModal = useCallback(() => {
    setBookingRequestSentOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canConfirmAppointment || isSendingBooking) return;
      if (isBookingSlotInPast(appointment.date, appointment.time)) {
        showSnackbar("That time has already passed.", "error");
        return;
      }
      if (user?.nationalIdentificationNumberVerified !== true) {
        showSnackbar("Verify your ID before booking.", "error");
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
        setBookingSuccessSummary({
          scheduledLabel: formatBookingSuccessScheduledLabel(
            appointment.date,
            appointment.time,
          ),
          hospitalName: hospital?.name?.trim() ?? "Selected hospital",
        });
        setBookingRequestSentOpen(true);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const st = err.response?.status;
          if (st === 404) {
            showSnackbar(
              getAxiosErrorMessage(
                err,
                "Hospital not found. Pick another location.",
              ),
            );
            return;
          }
          if (st === 409) {
            showSnackbar(
              getAxiosErrorMessage(
                err,
                "The donor already has a booking in this time window.",
              ),
              "error",
            );
            return;
          }
          if (st === 400) {
            showSnackbar("Donor is on cooldown.", "error");
            return;
          }
        }
        showSnackbar(
          getAxiosErrorMessage(
            err,
            "Could not create the booking. Please try again.",
          ),
          "error",
        );
      } finally {
        setIsSendingBooking(false);
      }
    },
    [
      appointment.date,
      appointment.hospitalId,
      appointment.time,
      bloodRequestId,
      canConfirmAppointment,
      dispatch,
      donorUserId,
      hospitals,
      isSendingBooking,
      showSnackbar,
      user?.nationalIdentificationNumberVerified,
    ],
  );

  return {
    donorUserId,
    hospitals,
    hospitalsLoadState,
    hospitalsError,
    loadHospitals,
    carouselApi,
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
    submitError,
    handleSubmit,
    bookingRequestSentOpen,
    closeBookingRequestSentModal,
    bookingSuccessSummary,
  };
}
