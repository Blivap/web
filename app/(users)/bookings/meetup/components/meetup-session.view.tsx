"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  HelpCircle,
  MessageCircle,
  ScanIcon,
  SendIcon,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useDonationChat } from "@/hooks/chat/useDonationChat.hook";
import { useMeetupSession } from "@/hooks/meetups/useMeetupSession.hook";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadReceivedBookings,
  loadSentBookings,
} from "@/store/slices/bookingsSlice";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import QRCode from "react-qr-code";
import type { MeetupParticipant, MeetupReportPayload } from "@/types/meetups";
import {
  meetupChatBookingStashKey,
  meetupCodeHintStorageKey,
} from "@/lib/meetups/meetupSessionStorageKeys";
import {
  isOwnMeetupCodeForVerify,
  normalizeMeetupSixDigitCode,
  resolveMeetupSwapCodes,
} from "@/lib/meetups/meetupSwapCodes";
import {
  buildMeetupSwapCodeQrUrl,
  meetupPendingVerifyCodeStorageKey,
  parseCodeFromScannedMeetupPayload,
} from "@/lib/meetups/meetupVerifyQrUrl";
import { MeetupQrScanner } from "./meetup-qr-scanner.component";
import { routes } from "@/config/routes";
import { DonationRatingModal } from "@/app/(users)/bookings/components/donation-rating-modal.component";
import { MeetupReportModal } from "./meetup-report-modal.component";
import {
  bookingNeedsRequesterRating,
  isBookingRatedLocally,
} from "@/lib/ratings/ratedBookingsStorage";
import { patchBookingInLists } from "@/store/slices/bookingsSlice";
import { MeetupPageSkeleton } from "./meetup-page-skeleton.component";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
          description="In-person check: you entered the other person's unique code (or scanned their QR)."
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

