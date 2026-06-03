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
import { $api } from "@/app/api";
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
import { parseMeetupEnsureSessionBody } from "@/lib/meetups/parseMeetupResponses";
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
import { isBookingRatedLocally } from "@/lib/ratings/ratedBookingsStorage";
import { patchBookingInLists } from "@/store/slices/bookingsSlice";
import { MeetupPageSkeleton } from "./meetup-page-skeleton.component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/forms/inputs/input.component";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal/modal.component";

const cardClass =
  "rounded-xl border border-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]";

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
  const [meetingHint, setMeetingHint] = useState<string | null>(() => {
    try {
      const k = meetupCodeHintStorageKey(sessionId);
      const mc = sessionStorage.getItem(k);
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
  const codeHydrateAttemptRef = useRef<string | null>(null);
  const sentBookings = useAppSelector((s) => s.bookings.sent.items);
  const receivedBookings = useAppSelector((s) => s.bookings.received.items);
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

  /** Donors must never see the post-donation rating prompt. */
  const isDonorViewer = useMemo(() => {
    if (!user?.id || !session) return false;
    if (session.donorUserId === user.id) return true;
    return session.me.role?.toLowerCase() === "donor";
  }, [user?.id, session]);

  const canPromptRequesterRating = isRequester === true && !isDonorViewer;

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

  const swapCodes = useMemo(
    () => resolveMeetupSwapCodes(session, meetingHint, user?.id),
    [session, meetingHint, user?.id],
  );

  const bookingMeetingCode = useMemo(() => {
    const bookingId = session?.bookingId ?? stashedChatBookingId ?? null;
    if (!bookingId) return null;
    const sentMatch = sentBookings.find((b) => b.id === bookingId);
    const receivedMatch = receivedBookings.find((b) => b.id === bookingId);
    return normalizeMeetupSixDigitCode(
      sentMatch?.meetingCode ?? receivedMatch?.meetingCode ?? null,
    );
  }, [
    session?.bookingId,
    stashedChatBookingId,
    sentBookings,
    receivedBookings,
  ]);

  const myMeetupCode = swapCodes.myCode ?? bookingMeetingCode;

  const swapCodeQrUrl = useMemo(() => {
    if (!myMeetupCode) return null;
    if (typeof window === "undefined") return null;
    const bookingId = session?.bookingId ?? stashedChatBookingId;
    if (bookingId) {
      return buildMeetupSwapCodeQrUrl(
        window.location.origin,
        bookingId,
        myMeetupCode,
      );
    }
    // Fallback: still render QR with current meetup session path when booking id
    // is absent from payload/storage.
    const sessionPath = `/bookings/meetup/${encodeURIComponent(sessionId)}`;
    const params = new URLSearchParams({ verifyMeetupCode: myMeetupCode });
    return `${window.location.origin}${sessionPath}?${params.toString()}`;
  }, [myMeetupCode, session?.bookingId, stashedChatBookingId, sessionId]);

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

  const onPeerScannerStop = useCallback(() => {
    setPeerScannerOpen(false);
  }, []);

  const ratingDonorLabel = useMemo(() => {
    const bid = donationChatBookingId;
    if (!bid) return undefined;
    const row = sentBookings.find((b) => b.id === bid);
    if (row?.donorDisplayName?.trim()) return row.donorDisplayName.trim();
    if (session?.donorUserId) return `Donor ${session.donorUserId.slice(0, 6)}`;
    return undefined;
  }, [donationChatBookingId, sentBookings, session?.donorUserId]);

  const meetupDonationComplete = useMemo(() => {
    if (!session) return false;
    if (session.status?.toLowerCase() === "completed") return true;
    return (
      session.requesterDonationConfirmed === true &&
      session.donorDonationConfirmed === true
    );
  }, [session]);

  const chatAndDonationComplete = useMemo(() => {
    if (!meetupDonationComplete) return false;
    if (donationChat.roomClosed) return true;
    // Chat socket may lag; completed meetup implies donation chat is done.
    return session?.status?.toLowerCase() === "completed";
  }, [meetupDonationComplete, donationChat.roomClosed, session?.status]);
  const chatLocked = readOnly || meetupDonationComplete;

  const shouldPromptForRating = useCallback(
    (bookingId: string | undefined) => {
      if (!bookingId || !canPromptRequesterRating) return false;
      if (!chatAndDonationComplete) return false;
      if (isBookingRatedLocally(bookingId)) return false;

      const row = sentBookings.find((b) => b.id === bookingId);
      if (row?.requesterHasRated === true) return false;

      return true;
    },
    [canPromptRequesterRating, chatAndDonationComplete, sentBookings],
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
        patchBookingInLists({
          id: bid,
          requesterHasRated: true,
          status: "completed",
        }),
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
  }, [user, confirmDonation, showSnackbar, dispatch]);

  useEffect(() => {
    if (!canPromptRequesterRating) {
      setRatingModalOpen(false);
      return;
    }
    void dispatch(loadSentBookings({ silent: true }));
  }, [canPromptRequesterRating, dispatch]);

  useEffect(() => {
    if (!donationChat.roomClosed) return;
    void refreshSession();
  }, [donationChat.roomClosed, refreshSession]);

  useEffect(() => {
    if (sessionLoad !== "ok" || !session || !canPromptRequesterRating) return;
    if (!chatAndDonationComplete) return;
    openRatingModalIfNeeded(donationChatBookingId);
  }, [
    sessionLoad,
    session,
    canPromptRequesterRating,
    chatAndDonationComplete,
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
    if (sessionLoad !== "ok" || !session) return;
    if (swapCodes.myCode) return;
    const bookingId = session.bookingId ?? stashedChatBookingId ?? null;
    if (!bookingId) return;
    if (codeHydrateAttemptRef.current === bookingId) return;
    codeHydrateAttemptRef.current = bookingId;

    void (async () => {
      try {
        const { status, data } = await $api.meetups.ensureSession(bookingId);
        if (status < 200 || status >= 300) return;
        const parsed = parseMeetupEnsureSessionBody(data);
        const hydratedCode = normalizeMeetupSixDigitCode(
          parsed?.myMeetingCode ?? parsed?.meetingCode ?? null,
        );
        if (!hydratedCode) return;
        setMeetingHint(hydratedCode);
        try {
          sessionStorage.setItem(
            meetupCodeHintStorageKey(sessionId),
            hydratedCode,
          );
        } catch {
          /* storage blocked */
        }
      } catch {
        /* best-effort code hydration */
      }
    })();
  }, [
    sessionLoad,
    session,
    swapCodes.myCode,
    stashedChatBookingId,
    sentBookings,
    receivedBookings,
    sessionId,
  ]);

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
    chatLocked ||
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
    if (chatLocked) {
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
    chatLocked,
    donationChat.roomCloseReason,
    donationChat.socketConnected,
    donationChatEnabled,
    donationChat.historyError,
  ]);

  const donationChatStatusBadge = useMemo(() => {
    if (sessionLoad !== "ok" || !donationChatBookingId || !token) return null;
    if (chatLocked) {
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
    chatLocked,
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void refreshSession()}
        >
          Try again
        </Button>
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
            Both must verify before donation confirmation unlocks.
          </p>

          {myMeetupCode ? (
            <div className="mt-4 rounded-lg border border-border bg-[#FAFAFB] p-3 dark:border-white/10 dark:bg-black/20 sm:hidden">
              {swapCodeQrUrl ? (
                <div className="mt-4 pt-4 ">
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
                  <div className="mt-3 flex flex-col gap-6 justify-center items-center rounded-lg bg-white p-4 dark:bg-white w-full">
                    <p className="text-xs font-medium text-text-primary">
                      {peerScannerOpen ? "Scan their QR" : "Your QR"}
                    </p>
                    {peerScannerOpen ? (
                      <MeetupQrScanner
                        className="mt-3 w-full"
                        autoStart
                        disabled={verifyBusy || !ninOk}
                        busy={verifyBusy}
                        onStop={onPeerScannerStop}
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
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <Input
                  name="meetupCode"
                  value={codeInput}
                  onChange={(e) =>
                    setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  disabled={verifyBusy || !ninOk}
                  containerClassName="max-w-44"
                  inputClassName="font-mono tracking-widest"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={verifyBusy || !ninOk}
                  loading={verifyBusy}
                  onClick={() => void onVerifyCode()}
                >
                  Verify
                </Button>
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
            <Button
              type="button"
              size="sm"
              className="mt-4"
              disabled={confirmBusy || isRequester === null}
              loading={confirmBusy}
              onClick={() => void onConfirmDonation()}
            >
              Confirm donation
            </Button>
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
          !chatLocked &&
          !donationChat.arrivedRecorded ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={donationChat.arrivedBusy}
              loading={donationChat.arrivedBusy}
              onClick={() => void onMarkArrived()}
            >
              I&apos;m here (arrived)
            </Button>
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
              {chatLocked ? "No messages to show." : "No messages yet."}
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
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="mt-2"
            onClick={() => donationChat.loadOlderMessages()}
            disabled={donationChat.historyLoading}
            loading={donationChat.historyLoading}
          >
            Load older
          </Button>
        ) : null}
        <div className="mt-3 flex items-center gap-2 flex-row">
          <Textarea
            name="chatDraft"
            className="min-h-[44px] max-h-[120px] flex-1 py-2"
            placeholder={
              chatComposerDisabled
                ? chatLocked
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
            rows={1}
          />
          <Button
            type="button"
            size="icon-lg"
            className="shrink-0"
            disabled={chatComposerDisabled || donationChat.sendBusy}
            loading={donationChat.sendBusy}
            onClick={() => void onSendChat()}
          >
            <SendIcon className="size-4" aria-hidden />
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {isRequester === false ? (
          <Button
            variant="outline"
            type="button"
            onClick={() => setReportOpen(true)}
            disabled={reportBusy}
          >
            Report meetup
          </Button>
        ) : null}
        <Button
          variant="outline"
          type="button"
          disabled={readOnly || terminateBusy}
          onClick={() => setTerminateAlertOpen(true)}
        >
          Terminate meet
        </Button>
      </div>

      <Modal
        open={terminateAlertOpen}
        onClose={() => onTerminateDialogOpenChange(false)}
        className="w-full max-w-lg items-stretch px-0 py-0 pr-0 sm:pr-0"
      >
        <div className="w-full p-6">
          <h3 className="text-lg font-semibold text-text-primary">
            Terminate this meetup?
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            This ends the meetup for both parties. Verification and donation
            chat will stop. This cannot be undone.
          </p>

          <div className="mt-4">
            <label
              htmlFor="terminate-reason"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Reason for termination
            </label>
            <Textarea
              id="terminate-reason"
              name="terminateReason"
              rows={3}
              value={terminateReason}
              disabled={terminateBusy}
              placeholder="e.g. Donor could not attend, safety concern, wrong location…"
              aria-invalid={terminateReasonError ? true : undefined}
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

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onTerminateDialogOpenChange(false)}
              disabled={terminateBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={terminateBusy || !terminateReason.trim()}
              loading={terminateBusy}
              onClick={() => void onConfirmTerminateMeet()}
            >
              {terminateBusy ? "Terminating…" : "Terminate meet"}
            </Button>
          </div>
        </div>
      </Modal>

      <MeetupReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={onReport}
      />

      {donationChatBookingId && canPromptRequesterRating ? (
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
