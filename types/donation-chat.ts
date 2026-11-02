/** Normalized row from GET /chat/:donationId/messages or socket `chat:message`. */
export type DonationChatMessage = {
  id: string;
  text: string;
  createdAt?: string;
  /** Server role label (e.g. VerifiedRequester); no raw PII. */
  roleLabel?: string;
  kind?: string;
  senderUserId?: string;
  /** Anonymous handle when the sender object includes one. */
  senderPublicId?: string;
  /** Peer has opened/read this message (receipts). */
  seen?: boolean;
  /** Current user has opened/read this message. */
  seenByMe?: boolean;
  /** User ids who have seen it. */
  readBy?: string[];
};