export function MeetupSessionView({ sessionId }: MeetupSessionViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const { showSnackbar } = useSnackbar();
  const ninOk = user?.nationalIdentificationNumberVerified === true;

  const [codeInput, setCodeInput] = useState("");
  const [peerScannerOpen, setPeerScannerOpen] = useState(false);
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
  const [terminateAlertOpen, setTerminateAlertOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [terminateReasonError, setTerminateReasonError] = useState<
    string | null
  >(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const ratingPromptedForBookingRef = useRef<string | null>(null);
  const sentBookings = useAppSelector((s) => s.bookings.sent.items);
  /** Booking Mongo id stashed in bootstrap when opening from a booking row (fallback if GET session omits `bookingId`). */
  const stashedChatBookingId = useMemo(() => {
    try {
      const v = sessionStorage
        .getItem(meetupChatBookingStashKey(sessionId))
        ?.trim();
      return v && v.length > 0 ? v : null;
    } catch {
      return null;
    }
  }, [sessionId]);

  const {
    session,
    sessionLoad,
    sessionError,
    refreshSession,
    gateSatisfied,
    readOnly,
    resolveIsRequester,
    verifyCode,
    confirmDonation,
    verifyBusy,
    confirmBusy,
    submitReport,
    reportBusy,
    terminateMeet,
    terminateBusy,
  } = useMeetupSession(sessionId);

  /**
   * Booking `_id` from the API — this is `donationId` for `/chat` (Socket.IO + REST).
   * It must never be the meetup session id.
   */
  const donationChatBookingId =
    session?.bookingId ?? stashedChatBookingId ?? undefined;
  const donationChatEnabled =
    sessionLoad === "ok" &&
    session?.chatEnabled !== false &&
    Boolean(donationChatBookingId) &&
    Boolean(token);

  const donationChat = useDonationChat({
    donationId: donationChatBookingId,
    accessToken: token,
    enabled: donationChatEnabled,
    viewerUserId: user?.id,
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

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const lastChatMessageIdRef = useRef<string | null>(null);
  const newestChatMessageId =
    sortedChatMessages.length > 0
      ? sortedChatMessages[sortedChatMessages.length - 1]!.id
      : null;

  useLayoutEffect(() => {
    const el = chatScrollRef.current;
    if (!newestChatMessageId) {
      lastChatMessageIdRef.current = null;
      return;
    }
    if (lastChatMessageIdRef.current === newestChatMessageId) return;
    lastChatMessageIdRef.current = newestChatMessageId;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [newestChatMessageId]);

  const meetingHintForResolve =
    sessionLoad === "ok" ? null : meetingHint;

  const swapCodes = useMemo(
    () =>
      resolveMeetupSwapCodes(session, meetingHintForResolve, user?.id),
    [session, meetingHintForResolve, user?.id],
  );

  const myMeetupCode = swapCodes.myCode;

  const swapCodeQrUrl = useMemo(() => {
    if (!myMeetupCode) return null;
    const bookingId = session?.bookingId ?? stashedChatBookingId;
    if (!bookingId || typeof window === "undefined") return null;
    return buildMeetupSwapCodeQrUrl(
      window.location.origin,
      bookingId,
      myMeetupCode,
    );
  }, [myMeetupCode, session?.bookingId, stashedChatBookingId]);

  const onVerifyCode = useCallback(async () => {
    setLocalError(null);
    const digits = codeInput.replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) {
      setLocalError("Enter the other person's six-digit code.");
      return;
    }
    if (isOwnMeetupCodeForVerify(digits, swapCodes)) {
      setLocalError("Enter the other person's code, not your own.");
      return;
    }
    const res = await verifyCode(digits);
    if (!res.ok) {
      setLocalError(res.message);
      return;
    }
    showSnackbar("Verified — thank you.");
    setCodeInput("");
  }, [codeInput, swapCodes, verifyCode, showSnackbar]);

  const onScannedPeerCode = useCallback(
    async (decoded: string) => {
      setLocalError(null);
      const digits = parseCodeFromScannedMeetupPayload(decoded);
      if (!digits) {
        const msg = "Could not read a six-digit code from that QR.";
        setLocalError(msg);
        showSnackbar(msg, "error");
        return;
      }
      if (isOwnMeetupCodeForVerify(digits, swapCodes)) {
        const msg = "Scan the other person's QR, not your own.";
        setLocalError(msg);
        showSnackbar(msg, "error");
        return;
      }
      const res = await verifyCode(digits);
      if (!res.ok) return;
      showSnackbar("Verified — thank you.", "success");
      setCodeInput("");
      setPeerScannerOpen(false);
    },
    [swapCodes, verifyCode, showSnackbar],
  );

  const ratingDonorLabel = useMemo(() => {
    const bid = donationChatBookingId;
    if (!bid) return undefined;
    const row = sentBookings.find((b) => b.id === bid);
    if (row?.donorDisplayName?.trim()) return row.donorDisplayName.trim();
    if (session?.donorUserId) return `Donor ${session.donorUserId.slice(0, 6)}`;
    return undefined;
  }, [donationChatBookingId, sentBookings, session?.donorUserId]);

  const shouldPromptForRating = useCallback(
    (bookingId: string | undefined) => {
      if (!bookingId || isRequester !== true) return false;
      if (isBookingRatedLocally(bookingId)) return false;
      const row = sentBookings.find((b) => b.id === bookingId);
      if (row && !bookingNeedsRequesterRating(row)) return false;
      if (!row && session?.status?.toLowerCase() !== "completed") return false;
      return session?.status?.toLowerCase() === "completed";
    },
    [isRequester, sentBookings, session?.status],
  );

  const openRatingModalIfNeeded = useCallback(
    (bookingId: string | undefined) => {
      if (!bookingId || !shouldPromptForRating(bookingId)) return;
      if (ratingPromptedForBookingRef.current === bookingId) return;
      ratingPromptedForBookingRef.current = bookingId;
      setRatingModalOpen(true);
    },
    [shouldPromptForRating],
  );

  const onRatingSuccess = useCallback(() => {
    const bid = donationChatBookingId;
    if (bid) {
      dispatch(
        patchBookingInLists({ id: bid, requesterHasRated: true, status: "completed" }),
      );
    }
    showSnackbar("Thanks for your rating.", "success");
    void dispatch(loadSentBookings({ silent: true }));
  }, [donationChatBookingId, dispatch, showSnackbar]);

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
    if (isRequester === true) {
      openRatingModalIfNeeded(donationChatBookingId);
    }
  }, [
    user,
    confirmDonation,
    showSnackbar,
    dispatch,
    isRequester,
    openRatingModalIfNeeded,
    donationChatBookingId,
  ]);

  useEffect(() => {
    if (sessionLoad !== "ok" || !session || isRequester !== true) return;
    if (session.status?.toLowerCase() !== "completed") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prompt when session becomes completed after donor confirms
    openRatingModalIfNeeded(donationChatBookingId);
  }, [
    sessionLoad,
    session,
    isRequester,
    donationChatBookingId,
    openRatingModalIfNeeded,
  ]);

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

  const onTerminateDialogOpenChange = useCallback((open: boolean) => {
    setTerminateAlertOpen(open);
    if (!open) {
      setTerminateReason("");
      setTerminateReasonError(null);
    }
  }, []);

  const onConfirmTerminateMeet = useCallback(async () => {
    if (readOnly) return;
    const reason = terminateReason.trim();
    if (!reason) {
      setTerminateReasonError("Please enter a reason for termination.");
      return;
    }
    setTerminateReasonError(null);
    setLocalError(null);
    const res = await terminateMeet(reason);
    if (!res.ok) {
      if (res.message) setTerminateReasonError(res.message);
      return;
    }
    setTerminateAlertOpen(false);
    setTerminateReason("");
    showSnackbar("Meetup terminated.", "success");
    void dispatch(loadSentBookings({ silent: true }));
    void dispatch(loadReceivedBookings({ silent: true }));
    router.push(routes.bookings);
  }, [
    readOnly,
    terminateReason,
    terminateMeet,
    showSnackbar,
    dispatch,
    router,
  ]);

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

  useEffect(() => {
    if (sessionLoad !== "ok" || !session || readOnly || gateSatisfied) return;
    if (session.codeVerificationEnabled === false) return;

    let pending: string | null = null;
    try {
      const k = meetupPendingVerifyCodeStorageKey(sessionId);
      pending = sessionStorage.getItem(k);
      if (pending) sessionStorage.removeItem(k);
    } catch {
      return;
    }
    const digits = normalizeMeetupSixDigitCode(pending);
    if (!digits) return;

    void (async () => {
      if (isOwnMeetupCodeForVerify(digits, swapCodes)) {
        const msg = "That QR is your own code. Scan the other person's QR.";
        setLocalError(msg);
        showSnackbar(msg, "error");
        return;
      }
      setLocalError(null);
      const res = await verifyCode(digits);
      if (!res.ok) {
        setLocalError(res.message);
        return;
      }
      showSnackbar("Their code verified — thank you.", "success");
    })();
  }, [
    sessionLoad,
    session,
    sessionId,
    readOnly,
    gateSatisfied,
    swapCodes,
    verifyCode,
    showSnackbar,
  ]);

  const chatComposerDisabled =
    readOnly ||
    donationChat.roomClosed ||
    !ninOk ||
    !donationChat.socketConnected ||
    donationChat.sendBusy;

  const chatStatusLine = useMemo(() => {
    if (sessionLoad !== "ok") return null;
    if (session?.chatEnabled === false) {
      return "Donation chat opens after this booking is accepted. Meetup verify / confirm flows use /meetups only — they do not carry chat messages.";
    }
    if (!donationChatBookingId) {
      return "Chat needs your booking id (same value as in /chat/:donationId). Refresh or open meetup again from the booking row if this stays empty.";
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
    session?.chatEnabled,
    donationChatBookingId,
    token,
    donationChat.roomClosed,
    donationChat.roomCloseReason,
    donationChat.socketConnected,
    donationChatEnabled,
    donationChat.historyError,
  ]);

  const donationChatStatusBadge = useMemo(() => {
    if (sessionLoad !== "ok" || !donationChatBookingId || !token) return null;
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
    donationChatBookingId,
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

      {ninOk && !readOnly && !gateSatisfied ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-text-primary">
            Verify at the hospital
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Each of you has a unique six-digit code. Share yours (or your QR);
            enter or scan the other person&apos;s code. Both must verify before
            donation confirmation unlocks.
          </p>

          {myMeetupCode ? (
            <div className="mt-4 rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-black/20">
              {swapCodeQrUrl ? (
                <div className="mt-4  pt-4 ">
                  {!peerScannerOpen ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={verifyBusy || !ninOk}
                      onClick={() => setPeerScannerOpen(true)}
                    >
                      <ScanIcon className="size-4" aria-hidden />
                    </Button>
                  ) : null}
                  <div className="mt-3 flex flex-col gap-6 justify-center rounded-lg bg-white p-4 dark:bg-white w-fit">
                    <p className="text-xs font-medium text-text-primary">
                      {peerScannerOpen ? "Scan their QR" : "Your QR"}
                    </p>
                    {peerScannerOpen ? (
                      <MeetupQrScanner
                        className="mt-3"
                        autoStart
                        disabled={verifyBusy || !ninOk}
                        busy={verifyBusy}
                        onScan={onScannedPeerCode}
                      />
                    ) : (
                      <QRCode value={swapCodeQrUrl} size={180} level="M" />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-xs text-amber-800 dark:text-amber-300">
              Your code is not loaded yet. Check your notification or refresh
              this page.
            </p>
          )}

          {showCodePath ? (
            <div className="mt-6 border-t border-border pt-4 dark:border-white/10">
              <label className="text-xs font-medium text-text-primary">
                Other person&apos;s code
              </label>
              <p className="mt-0.5 text-xs text-text-secondary">
                Ask them to share their digits or let you scan their QR.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
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
                  {verifyBusy ? <Spinner /> : "Verify"}{" "}
                </button>
              </div>
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
          donationChatBookingId &&
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
        <div
          ref={chatScrollRef}
          className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-black/20"
        >
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
              const mine = Boolean(
                m.senderUserId === user?.id || m.roleLabel === "VerifiedDonor",
              );
              return (
                <div
                  key={m.id}
                  className={`max-w-[50%] rounded-lg px-2.5 py-1.5 text-xs ${
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
        <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row">
          <textarea
            className={`${inputClass} min-h-[72px] flex-1 sm:min-h-[10px] max-h-[40px] resize-none`}
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
          <Button
            type="button"
            size="icon-lg"
            className={`${btnPrimary} shrink-0`}
            disabled={chatComposerDisabled || donationChat.sendBusy}
            onClick={() => void onSendChat()}
          >
            <SendIcon className="size-4" aria-hidden />
          </Button>
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

      <button
        type="button"
        className={`${btnSecondary} w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40`}
        disabled={readOnly || terminateBusy}
        onClick={() => setTerminateAlertOpen(true)}
      >
        Terminate meet
      </button>

      <AlertDialog
        open={terminateAlertOpen}
        onOpenChange={onTerminateDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate this meetup?</AlertDialogTitle>
            <AlertDialogDescription>
              This ends the meetup for both parties. Verification and donation
              chat will stop. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <label
              htmlFor="terminate-reason"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Reason for termination
            </label>
            <textarea
              id="terminate-reason"
              rows={3}
              value={terminateReason}
              disabled={terminateBusy}
              placeholder="e.g. Donor could not attend, safety concern, wrong location…"
              className="w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 dark:border-white/10 dark:bg-[#1a1a22]"
              onChange={(e) => {
                setTerminateReason(e.target.value);
                if (terminateReasonError) setTerminateReasonError(null);
              }}
            />
            {terminateReasonError ? (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {terminateReasonError}
              </p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={terminateBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/25 dark:bg-destructive/90"
              disabled={terminateBusy || !terminateReason.trim()}
              onClick={(e) => {
                e.preventDefault();
                void onConfirmTerminateMeet();
              }}
            >
              {terminateBusy ? "Terminating…" : "Terminate meet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MeetupReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={onReport}
      />

      {donationChatBookingId ? (
        <DonationRatingModal
          open={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          bookingId={donationChatBookingId}
          donorLabel={ratingDonorLabel}
          onSuccess={onRatingSuccess}
        />
      ) : null}
    </div>
  );
}
