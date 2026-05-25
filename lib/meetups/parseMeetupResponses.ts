import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type {
  MeetupEnsureSessionResponse,
  MeetupParticipant,
  MeetupSession,
  MeetupSessionStatus,
} from "@/types/meetups";

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function pickBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  return undefined;
}

function parseParticipant(raw: unknown): MeetupParticipant {
  if (!raw || typeof raw !== "object") return {};
  const o = unwrapApiRecord(raw) ?? (raw as Record<string, unknown>);
  const userId = pickString(o.userId ?? o.id ?? o._id);
  const roleRaw = pickString(o.role ?? o.participantRole);
  const roleLower = roleRaw?.toLowerCase();
  const role =
    roleLower === "requester" || roleLower === "donor"
      ? roleLower
      : (roleRaw ?? undefined);
  const meetingRaw = o.meetingCode ?? o.meeting_code;
  const meetingCode =
    pickString(meetingRaw) ??
    (typeof meetingRaw === "number" && Number.isFinite(meetingRaw)
      ? String(meetingRaw).padStart(6, "0")
      : null);

  return {
    ...(userId ? { userId } : {}),
    ...(role ? { role } : {}),
    ...(meetingCode ? { meetingCode } : {}),
    ...(() => {
      const iv = pickBool(
        o.identityVerified ?? o.identity_verified,
      );
      return iv !== undefined ? { identityVerified: iv } : {};
    })(),
    ...(() => {
      const mv = pickBool(
        o.meetupVerified ??
          o.meetup_verified ??
          o.verifiedAtMeetup ??
          o.sessionVerified ??
          o.verified,
      );
      return mv !== undefined ? { meetupVerified: mv } : {};
    })(),
    ...(() => {
      const dc = pickBool(
        o.donationConfirmed ?? o.donation_confirmed,
      );
      return dc !== undefined ? { donationConfirmed: dc } : {};
    })(),
  };
}

function parseStatus(raw: unknown): MeetupSessionStatus {
  const s = pickString(raw);
  if (!s) return "active";
  return s.toLowerCase() as MeetupSessionStatus;
}

