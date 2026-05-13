/** Normalized row from GET /chat/:donationId/messages or socket `chat:message`. */
export type DonationChatMessage = {
  id: string;
  text: string;
  createdAt?: string;
  /** Server role label (e.g. VerifiedRequester); no raw PII. */
  roleLabel?: string;
  kind?: string;
  senderUserId?: string;
};
