import type { DonationChatMessage } from "@/types/donation-chat";

export function sortDonationChatMessages(
  a: DonationChatMessage,
  b: DonationChatMessage,
): number {
  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}