/** Normalizes GET /meetups/:id bodies. */
export function parseMeetupSessionBody(body: unknown): MeetupSession | null {
  const root = unwrapApiRecord(body) ?? body;
  if (!root || typeof root !== "object") return null;
  const r = root as Record<string, unknown>;
  const id =
    pickString(r.id ?? r.sessionId ?? r._id) ??
    pickString((unwrapApiRecord(body) as Record<string, unknown> | null)?.id);
  if (!id) return null;

  const status = parseStatus(r.status);
  const chatEnabled = pickBool(r.chatEnabled ?? r.chat_enabled) ?? true;

  const requesterDonationConfirmed =
    pickBool(
      r.requesterDonationConfirmed ?? r.requester_donation_confirmed,
    ) ?? false;
  const donorDonationConfirmed =
    pickBool(r.donorDonationConfirmed ?? r.donor_donation_confirmed) ?? false;

  const reqVerifiedAt = pickString(
    r.requesterCodeVerifiedAt ?? r.requester_code_verified_at,
  );
  const donVerifiedAt = pickString(
    r.donorCodeVerifiedAt ?? r.donor_code_verified_at,
  );
  const qrConsumedAt = pickString(r.qrConsumedAt ?? r.qr_consumed_at);
  const scheduledAt = pickString(r.scheduledAt ?? r.scheduled_at);
  const hospitalIdFromSession = pickString(r.hospitalId ?? r.hospital_id);

  const requesterUserId = pickString(
    r.requesterUserId ?? r.requester_user_id ?? r.requesterId,
  );
  const donorUserId = pickString(r.donorUserId ?? r.donor_user_id);

  const bookingRaw = unwrapApiRecord(r.booking) ?? r.booking;
  let reqId: string | null = requesterUserId;
  let donId: string | null = donorUserId;
  /** Chat + REST `/chat/:donationId/...` use the booking Mongo id — not the meetup session id. */
  let bookingId =
    pickString(r.bookingId ?? r.booking_id) ??
    undefined;
  if (bookingRaw && typeof bookingRaw === "object") {
    const b = bookingRaw as Record<string, unknown>;
    if (!reqId) reqId = pickString(b.requesterId ?? b.requester_id);
    if (!donId) donId = pickString(b.donorUserId ?? b.donor_user_id);
    if (!bookingId) {
      bookingId =
        pickString(b.id ?? b._id ?? b.bookingId ?? b.booking_id) ?? undefined;
    }
  }

  let verificationGateSatisfied = pickBool(
    r.verificationGateSatisfied ??
      r.verification_gate_satisfied ??
      r.donationConfirmEnabled ??
      r.donation_confirm_enabled,
  );
  if (verificationGateSatisfied !== true && reqVerifiedAt && donVerifiedAt) {
    verificationGateSatisfied = true;
  }
  if (verificationGateSatisfied !== true && qrConsumedAt) {
    verificationGateSatisfied = true;
  }

  const codeVerificationEnabled = pickBool(
    r.codeVerificationEnabled ??
      r.code_verification_enabled ??
      r.showCodeEntry ??
      r.codeEnabled,
  );
  const qrVerificationEnabled = pickBool(
    r.qrVerificationEnabled ?? r.qr_verification_enabled ?? r.qrEnabled,
  );

  const meetingRawRoot = r.meetingCode ?? r.meeting_code;
  let meetingCode: string | null =
    pickString(meetingRawRoot) ??
    (typeof meetingRawRoot === "number" && Number.isFinite(meetingRawRoot)
      ? String(meetingRawRoot).padStart(6, "0")
      : null);
  if (!meetingCode && bookingRaw && typeof bookingRaw === "object") {
    const b = bookingRaw as Record<string, unknown>;
    const mcRaw = b.meetingCode ?? b.meeting_code;
    meetingCode =
      pickString(mcRaw) ??
      (typeof mcRaw === "number" && Number.isFinite(mcRaw)
        ? String(mcRaw).padStart(6, "0")
        : null);
  }

  const myMeetingRaw =
    r.myMeetingCode ?? r.my_meeting_code ?? r.myCode ?? r.my_code;
  const myMeetingCode =
    pickString(myMeetingRaw) ??
    (typeof myMeetingRaw === "number" && Number.isFinite(myMeetingRaw)
      ? String(myMeetingRaw).padStart(6, "0")
      : null);

  const peerMeetingRaw =
    r.peerMeetingCode ?? r.peer_meeting_code ?? r.peerCode ?? r.peer_code;
  const peerMeetingCode =
    pickString(peerMeetingRaw) ??
    (typeof peerMeetingRaw === "number" && Number.isFinite(peerMeetingRaw)
      ? String(peerMeetingRaw).padStart(6, "0")
      : null);

  const requesterMeetingRaw =
    r.requesterMeetingCode ?? r.requester_meeting_code;
  const requesterMeetingCode =
    pickString(requesterMeetingRaw) ??
    (typeof requesterMeetingRaw === "number" &&
    Number.isFinite(requesterMeetingRaw)
      ? String(requesterMeetingRaw).padStart(6, "0")
      : null);

  const donorMeetingRaw = r.donorMeetingCode ?? r.donor_meeting_code;
  const donorMeetingCode =
    pickString(donorMeetingRaw) ??
    (typeof donorMeetingRaw === "number" && Number.isFinite(donorMeetingRaw)
      ? String(donorMeetingRaw).padStart(6, "0")
      : null);

  let me = parseParticipant(r.me);
  let peer = parseParticipant(r.peer);
  const meRole = me.role?.toLowerCase();

  if (me.meetupVerified === undefined || peer.meetupVerified === undefined) {
    if (meRole === "requester") {
      me = {
        ...me,
        ...(me.meetupVerified === undefined
          ? { meetupVerified: Boolean(reqVerifiedAt) }
          : {}),
      };
      peer = {
        ...peer,
        ...(peer.meetupVerified === undefined
          ? { meetupVerified: Boolean(donVerifiedAt) }
          : {}),
      };
    } else if (meRole === "donor") {
      me = {
        ...me,
        ...(me.meetupVerified === undefined
          ? { meetupVerified: Boolean(donVerifiedAt) }
          : {}),
      };
      peer = {
        ...peer,
        ...(peer.meetupVerified === undefined
          ? { meetupVerified: Boolean(reqVerifiedAt) }
          : {}),
      };
    } else if (reqVerifiedAt && donVerifiedAt) {
      me = {
        ...me,
        ...(me.meetupVerified === undefined ? { meetupVerified: true } : {}),
      };
      peer = {
        ...peer,
        ...(peer.meetupVerified === undefined ? { meetupVerified: true } : {}),
      };
    }
  }

  return {
    id,
    status,
    chatEnabled,
    expiresAt: pickString(r.expiresAt ?? r.expires_at),
    verificationCodeExpiresAt: pickString(
      r.verificationCodeExpiresAt ?? r.verification_code_expires_at,
    ),
    ...(codeVerificationEnabled !== undefined
      ? { codeVerificationEnabled }
      : {}),
    ...(qrVerificationEnabled !== undefined
      ? { qrVerificationEnabled }
      : {}),
    requesterDonationConfirmed,
    donorDonationConfirmed,
    ...(verificationGateSatisfied !== undefined
      ? { verificationGateSatisfied }
      : {}),
    me,
    peer,
    ...(meetingCode ? { meetingCode } : { meetingCode: null }),
    ...(myMeetingCode ? { myMeetingCode } : {}),
    ...(peerMeetingCode ? { peerMeetingCode } : {}),
    ...(requesterMeetingCode ? { requesterMeetingCode } : {}),
    ...(donorMeetingCode ? { donorMeetingCode } : {}),
    ...(bookingId ? { bookingId } : {}),
    ...(reqId ? { requesterUserId: reqId } : {}),
    ...(donId ? { donorUserId: donId } : {}),
    ...(reqVerifiedAt
      ? { requesterCodeVerifiedAt: reqVerifiedAt }
      : { requesterCodeVerifiedAt: null }),
    ...(donVerifiedAt
      ? { donorCodeVerifiedAt: donVerifiedAt }
      : { donorCodeVerifiedAt: null }),
    ...(qrConsumedAt ? { qrConsumedAt } : { qrConsumedAt: null }),
    ...(scheduledAt ? { scheduledAt } : {}),
    ...(hospitalIdFromSession ? { hospitalId: hospitalIdFromSession } : {}),
  };
}

export function parseMeetupEnsureSessionBody(
  body: unknown,
): MeetupEnsureSessionResponse | null {
  const r = unwrapApiRecord(body) ?? body;
  if (!r || typeof r !== "object") return null;
  const o = r as Record<string, unknown>;
  const sessionId = pickString(o.sessionId ?? o.session_id ?? o.id);
  if (!sessionId) return null;
  const alreadyExists = Boolean(
    o.alreadyExists ?? o.already_exists ?? o.existing,
  );
  const meetingRaw = o.meetingCode ?? o.meeting_code;
  const meetingCode =
    pickString(meetingRaw) ??
    (typeof meetingRaw === "number" && Number.isFinite(meetingRaw)
      ? String(meetingRaw).padStart(6, "0")
      : null);
  const qrToken = pickString(o.qrToken ?? o.qr_token);
  return {
    alreadyExists,
    sessionId,
    meetingCode,
    qrToken,
  };
}
