"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import QRCode from "react-qr-code";
import { useDonationChat } from "@/hooks/chat/useDonationChat.hook";
import { useMeetupSession } from "@/hooks/meetups/useMeetupSession.hook";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadReceivedBookings,
  loadSentBookings,
} from "@/store/slices/bookingsSlice";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import type { MeetupReportPayload } from "@/types/meetups";
import {
  meetupCodeHintStorageKey,
  meetupOtqrStorageKey,
} from "@/lib/meetups/meetupSessionStorageKeys";
import { MeetupReportModal } from "./meetup-report-modal.component";

const cardClass =
  "rounded-xl border border-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]";
const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-[#1a1a22]";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-white/10 dark:bg-[#1a1a22] dark:hover:bg-white/6";

export type MeetupSessionViewProps = {
  sessionId: string;
};

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function normalizeSixDigitCode(raw: string | null | undefined): string | null {
  const d = String(raw ?? "").replace(/\D/g, "").slice(0, 12);
  return d.length === 6 ? d : null;
}

export function MeetupSessionView({ sessionId }: MeetupSessionViewProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const { showSnackbar } = useSnackbar();
  const ninOk = user?.nationalIdentificationNumberVerified === true;

  const [codeInput, setCodeInput] = useState("");
  const [qrPaste, setQrPaste] = useState("");
  const [oneTimeQr] = useState(() => {
    try {
      const k = meetupOtqrStorageKey(sessionId);
      const ot = sessionStorage.getItem(k);
      if (ot) sessionStorage.removeItem(k);
      return ot;
    } catch {
      return null;
    }
  });
  const [meetingHint] = useState(() => {
    try {
      const k = meetupCodeHintStorageKey(sessionId);
      const mc = sessionStorage.getItem(k);
      if (mc) sessionStorage.removeItem(k);
      return mc;
    } catch {
      return null;
    }
  });
  const [chatDraft, setChatDraft] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
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
  } = useMeetupSession(sessionId);

  const donationId = session?.bookingId;
  const donationChatEnabled =
    sessionLoad === "ok" && Boolean(donationId) && Boolean(token);

  const donationChat = useDonationChat({
    donationId,
    accessToken: token,
    enabled: donationChatEnabled,
  });

  const isRequester = useMemo(
    () => (user?.id ? resolveIsRequester(user.id) : null),
    [user, resolveIsRequester],
  );

  const sortedChatMessages = useMemo(() => {
    return [...donationChat.messages].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.id.localeCompare(b.id);
    });
  }, [donationChat.messages]);

  const displayMeetingCode = useMemo(() => {
    return (
      normalizeSixDigitCode(meetingHint) ??
      normalizeSixDigitCode(session?.meetingCode ?? undefined)
    );
  }, [meetingHint, session?.meetingCode]);

  const onVerifyCode = useCallback(async () => {
    setLocalError(null);
    const digits = codeInput.replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) {
      setLocalError("Enter the six-digit meeting code.");
      return;
    }
    const res = await verifyCode(digits);
    if (!res.ok) {
      setLocalError(res.message);
      return;
    }
    showSnackbar("Verified — thank you.");
    setCodeInput("");
  }, [codeInput, verifyCode, showSnackbar]);

  const onVerifyQrPaste = useCallback(async () => {
    setLocalError(null);
    const t = qrPaste.trim();
    if (!t) {
      setLocalError("Paste the token from the scanned QR code.");
      return;
    }
    const res = await verifyQr(t);
    if (!res.ok) {
      setLocalError(res.message);
      return;
    }
    showSnackbar("QR verified.");
    setQrPaste("");
  }, [qrPaste, verifyQr, showSnackbar]);

  const onConfirmDonation = useCallback(async () => {
    if (!user?.id) return;
    setLocalError(null);
    const res = await confirmDonation(user.id);
    if (!res.ok) {
      setLocalError(res.message);
      return;
    }
    showSnackbar("Your donation confirmation was recorded.");
    void dispatch(loadSentBookings());
    void dispatch(loadReceivedBookings());
  }, [user, confirmDonation, showSnackbar, dispatch]);

  const onSendChat = useCallback(async () => {
    const t = chatDraft.trim();
    if (!t) return;
    setLocalError(null);
    donationChat.clearSendError();
    const res = donationChat.sendText(t);
    if (!res.ok) {
      setLocalError(res.message);
      return;
    }
    setChatDraft("");
  }, [chatDraft, donationChat]);

  const onMarkArrived = useCallback(async () => {
    setLocalError(null);
    const res = await donationChat.markArrived();
    if (!res.ok) {
      setLocalError(res.message);
      return;
    }
    showSnackbar("Marked as arrived at the hospital.");
  }, [donationChat, showSnackbar]);

  const onReport = useCallback(
    async (payload: MeetupReportPayload) => {
      const res = await submitReport(payload);
      if (!res.ok) {
        throw new Error(res.message);
      }
      showSnackbar("Thanks — your report was submitted.");
    },
    [submitReport, showSnackbar],
  );

  const myDonationDone = useMemo(() => {
    if (!session || !user?.id) return false;
    if (isRequester === true) return session.requesterDonationConfirmed;
    if (isRequester === false) return session.donorDonationConfirmed;
    return false;
  }, [session, user?.id, isRequester]);

  const peerDonationDone = useMemo(() => {
    if (!session || !user?.id) return false;
    if (isRequester === true) return session.donorDonationConfirmed;
    if (isRequester === false) return session.requesterDonationConfirmed;
    return false;
  }, [session, user?.id, isRequester]);

  const showCodePath =
    session &&
    session.codeVerificationEnabled !== false &&
    !readOnly &&
    !gateSatisfied;

  const chatComposerDisabled =
    readOnly ||
    donationChat.roomClosed ||
    !ninOk ||
    !donationChat.socketConnected ||
    donationChat.sendBusy;

  const chatStatusLine = useMemo(() => {
    if (sessionLoad !== "ok") return null;
    if (!donationId) {
      return "Chat will appear when this meetup is linked to your booking (refresh if this persists).";
    }
    if (!token) return "Sign in again to use donation chat.";
    if (donationChat.roomClosed) {
      return donationChat.roomCloseReason
        ? `Chat closed: ${donationChat.roomCloseReason}`
        : "This donation chat is closed — the thread is read-only.";
    }
    if (!donationChat.socketConnected && donationChatEnabled) {
      return "Connecting to live chat…";
    }
    if (donationChat.historyError) return donationChat.historyError;
    return null;
  }, [
    sessionLoad,
    donationId,
    token,
    donationChat.roomClosed,
    donationChat.roomCloseReason,
    donationChat.socketConnected,
    donationChatEnabled,
    donationChat.historyError,
  ]);

  if (sessionLoad === "loading" || sessionLoad === "idle") {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-text-secondary">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm">Loading meetup…</p>
      </div>
    );
  }

  if (sessionLoad === "error" || !session) {
    return (
      <div className={cardClass}>
        <p className="text-sm font-medium text-text-primary">
          {sessionError ?? "This meetup could not be loaded."}
        </p>
        <button
          type="button"
          className={`${btnSecondary} mt-4`}
          onClick={() => void refreshSession()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to bookings
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
          Donation meetup
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Verify in person, confirm the donation when both sides are ready, then
          you are done.
        </p>
      </div>

      {!ninOk ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/35 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          <span className="font-medium">Verify your NIN</span>
          {" · "}
          National ID verification is required before you can use meetup tools.
          {" "}
          <Link href="/verify-id" className="font-medium underline">
            Go to verification
          </Link>
        </div>
      ) : null}

      {localError ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {localError}
        </p>
      ) : null}

      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Status
            </p>
            <p className="mt-1 text-lg font-semibold capitalize text-text-primary">
              {session.status}
            </p>
            {session.expiresAt ? (
              <p className="mt-1 text-xs text-text-secondary">
                Session ends {formatShortDate(session.expiresAt)}
              </p>
            ) : null}
          </div>
          {readOnly && session.status === "completed" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
              <CheckCircle2 className="size-3.5" aria-hidden />
              Completed
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 border-t border-border pt-4 dark:border-white/10">
          <div className="flex items-start gap-2 text-sm">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-medium text-text-primary">You</p>
              <p className="text-text-secondary">
                Identity verified:{" "}
                {session.me.identityVerified ? "Yes" : "Not shown / no"}
                {" · "}
                At meetup:{" "}
                {session.me.meetupVerified ? "Verified" : "Not yet verified"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden />
            <div>
              <p className="font-medium text-text-primary">Other party</p>
              <p className="text-text-secondary">
                Identity verified:{" "}
                {session.peer.identityVerified ? "Yes" : "Not shown / no"}
                {" · "}
                At meetup:{" "}
                {session.peer.meetupVerified ? "Verified" : "Not yet verified"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {ninOk && displayMeetingCode && !readOnly ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-text-primary">
            Share the code as a QR
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            The other person can scan this to read the six digits, then both of you
            use &quot;Verify code&quot; with the same number. (This is only the
            meeting digits — not the rare one-time server token used under
            &quot;Verify from QR&quot;.)
          </p>
          <p className="mt-3 text-center font-mono text-xl font-semibold tracking-[0.35em] text-text-primary">
            {displayMeetingCode}
          </p>
          <div className="mt-4 flex justify-center rounded-lg bg-white p-4 dark:bg-white">
            <QRCode value={displayMeetingCode} size={180} level="M" />
          </div>
        </section>
      ) : null}

      {ninOk && oneTimeQr ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-text-primary">
            One-time QR for the other person
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            They scan once to verify. Do not share this code in screenshots or
            public channels.
          </p>
          <div className="mt-4 flex justify-center rounded-lg bg-white p-4 dark:bg-white">
            <QRCode value={oneTimeQr} size={180} level="M" />
          </div>
        </section>
      ) : null}

      {ninOk && !readOnly && !gateSatisfied ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-text-primary">
            Verify at the hospital
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Either both of you enter the same six-digit code, or one person scans
            the other&apos;s one-time QR (first successful scan wins).
          </p>

          {showCodePath ? (
            <div className="mt-4">
              <label className="text-xs font-medium text-text-primary">
                Six-digit code
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={`${inputClass} max-w-[11rem] font-mono tracking-widest`}
                  placeholder="000000"
                  value={codeInput}
                  onChange={(e) =>
                    setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={verifyBusy || !ninOk}
                />
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={verifyBusy || !ninOk}
                  onClick={() => void onVerifyCode()}
                >
                  {verifyBusy ? "Checking…" : "Verify code"}
                </button>
              </div>
            </div>
          ) : null}

          {session.qrVerificationEnabled !== false ? (
            <div className="mt-6 border-t border-border pt-4 dark:border-white/10">
              <label className="text-xs font-medium text-text-primary">
                Token from scanned QR
              </label>
              <p className="mt-0.5 text-xs text-text-secondary">
                If you scanned their QR with your phone, paste the decoded token
                here.
              </p>
              <textarea
                className={`${inputClass} mt-2 min-h-[72px] resize-y font-mono text-xs`}
                value={qrPaste}
                onChange={(e) => setQrPaste(e.target.value)}
                disabled={verifyBusy || !ninOk}
                placeholder="Paste token"
              />
              <button
                type="button"
                className={`${btnSecondary} mt-2`}
                disabled={verifyBusy || !ninOk}
                onClick={() => void onVerifyQrPaste()}
              >
                {verifyBusy ? "Checking…" : "Verify from QR"}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {ninOk && gateSatisfied && !readOnly ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-text-primary">
            Confirm donation
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            After the donation takes place, each of you confirms once. When both
            confirmations are in, this booking is completed.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-text-secondary">
            <li>
              You:{" "}
              {myDonationDone ? (
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  Confirmed
                </span>
              ) : (
                <span className="text-amber-800 dark:text-amber-300">
                  Waiting for your confirmation
                </span>
              )}
            </li>
            <li>
              Other party:{" "}
              {peerDonationDone ? (
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  Confirmed
                </span>
              ) : (
                <span>Not yet</span>
              )}
            </li>
          </ul>
          {!myDonationDone ? (
            <button
              type="button"
              className={`${btnPrimary} mt-4`}
              disabled={confirmBusy || isRequester === null}
              onClick={() => void onConfirmDonation()}
            >
              {confirmBusy ? "Saving…" : "I confirm the donation"}
            </button>
          ) : null}
        </section>
      ) : null}

      {readOnly ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-text-primary">Summary</h2>
          <p className="mt-1 text-sm text-text-secondary">
            This meetup is closed. Verification and donation confirmations are
            frozen. Refresh your bookings list for the latest booking status.
          </p>
        </section>
      ) : null}

      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold text-text-primary">
              Donation chat
            </h2>
          </div>
          {ninOk &&
          donationId &&
          !readOnly &&
          !donationChat.roomClosed &&
          !donationChat.arrivedRecorded ? (
            <button
              type="button"
              className={btnSecondary}
              disabled={donationChat.arrivedBusy}
              onClick={() => void onMarkArrived()}
            >
              {donationChat.arrivedBusy ? "Saving…" : "I'm here (arrived)"}
            </button>
          ) : null}
          {donationChat.arrivedRecorded ? (
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Arrival recorded
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          Live messages use the server chat channel (not meetup REST). Pending
          bookings have no room until the donor accepts.
        </p>
        {chatStatusLine ? (
          <p className="mt-2 text-xs text-text-secondary">{chatStatusLine}</p>
        ) : null}
        {donationChat.sendError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {donationChat.sendError}
          </p>
        ) : null}
        {donationChat.typingLabel ? (
          <p className="mt-1 text-xs italic text-text-tertiary">
            {donationChat.typingLabel} is typing…
          </p>
        ) : null}
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-black/20">
          {donationChat.historyLoading && sortedChatMessages.length === 0 ? (
            <p className="text-xs text-text-secondary">Loading messages…</p>
          ) : sortedChatMessages.length === 0 ? (
            <p className="text-xs text-text-secondary">
              {donationChat.roomClosed
                ? "No messages to show."
                : "No messages yet."}
            </p>
          ) : (
            sortedChatMessages.map((m) => {
              const mine = Boolean(user?.id && m.senderUserId === user.id);
              return (
                <div
                  key={m.id}
                  className={`max-w-[95%] rounded-lg px-2.5 py-1.5 text-xs ${
                    mine
                      ? "ml-auto bg-primary text-white"
                      : "mr-auto bg-white text-text-primary dark:bg-[#252530]"
                  }`}
                >
                  {m.roleLabel ? (
                    <p
                      className={
                        mine
                          ? "mb-0.5 text-[10px] font-medium uppercase tracking-wide text-white/85"
                          : "mb-0.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary"
                      }
                    >
                      {m.roleLabel}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  {m.createdAt ? (
                    <p
                      className={
                        mine
                          ? "mt-0.5 text-[10px] text-white/75"
                          : "mt-0.5 text-[10px] text-text-tertiary"
                      }
                    >
                      {formatShortDate(m.createdAt)}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
        {donationChat.nextCursor ? (
          <button
            type="button"
            className={`${btnSecondary} mt-2 text-xs`}
            onClick={() => donationChat.loadOlderMessages()}
            disabled={donationChat.historyLoading}
          >
            Load older
          </button>
        ) : null}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <textarea
            className={`${inputClass} min-h-[72px] flex-1 resize-y sm:min-h-[44px]`}
            placeholder={
              chatComposerDisabled
                ? donationChat.roomClosed
                  ? "This chat is closed."
                  : !donationChat.socketConnected
                    ? "Waiting for chat connection…"
                    : "Message…"
                : "Message…"
            }
            value={chatDraft}
            onChange={(e) => {
              setChatDraft(e.target.value);
              donationChat.onComposerTyping();
            }}
            disabled={chatComposerDisabled}
          />
          <button
            type="button"
            className={`${btnPrimary} shrink-0`}
            disabled={chatComposerDisabled}
            onClick={() => void onSendChat()}
          >
            {donationChat.sendBusy ? "Sending…" : "Send"}
          </button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnSecondary}
          onClick={() => setReportOpen(true)}
          disabled={reportBusy}
        >
          Report meetup
        </button>
      </div>

      <MeetupReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={onReport}
      />
    </div>
  );
}
