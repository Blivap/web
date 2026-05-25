import type { MeetupSession } from "@/types/meetups";
import { meetupUserIsRequester } from "@/lib/meetups/meetupSessionDerived";

export function normalizeMeetupSixDigitCode(
  raw: string | number | null | undefined,
): string | null {
  const d = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 12);
  return d.length === 6 ? d : null;
}

export type MeetupSwapCodes = {
  /** Code this user should show the other party. */
  myCode: string | null;
  /** Other party's code (for validation only; not always returned by API). */
  peerCode: string | null;
};

function sessionHasDistinctRoleCodes(session: MeetupSession): boolean {
  const requesterCode = normalizeMeetupSixDigitCode(session.requesterMeetingCode);
  const donorCode = normalizeMeetupSixDigitCode(session.donorMeetingCode);
  if (requesterCode && donorCode && requesterCode !== donorCode) return true;

  const myExplicit = normalizeMeetupSixDigitCode(session.myMeetingCode);
  const peerExplicit = normalizeMeetupSixDigitCode(session.peerMeetingCode);
  if (myExplicit && peerExplicit && myExplicit !== peerExplicit) return true;

  const meCode = normalizeMeetupSixDigitCode(session.me.meetingCode);
  const peerCode = normalizeMeetupSixDigitCode(session.peer.meetingCode);
  if (meCode && peerCode && meCode !== peerCode) return true;

  return false;
}

/** Resolves codes for display and client-side guards. */
export function resolveMeetupSwapCodes(
  session: MeetupSession | null,
  meetingHint: string | null,
  userId: string | undefined,
): MeetupSwapCodes {
  const hint = normalizeMeetupSixDigitCode(meetingHint);

  if (!session) {
    return { myCode: hint, peerCode: null };
  }

  if (!sessionHasDistinctRoleCodes(session)) {
    const shared =
      normalizeMeetupSixDigitCode(session.myMeetingCode) ??
      normalizeMeetupSixDigitCode(session.meetingCode) ??
      hint;
    return { myCode: shared, peerCode: shared };
  }

  const isReq = userId ? meetupUserIsRequester(session, userId) : null;

  let requesterCode = normalizeMeetupSixDigitCode(session.requesterMeetingCode);
  let donorCode = normalizeMeetupSixDigitCode(session.donorMeetingCode);

  let myCode =
    normalizeMeetupSixDigitCode(session.myMeetingCode) ??
    normalizeMeetupSixDigitCode(session.me.meetingCode);
  let peerCode =
    normalizeMeetupSixDigitCode(session.peerMeetingCode) ??
    normalizeMeetupSixDigitCode(session.peer.meetingCode);

  if (isReq === true) {
    requesterCode = requesterCode ?? myCode;
    donorCode = donorCode ?? peerCode;
    myCode = myCode ?? requesterCode;
    peerCode = peerCode ?? donorCode;
  } else if (isReq === false) {
    requesterCode = requesterCode ?? peerCode;
    donorCode = donorCode ?? myCode;
    myCode = myCode ?? donorCode;
    peerCode = peerCode ?? requesterCode;
  }

  if (!myCode && hint && isReq === true && requesterCode && hint === requesterCode) {
    myCode = requesterCode;
  }
  if (!myCode && hint && isReq === false && donorCode && hint === donorCode) {
    myCode = donorCode;
  }

  return { myCode, peerCode };
}

/** @deprecated Use resolveMeetupSwapCodes — returns only your code to share. */
export function resolveMyMeetupCode(
  session: MeetupSession | null,
  meetingHint: string | null,
  userId: string | undefined,
): string | null {
  return resolveMeetupSwapCodes(session, meetingHint, userId).myCode;
}

/** True only when we know the entered digits are this user's own share code. */
export function isOwnMeetupCodeForVerify(
  entered: string,
  swap: MeetupSwapCodes,
): boolean {
  const digits = normalizeMeetupSixDigitCode(entered);
  if (!digits || !swap.myCode) return false;
  if (swap.peerCode && swap.peerCode === swap.myCode) return false;
  return digits === swap.myCode;
}
