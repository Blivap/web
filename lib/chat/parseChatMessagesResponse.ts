import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import type { DonationChatMessage } from "@/types/donation-chat";

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function coerceArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.messages)) return o.messages;
  if (Array.isArray(o.items)) return o.items;
  if (Array.isArray(o.data)) return o.data;
  const nested = o.data;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (Array.isArray(n.messages)) return n.messages;
    if (Array.isArray(n.items)) return n.items;
  }
  return [];
}

/** Maps one message record from REST or socket payloads. */
export function parseDonationChatMessageRecord(
  raw: unknown,
): DonationChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = unwrapApiRecord(raw) ?? (raw as Record<string, unknown>);
  const id = pickString(r.id ?? r._id ?? r.messageId);
  if (!id) return null;
  const text =
    pickString(r.text ?? r.body ?? r.content ?? r.message) ?? "";
  const roleLabel = pickString(
    r.roleLabel ?? r.role_label ?? r.senderRole ?? r.sender_role,
  );
  const kind = pickString(r.kind ?? r.type ?? r.messageType) ?? undefined;
  const senderUserId = pickString(
    r.senderUserId ?? r.sender_user_id ?? r.userId ?? r.user_id,
  );
  return {
    id,
    text,
    createdAt: pickString(r.createdAt ?? r.created_at) ?? undefined,
    ...(roleLabel ? { roleLabel } : {}),
    ...(kind ? { kind } : {}),
    ...(senderUserId ? { senderUserId } : {}),
  };
}

export function parseChatMessagesResponse(body: unknown): {
  messages: DonationChatMessage[];
  nextCursor: string | null;
} {
  const root = unwrapApiRecord(body) ?? body;
  const items = coerceArray(root);
  const messages: DonationChatMessage[] = [];
  for (const item of items) {
    const m = parseDonationChatMessageRecord(item);
    if (m) messages.push(m);
  }
  let nextCursor: string | null = null;
  if (root && typeof root === "object") {
    const o = root as Record<string, unknown>;
    const meta = o.meta;
    if (meta && typeof meta === "object") {
      const mm = meta as Record<string, unknown>;
      nextCursor =
        pickString(mm.nextCursor ?? mm.next_cursor ?? mm.before ?? mm.cursor) ??
        null;
    }
  }
  return { messages, nextCursor };
}
