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

/** The signed-in user's code to share; the other party enters or scans it. */
export function resolveMyMeetupCode(
  session: MeetupSession | null,
  meetingHint: string | null,
  userId: string | undefined,
): string | null {
  const fromHint = normalizeMeetupSixDigitCode(meetingHint);
  if (!session) return fromHint;

  const explicit =
    normalizeMeetupSixDigitCode(session.myMeetingCode) ??
    normalizeMeetupSixDigitCode(session.me.meetingCode);
  if (explicit) return explicit;

  const isReq = userId ? meetupUserIsRequester(session, userId) : null;
  const reqCode = normalizeMeetupSixDigitCode(session.requesterMeetingCode);
  const donCode = normalizeMeetupSixDigitCode(session.donorMeetingCode);
  if (isReq === true && reqCode) return reqCode;
  if (isReq === false && donCode) return donCode;

  if (fromHint) return fromHint;
  return normalizeMeetupSixDigitCode(session.meetingCode);
}
