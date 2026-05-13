"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  HelpCircle,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  UserRound,
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
import type { MeetupParticipant, MeetupReportPayload } from "@/types/meetups";
import {
  meetupCodeHintStorageKey,
  meetupOtqrStorageKey,
} from "@/lib/meetups/meetupSessionStorageKeys";
import { MeetupReportModal } from "./meetup-report-modal.component";
import { MeetupPageSkeleton } from "./meetup-page-skeleton.component";

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

type PlatformIdStatus = "verified" | "not_verified" | "unknown";

function platformIdStatus(v: boolean | undefined): PlatformIdStatus {
  if (v === true) return "verified";
  if (v === false) return "not_verified";
  return "unknown";
}

function MeetupVerificationRow({
  label,
  description,
  status,
}: {
  label: string;
  description: string;
  status: "done" | "pending" | "issue" | "unknown";
}) {
  const config = {
    done: {
      Icon: CheckCircle2,
      chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/55 dark:text-emerald-100",
      text: "Done",
    },
    pending: {
      Icon: CircleDashed,
      chip: "bg-amber-100 text-amber-950 dark:bg-amber-950/45 dark:text-amber-100",
      text: "Still needed",
    },
    issue: {
      Icon: ShieldAlert,
      chip: "bg-amber-100 text-amber-950 dark:bg-amber-950/45 dark:text-amber-100",
      text: "Not verified",
    },
    unknown: {
      Icon: HelpCircle,
      chip: "bg-[#F3F4F6] text-text-secondary dark:bg-white/12 dark:text-white/85",
      text: "Not shown",
    },
  } as const;

  const { Icon, chip, text } = config[status];

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/80 bg-white/80 px-3 py-2.5 dark:border-white/12 dark:bg-[#2a2a34]">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          {label}
        </p>
        <p className="mt-0.5 text-[13px] leading-snug text-text-secondary dark:text-white/75">
          {description}
        </p>
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${chip}`}
      >
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {text}
      </span>
    </div>
  );
}

function MeetupParticipantVerificationCard({
  title,
  participant,
  emphasize,
}: {
  title: string;
  participant: MeetupParticipant;
  emphasize?: boolean;
}) {
  const pid = platformIdStatus(participant.identityVerified);
  const platformRowStatus: "done" | "pending" | "issue" | "unknown" =
    pid === "verified" ? "done" : pid === "not_verified" ? "issue" : "unknown";
  const meetupRowStatus = participant.meetupVerified ? "done" : "pending";

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-3 ${
        emphasize
          ? "border-primary/35 bg-primary/4 ring-1 ring-primary/15 dark:border-primary/30 dark:bg-primary/10"
          : "border-border bg-[#FAFAFA] dark:border-white/10 dark:bg-white/3"
      }`}
    >
      <div className="flex items-center gap-2">
        <UserRound
          className={`size-4 shrink-0 ${emphasize ? "text-primary" : "text-text-tertiary dark:text-white/70"}`}
          aria-hidden
        />
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {participant.role ? (
          <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary ring-1 ring-border dark:bg-[#2e2e38] dark:text-white/70 dark:ring-white/12">
            {participant.role}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <MeetupVerificationRow
          label="Platform identity"
          description="Government ID (NIN) on file with Blivap before the meetup."
          status={platformRowStatus}
        />
        <MeetupVerificationRow
          label="This meetup"
          description="In-person check: code or QR used at the donation meetup."
          status={meetupRowStatus}
        />
      </div>
    </div>
  );
}

function MeetupVerificationSummary({
  me,
  peer,
}: {
  me: MeetupParticipant;
  peer: MeetupParticipant;
}) {
  return (
    <div className="mt-4 border-t border-border pt-4 dark:border-white/10">
      <div className="flex items-start gap-2">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden
        />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Who is verified?
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">
              Two separate checks:
            </span>{" "}
            your account ID on the platform, then the in-person step for{" "}
            <span className="whitespace-nowrap">this session only</span>.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MeetupParticipantVerificationCard
          title="You"
          participant={me}
          emphasize
        />
        <MeetupParticipantVerificationCard
          title="Other person"
          participant={peer}
        />
      </div>
    </div>
  );
}

function normalizeSixDigitCode(raw: string | null | undefined): string | null {
  const d = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 12);
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
    void dispatch(loadSentBookings({ silent: true }));
    void dispatch(loadReceivedBookings({ silent: true }));
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
      return (
        donationChat.roomCloseReason?.trim() ||
        "This donation chat is closed — you cannot send new messages."
      );
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

  const donationChatStatusBadge = useMemo(() => {
    if (sessionLoad !== "ok" || !donationId || !token) return null;
    if (donationChat.roomClosed) {
      return {
        label: "Closed",
        className:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/45 dark:text-amber-100",
      } as const;
    }
    if (donationChat.historyError) {
      return {
        label: "Error",
        className:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100",
      } as const;
    }
    if (!donationChat.socketConnected && donationChatEnabled) {
      return {
        label: "Connecting",
        className:
          "border-border bg-[#F3F4F6] text-text-secondary dark:border-white/10 dark:bg-white/8 dark:text-text-secondary",
      } as const;
    }
    if (donationChat.socketConnected) {
      return {
        label: "Live",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/45 dark:text-emerald-100",
      } as const;
    }
    return null;
  }, [
    sessionLoad,
    donationId,
    token,
    donationChat.roomClosed,
    donationChat.historyError,
    donationChat.socketConnected,
    donationChatEnabled,
  ]);

  if (sessionLoad === "loading" || sessionLoad === "idle") {
    return <MeetupPageSkeleton />;
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
    <div className="mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
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
          National ID verification is required before you can use meetup tools.{" "}
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

        <MeetupVerificationSummary me={session.me} peer={session.peer} />
      </section>

      {ninOk && displayMeetingCode && !readOnly ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-text-primary">
            Share the code as a QR
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            The other person can scan this to read the six digits, then both of
            you use &quot;Verify code&quot; with the same number. (This is only
            the meeting digits — not the rare one-time server token used under
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
            Either both of you enter the same six-digit code, or one person
            scans the other&apos;s one-time QR (first successful scan wins).
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
                  className={`${inputClass} max-w-44 font-mono tracking-widest`}
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
          <div className="flex flex-wrap items-center gap-2">
            <MessageCircle className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold text-text-primary">
              Donation chat
            </h2>
            {donationChatStatusBadge ? (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${donationChatStatusBadge.className}`}
              >
                {donationChatStatusBadge.label}
              </span>
            ) : null}
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
          <p
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
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
                  <p className="whitespace-pre-wrap wrap-break-words">
                    {m.text}
                  </p>
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
