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
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  HelpCircle,
  Loader2,
  MoreVertical,
  Paperclip,
  PhoneOff,
  ScanIcon,
  ShieldAlert,
  ShieldCheck,
  Smile,
  UserRound,
  X,
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
import type { DonationChatMessage } from "@/types/donation-chat";
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
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal/modal.component";
import { cn } from "@/lib/utils";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import { formatPublicId } from "@/lib/users/formatPublicId";

const cardClass =
  "rounded-xl border border-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]";

export type MeetupSessionViewProps = {
  sessionId: string;
};

/** "27 Sept 2026, 14:00" */
function formatSessionEnds(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date}, ${time}`;
}

/** "11:53 pm" */
function formatChatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

/** "Feb 14, 2025" */
function formatSessionChipDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function partyHandle(publicId?: string | null): string {
  return formatPublicId(publicId) ?? "";
}

function messageIsMine(
  message: DonationChatMessage,
  userId: string | undefined,
  myRole: string | undefined,
): boolean {
  if (userId && message.senderUserId) return message.senderUserId === userId;
  const role = myRole?.toLowerCase() ?? "";
  const label = message.roleLabel?.toLowerCase() ?? "";
  if (!role || !label) return false;
  if (role === "donor") return label.includes("donor");
  if (role === "requester") return label.includes("requester");
  return label.includes(role);
}

function pickUploadedMediaUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;
  const candidates = [
    record.url,
    record.fileUrl,
    record.mediaUrl,
    nested?.url,
    nested?.fileUrl,
    nested?.mediaUrl,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

const CHAT_EMOJIS = [
  "😀",
  "😊",
  "😂",
  "🙏",
  "👍",
  "👋",
  "❤️",
  "✅",
  "🏥",
  "📍",
  "⏰",
  "🤝",
] as const;

function MessageBody({ text, mine }: { text: string; mine: boolean }) {
  const trimmed = text.trim();
  const imageMatch = trimmed.match(
    /^https?:\/\/\S+\.(?:png|jpe?g|webp|gif)(?:\?\S*)?$/i,
  );
  if (imageMatch && trimmed === text.trim() && !text.includes("\n")) {
    return (
      <a href={trimmed} target="_blank" rel="noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trimmed}
          alt="Shared image"
          className="max-h-52 max-w-full rounded-lg object-cover"
        />
      </a>
    );
  }

  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "break-all underline underline-offset-2",
              mine ? "text-primary" : "text-text-primary",
            )}
          >
            {part}
          </a>
        ) : (
          <span key={`${index}-${part.slice(0, 12)}`}>{part}</span>
        ),
      )}
    </>
  );
}

function PartyAvatar({
  src,
  className,
}: {
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6] text-text-tertiary ring-1 ring-black/5 dark:bg-white/10 dark:text-white/70 dark:ring-white/10",
        className,
      )}
      aria-hidden
    >
      {showImage ? (
        // Profile photos come from the API; next/image remote config is not required here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <UserRound className="size-4" />
      )}
    </span>
  );
}

type PlatformIdStatus = "verified" | "not_verified" | "unknown";

function platformIdStatus(v: boolean | undefined): PlatformIdStatus {
  if (v === true) return "verified";
  if (v === false) return "not_verified";
  return "unknown";
}

function MeetupVerificationRow({
  label,
  detail,
  status,
}: {
  label: string;
  detail: string;
  status: "done" | "pending" | "issue" | "unknown";
}) {
  const config = {
    done: {
      Icon: CheckCircle2,
      tone: "text-emerald-600 dark:text-emerald-400",
      text: "Done",
    },
    pending: {
      Icon: CircleDashed,
      tone: "text-amber-700 dark:text-amber-300",
      text: "Still needed",
    },
    issue: {
      Icon: ShieldAlert,
      tone: "text-amber-700 dark:text-amber-300",
      text: "Not verified",
    },
    unknown: {
      Icon: HelpCircle,
      tone: "text-text-tertiary",
      text: "Not shown",
    },
  } as const;

  const { Icon, tone, text } = config[status];

  return (
    <div className="rounded-lg border border-border/80 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#1c1c24]">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          {label}
        </p>
        <span
          className={`inline-flex shrink-0 items-center gap-1 text-xs font-medium ${tone}`}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          {text}
        </span>
      </div>
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
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border bg-white p-3 dark:bg-transparent",
        emphasize
          ? "border-[#E7B4BE] shadow-[0_0_0_1px_rgba(150,0,24,0.04)] dark:border-primary/50"
          : "border-border dark:border-white/10",
      )}
    >
      <div className="flex items-center gap-2">
        <UserRound
          className={cn(
            "size-4 shrink-0",
            emphasize ? "text-primary" : "text-text-tertiary",
          )}
          aria-hidden
        />
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {participant.role ? (
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary dark:border-white/15">
            {participant.role}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <MeetupVerificationRow
          label="Platform identity"
          detail="Government ID (NIN) on file with Blivap before the meetup."
          status={platformRowStatus}
        />
        <MeetupVerificationRow
          label="This meetup"
          detail="In-person check: you entered the other person's unique code (or scanned their QR)."
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
    <div className="mt-6">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary">
          Who is verified?
        </h3>
        <InfoHint
          title="Who is verified?"
          label="Verification checks information"
          className="size-7"
        >
          <p>
            Two separate checks: your account ID on the platform, then the in
            person step for this session only.
          </p>
        </InfoHint>
      </div>
      <div className="mt-4 flex flex-col gap-3">
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
  const [composerTall, setComposerTall] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [terminateAlertOpen, setTerminateAlertOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [terminateReasonError, setTerminateReasonError] = useState<
    string | null
  >(null);
  const [localError, setLocalError] = useState<string | null>(null);
  /** Booking id the requester dismissed the rating modal for (avoids effect-driven setState). */
  const [ratingDismissedForBookingId, setRatingDismissedForBookingId] =
    useState<string | null>(null);
  /** True once we start the post-complete snackbar → bookings redirect. */
  const [completingRedirect, setCompletingRedirect] = useState(false);
  const codeHydrateAttemptRef = useRef<string | null>(null);
  /** User was in an active meetup this mount — avoids bouncing already-completed deep links. */
  const sawActiveMeetupRef = useRef(false);
  const completionNavStartedRef = useRef(false);

  useEffect(() => {
    sawActiveMeetupRef.current = false;
    completionNavStartedRef.current = false;
    setCompletingRedirect(false);
  }, [sessionId]);
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
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const didInitialChatScrollRef = useRef(false);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const [motionMessageIds, setMotionMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
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
    if (!didInitialChatScrollRef.current) {
      el.scrollTop = el.scrollHeight;
      didInitialChatScrollRef.current = true;
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [newestChatMessageId]);

  useEffect(() => {
    const incoming = sortedChatMessages
      .map((message) => message.id)
      .filter((id) => !knownMessageIdsRef.current.has(id));
    const firstPaint = knownMessageIdsRef.current.size === 0;
    for (const message of sortedChatMessages) {
      knownMessageIdsRef.current.add(message.id);
    }
    if (incoming.length === 0) return;
    const animate = firstPaint ? incoming.slice(-6) : incoming;
    setMotionMessageIds(new Set(animate));
  }, [sortedChatMessages]);

  useEffect(() => {
    if (!emojiOpen && !moreOpen) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (emojiOpen && !emojiWrapRef.current?.contains(target)) {
        setEmojiOpen(false);
      }
      if (moreOpen && !moreWrapRef.current?.contains(target)) {
        setMoreOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEmojiOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [emojiOpen, moreOpen]);

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
    if (row?.donorPublicId) {
      return formatPublicId(row.donorPublicId) ?? undefined;
    }
    return undefined;
  }, [donationChatBookingId, sentBookings]);

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

  const ratingModalOpen = Boolean(
    !completingRedirect &&
    donationChatBookingId &&
    canPromptRequesterRating &&
    sessionLoad === "ok" &&
    session &&
    shouldPromptForRating(donationChatBookingId) &&
    ratingDismissedForBookingId !== donationChatBookingId,
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
    void dispatch(loadSentBookings({ silent: true }));
    void dispatch(loadReceivedBookings({ silent: true }));
    // Fully completed → effect shows success and routes to bookings.
    if (!res.completed) {
      showSnackbar("Your donation confirmation was recorded.");
    }
  }, [user, confirmDonation, showSnackbar, dispatch]);

  useEffect(() => {
    if (sessionLoad !== "ok" || !session) return;

    const isComplete =
      session.status?.toLowerCase() === "completed" ||
      (session.requesterDonationConfirmed === true &&
        session.donorDonationConfirmed === true);

    if (!isComplete) {
      sawActiveMeetupRef.current = true;
      return;
    }

    if (!sawActiveMeetupRef.current || completionNavStartedRef.current) {
      return;
    }
    completionNavStartedRef.current = true;
    setCompletingRedirect(true);

    const bookingId =
      session.bookingId?.trim() || stashedChatBookingId?.trim() || "";
    if (bookingId) {
      dispatch(
        patchBookingInLists({
          id: bookingId,
          status: "completed",
        }),
      );
    }
    void dispatch(loadSentBookings({ silent: true }));
    void dispatch(loadReceivedBookings({ silent: true }));

    showSnackbar("Booking completed. Taking you to your bookings…", "success");

    const params = new URLSearchParams();
    params.set("tab", "past");
    if (bookingId) params.set("bookingId", bookingId);
    const href = `${routes.bookings}?${params.toString()}`;

    const timer = window.setTimeout(() => {
      router.push(href);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    session,
    sessionLoad,
    stashedChatBookingId,
    dispatch,
    showSnackbar,
    router,
  ]);

  useEffect(() => {
    if (!canPromptRequesterRating) return;
    void dispatch(loadSentBookings({ silent: true }));
  }, [canPromptRequesterRating, dispatch]);

  useEffect(() => {
    if (!donationChat.roomClosed) return;
    void refreshSession();
  }, [donationChat.roomClosed, refreshSession]);

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

  /** Short operational status only — longer how-it-works copy lives in InfoHint. */
  const chatStatusLine = useMemo(() => {
    if (sessionLoad !== "ok") return null;
    if (session?.chatEnabled === false) {
      if (readOnly || session.status === "expired") {
        return "Donation chat is closed for this meetup.";
      }
      return "Chat unavailable until booking is accepted.";
    }
    if (!donationChatBookingId) {
      return "Chat unavailable — reopen meetup from the booking row.";
    }
    if (!token) return "Sign in again to use donation chat.";
    if (chatLocked) {
      return donationChat.roomCloseReason?.trim() || "This chat is closed.";
    }
    if (!donationChat.socketConnected && donationChatEnabled) {
      return "Connecting to live chat…";
    }
    if (donationChat.historyError) return donationChat.historyError;
    return null;
  }, [
    sessionLoad,
    session?.chatEnabled,
    session?.status,
    readOnly,
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

  const bookingRow = useMemo(() => {
    if (!donationChatBookingId) return null;
    return (
      sentBookings.find((booking) => booking.id === donationChatBookingId) ??
      receivedBookings.find(
        (booking) => booking.id === donationChatBookingId,
      ) ??
      null
    );
  }, [donationChatBookingId, sentBookings, receivedBookings]);

  const myHandle =
    partyHandle(user?.publicId) || partyHandle(session?.me.publicId) || "You";
  const peerHandle = partyHandle(session?.peer.publicId) || "Other person";
  const peerProfileImage =
    isRequester === true
      ? bookingRow?.donorProfileImage
      : isRequester === false
        ? bookingRow?.requesterProfileImage
        : (bookingRow?.donorProfileImage ?? bookingRow?.requesterProfileImage);
  const sessionChipDate = formatSessionChipDate(
    session?.scheduledAt ??
      sortedChatMessages[0]?.createdAt ??
      session?.expiresAt,
  );

  const insertEmoji = useCallback(
    (emoji: string) => {
      const field = composerRef.current;
      const start = field?.selectionStart ?? chatDraft.length;
      const end = field?.selectionEnd ?? chatDraft.length;
      const next = `${chatDraft.slice(0, start)}${emoji}${chatDraft.slice(end)}`;
      setChatDraft(next);
      donationChat.onComposerTyping();
      setEmojiOpen(false);
      const cursor = start + emoji.length;
      requestAnimationFrame(() => {
        field?.focus();
        field?.setSelectionRange(cursor, cursor);
      });
    },
    [chatDraft, donationChat],
  );

  const onAttachFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !donationChatBookingId) return;
      const allowed = /^(image\/(jpeg|png|webp)|application\/pdf)$/.test(
        file.type,
      );
      if (!allowed) {
        setLocalError("Attach a JPEG, PNG, or PDF.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setLocalError("That file is larger than 8 MB.");
        return;
      }
      setUploadBusy(true);
      setLocalError(null);
      try {
        const { status, data } = await $api.chat.uploadMedia(
          donationChatBookingId,
          file,
        );
        if (status < 200 || status >= 300) {
          setLocalError(
            getApiMessageFromData(data) ?? "Could not send that file.",
          );
          return;
        }
        const url = pickUploadedMediaUrl(data);
        if (url) {
          const sent = donationChat.sendText(url);
          if (!sent.ok) {
            setLocalError(sent.message);
            return;
          }
        } else {
          void donationChat.refetchHistory();
        }
        showSnackbar("File sent.");
      } catch (error) {
        setLocalError(getAxiosErrorMessage(error, "Could not send that file."));
      } finally {
        setUploadBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [donationChat, donationChatBookingId, showSnackbar],
  );

  if (sessionLoad === "loading" || sessionLoad === "idle") {
    return <MeetupPageSkeleton />;
  }

  if (sessionLoad === "error" || !session) {
    return (
      <div className={cn(cardClass, "m-4")}>
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

  const motionOrder = new Map(
    [...motionMessageIds].map((id, order) => [id, order]),
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {!ninOk ? (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 dark:border-amber-400/35 dark:bg-amber-950/40 dark:text-amber-100"
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
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {localError}
        </p>
      ) : null}

      <div className="relative flex min-h-0 flex-1">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <button
            type="button"
            className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-[#FAFAFB] lg:hidden dark:border-white/10 dark:hover:bg-white/5"
            onClick={() => setPanelOpen(true)}
          >
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Status
              </span>
              <span className="text-sm font-semibold capitalize text-text-primary">
                {session.status}
              </span>
            </span>
            <ChevronRight className="size-4 text-text-tertiary" aria-hidden />
          </button>

          <div
            ref={chatScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8"
          >
            {sessionChipDate ? (
              <div className="mb-6 flex justify-center">
                <span className="animate-in fade-in slide-in-from-top-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs text-text-tertiary duration-300 motion-reduce:animate-none dark:bg-white/8">
                  Session {sessionChipDate}
                </span>
              </div>
            ) : null}

            {donationChat.nextCursor ? (
              <div className="mb-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => donationChat.loadOlderMessages()}
                  disabled={donationChat.historyLoading}
                  loading={donationChat.historyLoading}
                >
                  Load earlier messages
                </Button>
              </div>
            ) : null}

            {donationChat.historyLoading && sortedChatMessages.length === 0 ? (
              <div className="space-y-4" aria-hidden>
                <div className="h-14 w-40 animate-pulse rounded-xl bg-[#F3F4F6] dark:bg-white/8" />
                <div className="ml-auto h-10 w-24 animate-pulse rounded-xl bg-[#FDE8EE] dark:bg-primary/20" />
                <div className="h-16 w-64 max-w-full animate-pulse rounded-xl bg-[#F3F4F6] dark:bg-white/8" />
              </div>
            ) : sortedChatMessages.length === 0 ? (
              <p className="animate-in fade-in py-10 text-center text-sm text-text-tertiary duration-300 motion-reduce:animate-none">
                {chatLocked ? "No messages to show." : "No messages yet."}
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {sortedChatMessages.map((message) => {
                  const mine = messageIsMine(
                    message,
                    user?.id,
                    session.me.role,
                  );
                  const timeLabel = formatChatTime(message.createdAt);
                  const handle = mine ? `${myHandle} (Me)` : peerHandle;
                  const animate = motionMessageIds.has(message.id);
                  const motionIndex = motionOrder.get(message.id) ?? 0;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        mine ? "justify-end" : "justify-start",
                        animate &&
                          "animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-300 fill-mode-backwards motion-reduce:animate-none",
                      )}
                      style={
                        animate
                          ? {
                              animationDelay: `${Math.max(0, motionIndex) * 40}ms`,
                              animationFillMode: "backwards",
                            }
                          : undefined
                      }
                    >
                      <div
                        className={cn(
                          "flex max-w-[min(100%,26rem)] items-start gap-2",
                          mine && "flex-row-reverse",
                        )}
                      >
                        <PartyAvatar
                          src={mine ? user?.profileImage : peerProfileImage}
                          className="mt-0.5"
                        />
                        <div
                          className={cn(
                            "min-w-0",
                            mine && "flex flex-col items-end",
                          )}
                        >
                          <p className="mb-1 text-xs text-text-tertiary">
                            <span className="text-text-secondary">
                              {handle}
                            </span>
                            {timeLabel ? (
                              <span className="ml-2">{timeLabel}</span>
                            ) : null}
                          </p>
                          <div
                            className={cn(
                              "inline-block rounded-xl px-3 py-2 text-left text-sm leading-relaxed wrap-break-word whitespace-pre-wrap transition-transform duration-200 motion-reduce:transition-none",
                              mine
                                ? "bg-[#FDE8EE] text-primary dark:bg-primary/20 dark:text-[#ffd6de]"
                                : "bg-[#F2F4F6] text-[#3A3A3A] dark:bg-white/8 dark:text-white/90",
                            )}
                          >
                            <MessageBody text={message.text} mine={mine} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {donationChat.typingLabel ? (
              <div className="mt-4 flex items-center gap-2" aria-live="polite">
                <PartyAvatar src={peerProfileImage} />
                <div className="animate-in fade-in slide-in-from-bottom-1 rounded-xl bg-[#F2F4F6] px-3 py-2 duration-200 motion-reduce:animate-none dark:bg-white/8">
                  <p className="text-[10px] text-text-tertiary">
                    {donationChat.typingLabel} is typing
                  </p>
                  <span className="mt-1 flex items-center gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:0ms] motion-reduce:animate-none" />
                    <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:120ms] motion-reduce:animate-none" />
                    <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:240ms] motion-reduce:animate-none" />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-border px-4 py-4 sm:px-6 dark:border-white/10">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              <span>Chat with</span>
              <PartyAvatar src={peerProfileImage} className="size-6" />
              <span className="font-medium text-text-primary">
                {peerHandle}
              </span>
              {donationChatStatusBadge ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    donationChatStatusBadge.className,
                  )}
                >
                  {donationChatStatusBadge.label}
                </span>
              ) : null}
            </div>
            {chatStatusLine ? (
              <p className="mb-2 text-xs text-text-tertiary">
                {chatStatusLine}
              </p>
            ) : null}
            {donationChat.sendError ? (
              <p
                className="mb-2 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {donationChat.sendError}
              </p>
            ) : null}

            <div
              className={cn(
                "rounded-xl border border-[#C5CDD6] bg-white p-3 transition-[border-color,box-shadow] duration-200 dark:border-white/15 dark:bg-[#111118]",
                !chatComposerDisabled &&
                  "focus-within:border-primary/45 focus-within:shadow-[0_0_0_3px_rgba(150,0,24,0.08)]",
              )}
            >
              <textarea
                ref={composerRef}
                name="chatDraft"
                aria-label="Message"
                rows={composerTall ? 5 : 2}
                value={chatDraft}
                disabled={chatComposerDisabled}
                placeholder={
                  chatLocked
                    ? "This chat is closed."
                    : !donationChat.socketConnected
                      ? "Waiting for chat connection…"
                      : "Message…"
                }
                className={cn(
                  "max-h-40 w-full resize-none border-0 bg-transparent text-sm text-text-primary outline-none transition-[min-height] duration-200 placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
                  composerTall ? "min-h-36" : "min-h-16",
                )}
                onChange={(event) => {
                  setChatDraft(event.target.value);
                  donationChat.onComposerTyping();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (!chatComposerDisabled && chatDraft.trim()) {
                      void onSendChat();
                    }
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  aria-pressed={composerTall}
                  aria-label={
                    composerTall ? "Shrink message box" : "Expand message box"
                  }
                  disabled={chatComposerDisabled}
                  className="grid size-8 place-items-center rounded-md bg-[#F8D7DE] text-sm font-semibold text-primary transition-transform duration-150 hover:scale-105 hover:bg-[#F3C4CE] active:scale-95 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none motion-reduce:hover:scale-100 dark:bg-primary/25"
                  onClick={() => setComposerTall((open) => !open)}
                >
                  T
                </button>
                <div ref={emojiWrapRef} className="relative">
                  <button
                    type="button"
                    aria-label="Insert emoji"
                    aria-expanded={emojiOpen}
                    disabled={chatComposerDisabled}
                    className="grid size-8 place-items-center rounded-md text-text-tertiary transition-transform duration-150 hover:scale-105 hover:bg-black/5 hover:text-text-primary active:scale-95 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none dark:hover:bg-white/8"
                    onClick={() => {
                      setEmojiOpen((open) => !open);
                      setMoreOpen(false);
                    }}
                  >
                    <Smile className="size-4" aria-hidden />
                  </button>
                  {emojiOpen ? (
                    <div className="absolute right-0 bottom-full z-20 mb-2 grid w-44 animate-in fade-in zoom-in-95 grid-cols-6 gap-1 rounded-xl border border-border bg-white p-2 shadow-[0_16px_40px_rgba(16,15,20,0.12)] duration-150 motion-reduce:animate-none dark:border-white/10 dark:bg-[#1a1a22]">
                      {CHAT_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="grid size-7 place-items-center rounded-md text-base transition-transform hover:scale-110 hover:bg-[#F3F4F6] active:scale-95 motion-reduce:transition-none dark:hover:bg-white/8"
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Attach a file (coming soon)"
                  title="Coming soon"
                  disabled
                  className="grid size-8 place-items-center rounded-md text-text-tertiary opacity-40"
                >
                  {uploadBusy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Paperclip className="size-4" aria-hidden />
                  )}
                </button>
                {/* File / image upload — re-enable when ready */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="sr-only"
                  tabIndex={-1}
                  disabled
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    void onAttachFile(file);
                  }}
                />
                <button
                  type="button"
                  disabled={
                    chatComposerDisabled ||
                    donationChat.sendBusy ||
                    !chatDraft.trim()
                  }
                  className="ml-1 inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:bg-[#7a0014] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
                  onClick={() => void onSendChat()}
                >
                  Send
                  {donationChat.sendBusy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <ChevronRight className="size-4" aria-hidden />
                  )}
                </button>
                <div ref={moreWrapRef} className="relative">
                  <button
                    type="button"
                    aria-label="More chat actions"
                    aria-expanded={moreOpen}
                    className="grid size-8 place-items-center rounded-md text-text-tertiary transition-transform duration-150 hover:scale-105 hover:bg-black/5 hover:text-text-primary active:scale-95 motion-reduce:transition-none dark:hover:bg-white/8"
                    onClick={() => {
                      setMoreOpen((open) => !open);
                      setEmojiOpen(false);
                    }}
                  >
                    <MoreVertical className="size-4" aria-hidden />
                  </button>
                  {moreOpen ? (
                    <div className="absolute right-0 bottom-full z-20 mb-2 w-52 animate-in fade-in zoom-in-95 rounded-xl border border-border bg-white p-1 shadow-[0_16px_40px_rgba(16,15,20,0.12)] duration-150 motion-reduce:animate-none dark:border-white/10 dark:bg-[#1a1a22]">
                      {ninOk &&
                      donationChatBookingId &&
                      !chatLocked &&
                      !donationChat.arrivedRecorded ? (
                        <button
                          type="button"
                          className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-[#F3F4F6] disabled:opacity-50 dark:hover:bg-white/8"
                          disabled={donationChat.arrivedBusy}
                          onClick={() => {
                            setMoreOpen(false);
                            void onMarkArrived();
                          }}
                        >
                          {donationChat.arrivedBusy
                            ? "Recording arrival…"
                            : "I'm here (arrived)"}
                        </button>
                      ) : null}
                      {donationChat.arrivedRecorded ? (
                        <p className="px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                          Arrival recorded
                        </p>
                      ) : null}
                      {isRequester === false ? (
                        <button
                          type="button"
                          className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-[#F3F4F6] disabled:opacity-50 dark:hover:bg-white/8"
                          disabled={reportBusy}
                          onClick={() => {
                            setMoreOpen(false);
                            setReportOpen(true);
                          }}
                        >
                          Report meetup
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/40"
                        disabled={readOnly || terminateBusy}
                        onClick={() => {
                          setMoreOpen(false);
                          setTerminateAlertOpen(true);
                        }}
                      >
                        <PhoneOff className="size-3.5" aria-hidden />
                        Terminate meet
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {panelOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/30 lg:hidden"
            aria-label="Close session details"
            onClick={() => setPanelOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "flex min-h-0 w-[min(100%,22.5rem)] shrink-0 flex-col overflow-y-auto border-border bg-white px-5 py-6 dark:border-white/10 dark:bg-[#14141a]",
            "max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-30 max-lg:border-l max-lg:shadow-2xl",
            "lg:static lg:z-auto lg:flex lg:w-[22.5rem] lg:border-l lg:shadow-none",
            panelOpen
              ? "max-lg:animate-in max-lg:slide-in-from-right max-lg:duration-200"
              : "max-lg:hidden",
          )}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="text-sm font-semibold text-text-primary">
              Session details
            </p>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-md text-text-tertiary hover:bg-black/5 dark:hover:bg-white/8"
              aria-label="Close session details"
              onClick={() => setPanelOpen(false)}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Status
              </p>
              <InfoHint
                title="Donation meetup"
                label="Meetup information"
                className="size-7"
              >
                <p>
                  Verify in person, confirm the donation when both sides are
                  ready, then you are done.
                </p>
                <p>
                  Donation chat opens after this booking is accepted. Meetup
                  verify and confirm flows do not carry chat messages.
                </p>
                <p>
                  Chat needs your booking id. If chat stays unavailable, open
                  meetup again from the booking row.
                </p>
              </InfoHint>
            </div>
            <p className="mt-1 text-2xl font-bold capitalize tracking-tight text-text-primary">
              {session.status}
            </p>
            {session.expiresAt ? (
              <p className="mt-1 text-sm text-text-secondary">
                Session ends {formatSessionEnds(session.expiresAt)}
              </p>
            ) : null}
            {readOnly ? (
              <p className="mt-2 text-xs text-text-secondary">
                This meetup is closed.
              </p>
            ) : null}
          </div>

          <MeetupVerificationSummary me={session.me} peer={session.peer} />

          {ninOk && !readOnly && !gateSatisfied ? (
            <div className="mt-6 border-t border-border pt-5 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-text-primary">
                  Verify at the hospital
                </h2>
                <InfoHint
                  title="Verify at the hospital"
                  label="Hospital verify information"
                  className="size-7"
                >
                  <p>
                    Both people must complete the in-person verify step before
                    donation confirmation unlocks.
                  </p>
                </InfoHint>
              </div>

              {myMeetupCode ? (
                <div className="mt-4">
                  {swapCodeQrUrl ? (
                    <div>
                      {!peerScannerOpen ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={verifyBusy || !ninOk}
                          onClick={() => setPeerScannerOpen(true)}
                        >
                          <ScanIcon className="size-4" aria-hidden />
                          Scan their QR
                        </Button>
                      ) : null}
                      <div className="mt-3 flex flex-col items-center gap-3 rounded-lg bg-[#FAFAFB] p-4 dark:bg-black/20">
                        <p className="text-xs font-medium text-text-primary">
                          {peerScannerOpen ? "Scan their QR" : "Your QR"}
                        </p>
                        {peerScannerOpen ? (
                          <MeetupQrScanner
                            className="w-full"
                            autoStart
                            disabled={verifyBusy || !ninOk}
                            busy={verifyBusy}
                            onStop={onPeerScannerStop}
                            onScan={onScannedPeerCode}
                          />
                        ) : (
                          <div className="rounded-lg bg-white p-3">
                            <QRCode
                              value={swapCodeQrUrl}
                              size={160}
                              level="M"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">
                  Your code is not loaded yet. Check your notification or
                  refresh this page.
                </p>
              )}

              {showCodePath ? (
                <div className="mt-4">
                  <label className="text-xs font-medium text-text-primary">
                    Other person&apos;s code
                  </label>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Ask them to share their digits or let you scan their QR.
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    <Input
                      name="meetupCode"
                      value={codeInput}
                      onChange={(e) =>
                        setCodeInput(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      disabled={verifyBusy || !ninOk}
                      containerClassName="w-full"
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
            </div>
          ) : null}

          {ninOk && gateSatisfied && !readOnly ? (
            <div className="mt-6 border-t border-border pt-5 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-text-primary">
                  Confirm donation
                </h2>
                <InfoHint
                  title="Confirm donation"
                  label="Confirm donation information"
                  className="size-7"
                >
                  <p>
                    After the donation takes place, each of you confirms once.
                    When both confirmations are in, this booking is completed.
                  </p>
                </InfoHint>
              </div>
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
            </div>
          ) : null}
        </aside>
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
          onClose={() => setRatingDismissedForBookingId(donationChatBookingId)}
          bookingId={donationChatBookingId}
          donorLabel={ratingDonorLabel}
          onSuccess={onRatingSuccess}
        />
      ) : null}
    </div>
  );
}
