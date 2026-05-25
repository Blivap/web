import type { MeetupSession } from "@/types/meetups";

/** Resolves whether the signed-in user is the blood requester (buyer) for this meetup. */
export function meetupUserIsRequester(
  session: MeetupSession,
  userId: string,
): boolean | null {
  if (session.requesterUserId === userId) return true;
  if (session.donorUserId === userId) return false;
  const role = session.me.role?.toLowerCase();
  if (role === "requester") return true;
  if (role === "donor") return false;
  return null;
}

export function meetupVerificationGateSatisfied(
  session: MeetupSession,
): boolean {
  if (session.verificationGateSatisfied === true) return true;
  if (session.status === "completed") return true;
  const reqAt = session.requesterCodeVerifiedAt;
  const donAt = session.donorCodeVerifiedAt;
  if (
    typeof reqAt === "string" &&
    reqAt.trim().length > 0 &&
    typeof donAt === "string" &&
    donAt.trim().length > 0
  ) {
    return true;
  }
  const qrAt = session.qrConsumedAt;
  if (typeof qrAt === "string" && qrAt.trim().length > 0) {
    return true;
  }
  return (
    session.me.meetupVerified === true && session.peer.meetupVerified === true
  );
}

export function meetupReadOnly(session: MeetupSession): boolean {
  const s = session.status?.toLowerCase();
  return s === "completed" || s === "expired" || s === "cancelled";
}
