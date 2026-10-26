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
  BadgeCheck,
  Camera,
  ChevronRight,
  Loader2,
  MoreVertical,
  Paperclip,
  PhoneOff,
  Smile,
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
import type { DonationChatMessage } from "@/types/donation-chat";
import type { MeetupReportPayload } from "@/types/meetups";
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
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal/modal.component";
import { cn } from "@/lib/utils";
import {
  getApiMessageFromData,
  getAxiosErrorMessage,
} from "@/lib/bookings/axiosErrorMessage";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import { formatPublicId } from "@/lib/users/formatPublicId";

const cardClass =
  "rounded-xl border border-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]";

export type MeetupSessionViewProps = {
  sessionId: string;
};

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

function profileRecord(body: unknown): Record<string, unknown> | null {
  const root = unwrapApiRecord(body);
  if (root && typeof root === "object") return root as Record<string, unknown>;
  if (body && typeof body === "object") return body as Record<string, unknown>;
  return null;
}

function publicIdFromProfileBody(body: unknown): string | null {
  const record = profileRecord(body);
  if (!record) return null;
  const direct = formatPublicId(
    typeof record.publicId === "string"
      ? record.publicId
      : typeof record.public_id === "string"
        ? record.public_id
        : null,
  );
  if (direct) return direct;
  const user = record.user;
  if (!user || typeof user !== "object") return null;
  const nested = user as Record<string, unknown>;
  return formatPublicId(
    typeof nested.publicId === "string"
      ? nested.publicId
      : typeof nested.public_id === "string"
        ? nested.public_id
        : null,
  );
}

function profileImageFromProfileBody(body: unknown): string | null {
  const record = profileRecord(body);
  if (!record) return null;
  const raw =
    record.profileImageUrl ??
    record.profile_image_url ??
    record.profileImage ??
    record.profile_image ??
    record.avatarUrl ??
    record.avatar;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

/** Server posts this when a request is accepted. It is not a user message. */
function isSeededAcceptanceNotice(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
  return (
    normalized ===
      "donation request accepted. you can now coordinate your meetup." ||
    normalized ===
      "donation request accepted. you can now coordinate your meetup"
  );
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

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
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <UserRound className="size-4" />
      )}
    </span>
  );
}

