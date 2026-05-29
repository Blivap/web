"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { $api } from "@/app/api";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import {
  meetupReadOnly,
  meetupUserIsRequester,
  meetupVerificationGateSatisfied,
} from "@/lib/meetups/meetupSessionDerived";
import { parseMeetupSessionBody } from "@/lib/meetups/parseMeetupResponses";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import type { MeetupReportPayload, MeetupSession } from "@/types/meetups";

const POLL_MS = 5000;

function statusFromAxios(e: unknown): number | undefined {
  if (!axios.isAxiosError(e)) return undefined;
  return e.response?.status;
}

export function useMeetupSession(sessionId: string | undefined) {
  const { showSnackbar } = useSnackbar();
  const [session, setSession] = useState<MeetupSession | null>(null);
  const [sessionLoad, setSessionLoad] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [verifyBusy, setVerifyBusy] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [terminateBusy, setTerminateBusy] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshSession = useCallback(async () => {
    if (!sessionId) return null;
    setSessionError(null);
    const { status, data } = await $api.meetups.getSession(sessionId);
    if (status < 200 || status >= 300) {
      setSession(null);
      setSessionLoad("error");
      setSessionError(
        getApiMessageFromData(data) ?? "Could not load this meetup session.",
      );
      return null;
    }
    const parsed = parseMeetupSessionBody(data);
    if (!parsed) {
      setSession(null);
      setSessionLoad("error");
      setSessionError("Unexpected response from the server.");
      return null;
    }
    setSession(parsed);
    setSessionLoad("ok");
    return parsed;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    setSessionLoad("loading");
    void refreshSession();
  }, [sessionId, refreshSession]);

  useEffect(() => {
    if (!sessionId || !session) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (meetupReadOnly(session)) return;
    pollRef.current = setInterval(() => {
      void refreshSession();
    }, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset poll only when `session.status` changes, not every session poll payload
  }, [sessionId, session?.status, refreshSession]);

  const verifyCode = useCallback(
    async (code: string) => {
      const fail = (message: string) => {
        showSnackbar("Unable to verify code. Try again.", "error");
        return { ok: false as const, message };
      };

      if (!sessionId) return fail("Missing session.");
      setVerifyBusy(true);
      try {
        const { status, data } = await $api.meetups.verifyCode(sessionId, code);
        if (status === 429) {
          return fail("Too many attempts. Try again later.");
        }
        if (status < 200 || status >= 300) {
          return fail(
            getApiMessageFromData(data) ??
              "That code did not work. Check the digits and try again.",
          );
        }
        await refreshSession();
        return { ok: true as const };
      } catch (e) {
        const st = statusFromAxios(e);
        if (st === 429) {
          return fail("Too many attempts. Try again later.");
        }
        return fail(getAxiosErrorMessage(e, "Verification failed. Try again."));
      } finally {
        setVerifyBusy(false);
      }
    },
    [sessionId, refreshSession, showSnackbar],
  );

  const verifyQr = useCallback(
    async (token: string) => {
      if (!sessionId)
        return { ok: false as const, message: "Missing session." };
      setVerifyBusy(true);
      try {
        const { status, data } = await $api.meetups.verifyQr(sessionId, token);
        if (status === 409) {
          return {
            ok: false as const,
            message:
              "This QR code was already used. Ask the other person to show a fresh code if available.",
          };
        }
        if (status === 429) {
          return {
            ok: false as const,
            message: "Too many attempts. Try again later.",
          };
        }
        if (status < 200 || status >= 300) {
          return {
            ok: false as const,
            message:
              getApiMessageFromData(data) ??
              "Could not verify from this QR code.",
          };
        }
        await refreshSession();
        return { ok: true as const };
      } catch (e) {
        const st = statusFromAxios(e);
        if (st === 409) {
          return {
            ok: false as const,
            message:
              "This QR code was already used. Ask the other person to show a fresh code if available.",
          };
        }
        if (st === 429) {
          return {
            ok: false as const,
            message: "Too many attempts. Try again later.",
          };
        }
        return {
          ok: false as const,
          message: getAxiosErrorMessage(e, "Verification failed. Try again."),
        };
      } finally {
        setVerifyBusy(false);
      }
    },
    [sessionId, refreshSession],
  );

  const confirmDonation = useCallback(
    async (userId: string) => {
      if (!sessionId || !session) {
        return { ok: false as const, message: "Session not ready." };
      }
      const isReq = meetupUserIsRequester(session, userId);
      if (isReq === null) {
        return {
          ok: false as const,
          message:
            "We could not tell if you are the donor or the requester for this meetup. Refresh the page or contact support.",
        };
      }
      setConfirmBusy(true);
      try {
        const res = isReq
          ? await $api.meetups.requesterConfirm(sessionId)
          : await $api.meetups.donorConfirm(sessionId);
        const { status, data } = res;
        if (status < 200 || status >= 300) {
          return {
            ok: false as const,
            message:
              getApiMessageFromData(data) ??
              "Could not record your confirmation.",
          };
        }
        await refreshSession();
        await $api.meetups.complete(sessionId).catch(() => undefined);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          message: getAxiosErrorMessage(
            e,
            "Could not record your confirmation.",
          ),
        };
      } finally {
        setConfirmBusy(false);
      }
    },
    [sessionId, session, refreshSession],
  );

  const terminateMeet = useCallback(
    async (reason: string) => {
      const trimmed = reason.trim();
      if (!trimmed) {
        return {
          ok: false as const,
          message: "Please enter a reason for termination.",
        };
      }
      if (!sessionId) return { ok: false as const, message: "Missing session." };
      setTerminateBusy(true);
      try {
        const { status, data } = await $api.meetups.terminate(sessionId, {
          reason: trimmed,
        });
        if (status < 200 || status >= 300) {
          const message =
            getApiMessageFromData(data) ?? "Could not terminate this meetup.";
          showSnackbar(message, "error");
          return { ok: false as const, message };
        }
        await refreshSession();
        return { ok: true as const };
      } catch (e) {
        const message = getAxiosErrorMessage(
          e,
          "Could not terminate this meetup. Try again.",
        );
        showSnackbar(message, "error");
        return { ok: false as const, message };
      } finally {
        setTerminateBusy(false);
      }
    },
    [sessionId, refreshSession, showSnackbar],
  );

  const submitReport = useCallback(
    async (payload: MeetupReportPayload) => {
      if (!sessionId)
        return { ok: false as const, message: "Missing session." };
      setReportBusy(true);
      try {
        const { status, data } = await $api.meetups.report(sessionId, payload);
        if (status < 200 || status >= 300) {
          return {
            ok: false as const,
            message:
              getApiMessageFromData(data) ?? "Could not submit this report.",
          };
        }
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          message: getAxiosErrorMessage(
            e,
            "Could not submit this report. Try again.",
          ),
        };
      } finally {
        setReportBusy(false);
      }
    },
    [sessionId],
  );

  const gateSatisfied = useMemo(
    () => (session ? meetupVerificationGateSatisfied(session) : false),
    [session],
  );

  const readOnly = useMemo(
    () => (session ? meetupReadOnly(session) : true),
    [session],
  );

  const resolveIsRequester = useCallback(
    (userId: string) =>
      session ? meetupUserIsRequester(session, userId) : null,
    [session],
  );

  return {
    session,
    sessionLoad,
    sessionError,
    refreshSession,
    gateSatisfied,
    readOnly,
    resolveIsRequester,
    verifyCode,
    verifyQr,
    confirmDonation,
    verifyBusy,
    confirmBusy,
    submitReport,
    reportBusy,
    terminateMeet,
    terminateBusy,
  };
}