function MeetupVerifiedMark() {
  return (
    <BadgeCheck
      className="size-3.5 shrink-0 fill-[#1D9BF0] text-white"
      aria-label="Verified"
    />
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
  const [qrPanelOpen, setQrPanelOpen] = useState(false);
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
  const chatHistoryRefetchRef = useRef<string | null>(null);
  const bookingHydrateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!donationChatEnabled || !donationChatBookingId) return;
    if (chatHistoryRefetchRef.current === donationChatBookingId) return;
    chatHistoryRefetchRef.current = donationChatBookingId;
    void donationChat.refetchHistory();
  }, [
    donationChat.refetchHistory,
    donationChatBookingId,
    donationChatEnabled,
  ]);

  useEffect(() => {
    if (!donationChatBookingId) return;

    const row =
      sentBookings.find((booking) => booking.id === donationChatBookingId) ??
      receivedBookings.find(
        (booking) => booking.id === donationChatBookingId,
      );
    const hasPeerImage = Boolean(
      session?.peer.profileImage ||
        row?.donorProfileImage ||
        row?.requesterProfileImage,
    );
    const hasMeetupCode = Boolean(
      normalizeMeetupSixDigitCode(row?.meetingCode),
    );
    if (hasPeerImage && hasMeetupCode) return;
    if (bookingHydrateRef.current === donationChatBookingId) return;
    bookingHydrateRef.current = donationChatBookingId;
    void dispatch(loadSentBookings({ silent: true }));
    void dispatch(loadReceivedBookings({ silent: true }));
  }, [
    donationChatBookingId,
    dispatch,
    receivedBookings,
    sentBookings,
    session?.peer.profileImage,
  ]);

  const sortedChatMessages = useMemo(() => {
    return [...donationChat.messages].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.id.localeCompare(b.id);
    });
  }, [donationChat.messages]);

  const visibleChatMessages = useMemo(
    () =>
      sortedChatMessages.filter(
        (message) => !isSeededAcceptanceNotice(message.text),
      ),
    [sortedChatMessages],
  );

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
    visibleChatMessages.length > 0
      ? visibleChatMessages[visibleChatMessages.length - 1]!.id
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
    const incoming = visibleChatMessages
      .map((message) => message.id)
      .filter((id) => !knownMessageIdsRef.current.has(id));
    const firstPaint = knownMessageIdsRef.current.size === 0;
    for (const message of visibleChatMessages) {
      knownMessageIdsRef.current.add(message.id);
    }
    if (incoming.length === 0) return;
    const animate = firstPaint ? incoming.slice(-6) : incoming;
    setMotionMessageIds(new Set(animate));
  }, [visibleChatMessages]);

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

  const iVerifiedMeetup = session?.me.meetupVerified === true;
  const showCodePath =
    session &&
    session.codeVerificationEnabled !== false &&
    !readOnly &&
    !gateSatisfied &&
    !iVerifiedMeetup;
  const waitingOnPeerVerify =
    Boolean(ninOk) &&
    Boolean(session) &&
    !readOnly &&
    iVerifiedMeetup &&
    !gateSatisfied;
  const showConfirmDonation =
    Boolean(ninOk) && gateSatisfied && !readOnly && !myDonationDone;

  useEffect(() => {
    if (ninOk && showCodePath) return;
    setQrPanelOpen(false);
    setPeerScannerOpen(false);
  }, [ninOk, showCodePath]);

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

  const peerPublicIdFromSession =
    session?.peer.publicId ??
    (isRequester === true
      ? bookingRow?.donorPublicId
      : isRequester === false
        ? bookingRow?.requesterPublicId
        : (bookingRow?.donorPublicId ?? bookingRow?.requesterPublicId));
  const peerUserId =
    isRequester === true
      ? (session?.donorUserId ?? bookingRow?.donorUserId ?? "")
      : isRequester === false
        ? (session?.requesterUserId ?? bookingRow?.requesterId ?? "")
        : (session?.peer.userId ??
          session?.donorUserId ??
          bookingRow?.donorUserId ??
          "");
  const peerPublicIdFromChat = sortedChatMessages.find(
    (message) =>
      message.senderPublicId &&
      !messageIsMine(message, user?.id, session?.me.role),
  )?.senderPublicId;
  const [resolvedPeerPublicId, setResolvedPeerPublicId] = useState<
    string | null
  >(null);
  const [resolvedPeerProfile, setResolvedPeerProfile] = useState<{
    userId: string;
    image: string;
  } | null>(null);
  const resolvedPeerProfileImage =
    resolvedPeerProfile?.userId === peerUserId.trim()
      ? resolvedPeerProfile.image
      : null;
  const bookingPeerProfileImage =
    isRequester === true
      ? bookingRow?.donorProfileImage
      : isRequester === false
        ? bookingRow?.requesterProfileImage
        : (bookingRow?.donorProfileImage ?? bookingRow?.requesterProfileImage);

  useEffect(() => {
    const needsPublicId =
      !partyHandle(peerPublicIdFromSession) &&
      !partyHandle(peerPublicIdFromChat);
    const needsImage = !bookingPeerProfileImage;
    if (!needsPublicId && !needsImage) return;
    const id = peerUserId.trim();
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const { status, data } = await $api.donors.publicByUserId(id);
        if (cancelled || status < 200 || status >= 300) return;
        if (needsPublicId) {
          const publicId = publicIdFromProfileBody(data);
          if (publicId) setResolvedPeerPublicId(publicId);
        }
        if (needsImage) {
          const image = profileImageFromProfileBody(data);
          if (image) setResolvedPeerProfile({ userId: id, image });
        }
      } catch {
        /* public profile may be unavailable for non-donors */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    bookingPeerProfileImage,
    peerPublicIdFromSession,
    peerPublicIdFromChat,
    peerUserId,
  ]);

  const peerHandle =
    partyHandle(peerPublicIdFromSession) ||
    partyHandle(peerPublicIdFromChat) ||
    partyHandle(resolvedPeerPublicId) ||
    "Other person";
  const peerProfileImage =
    session?.peer.profileImage ||
    bookingPeerProfileImage ||
    resolvedPeerProfileImage ||
    undefined;
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

  const waitingOnChat =
    sessionLoad === "ok" && donationChatEnabled && !donationChat.historyLoaded;

  if (sessionLoad === "loading" || sessionLoad === "idle" || waitingOnChat) {
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

            {visibleChatMessages.length === 0 ? (
              <p className="animate-in fade-in py-10 text-center text-sm text-text-tertiary duration-300 motion-reduce:animate-none">
                {chatLocked ? "No messages to show." : "No messages yet."}
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {visibleChatMessages.map((message) => {
                  const mine = messageIsMine(
                    message,
                    user?.id,
                    session.me.role,
                  );
                  const timeLabel = formatChatTime(message.createdAt);
                  const handle = mine ? "(Me)" : peerHandle;
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
                          <p
                            className={cn(
                              "mb-1 flex items-center gap-1 text-xs text-text-tertiary",
                              mine && "justify-end",
                            )}
                          >
                            <span className="text-text-secondary">
                              {handle}
                            </span>
                            {(
                              mine
                                ? session.me.meetupVerified
                                : session.peer.meetupVerified
                            ) ? (
                              <MeetupVerifiedMark />
                            ) : null}
                            {timeLabel ? <span>{timeLabel}</span> : null}
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
          </div>

          {donationChat.typingLabel ? (
            <div
              className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-2 sm:px-6 dark:border-white/10"
              aria-live="polite"
            >
              <PartyAvatar src={peerProfileImage} className="size-6" />
              <p className="min-w-0 truncate text-xs text-text-secondary">
                {peerHandle} is typing
              </p>
              <span className="inline-flex shrink-0 items-center gap-1" aria-hidden>
                <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:0ms] motion-reduce:animate-none" />
                <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:120ms] motion-reduce:animate-none" />
                <span className="size-1.5 animate-bounce rounded-full bg-text-tertiary [animation-delay:240ms] motion-reduce:animate-none" />
              </span>
            </div>
          ) : null}

          {ninOk && showCodePath && qrPanelOpen && swapCodeQrUrl ? (
            <div className="flex flex-col items-center gap-2 border-t border-border bg-[#FAFAFB] px-4 py-3 dark:border-white/10 dark:bg-black/25">
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={verifyBusy}
                onClick={() => setPeerScannerOpen((open) => !open)}
              >
                <Camera className="size-3.5" aria-hidden />
                {peerScannerOpen ? "Close camera" : "Open camera"}
              </Button>
              <div className="relative size-44 overflow-hidden rounded-lg bg-white">
                {peerScannerOpen ? (
                  <MeetupQrScanner
                    className="size-full"
                    regionOnly
                    autoStart
                    disabled={verifyBusy}
                    busy={verifyBusy}
                    onScan={onScannedPeerCode}
                  />
                ) : (
                  <div className="grid size-full place-items-center p-2">
                    <QRCode value={swapCodeQrUrl} size={152} level="M" />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="border-t border-border px-4 py-4 sm:px-6 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm text-text-secondary">
                <PartyAvatar src={peerProfileImage} className="size-6" />
                <span className="hidden min-w-0 items-center gap-1 font-medium text-text-primary sm:inline-flex">
                  <span className="truncate">{peerHandle}</span>
                  {session.peer.meetupVerified ? <MeetupVerifiedMark /> : null}
                </span>
                {donationChatStatusBadge ? (
                  <span
                    className={cn(
                      "hidden shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline-flex",
                      donationChatStatusBadge.className,
                    )}
                  >
                    {donationChatStatusBadge.label}
                  </span>
                ) : null}
              </div>
              {waitingOnPeerVerify ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                  <span className="size-1.5 animate-pulse rounded-full bg-amber-300" />
                  Pending
                </span>
              ) : showConfirmDonation ? (
                <Button
                  type="button"
                  size="xs"
                  className="shrink-0"
                  disabled={confirmBusy || isRequester === null}
                  loading={confirmBusy}
                  onClick={() => void onConfirmDonation()}
                >
                  Confirm donation
                </Button>
              ) : ninOk && showCodePath ? (
                <div className="flex shrink-0 items-center gap-2">
                  <input
                    name="meetupCode"
                    aria-label="Other person's code"
                    value={codeInput}
                    onChange={(event) =>
                      setCodeInput(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    disabled={verifyBusy}
                    className="h-8 w-28 rounded-md border border-border bg-white px-2 text-center font-mono text-sm tracking-widest text-text-primary outline-none placeholder:tracking-widest placeholder:text-text-tertiary focus:border-primary/45 disabled:opacity-50 dark:border-white/15 dark:bg-[#111118]"
                  />
                  <Button
                    type="button"
                    size="xs"
                    disabled={verifyBusy}
                    loading={verifyBusy}
                    onClick={() => void onVerifyCode()}
                  >
                    Verify
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={!swapCodeQrUrl || verifyBusy}
                    onClick={() =>
                      setQrPanelOpen((open) => {
                        if (open) setPeerScannerOpen(false);
                        return !open;
                      })
                    }
                  >
                    {qrPanelOpen ? "Hide QR" : "Show QR"}
                  </Button>
                  <InfoHint
                    title="Verify at the hospital"
                    label="Hospital verify information"
                    className="size-7 shrink-0"
                  >
                    <p>
                      Enter the other person&apos;s six-digit code, or show your
                      QR so they can scan it. Open the camera to scan theirs in
                      the same square.
                    </p>
                  </InfoHint>
                </div>
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
                  "max-h-40 w-full resize-none border-0 bg-transparent text-base sm:text-sm text-text-primary outline-none transition-[min-height] duration-200 placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
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
