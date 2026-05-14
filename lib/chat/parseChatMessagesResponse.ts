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

/**
 * Socket.io may emit a bare record, `{ data }`, `{ message }`, JSON string, or a batch array.
 */
export function extractSocketChatPayloads(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (typeof raw === "string") {
    try {
      return extractSocketChatPayloads(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "object") return [];
  const root = unwrapApiRecord(raw) ?? (raw as Record<string, unknown>);
  if (Array.isArray(root.messages)) return root.messages;
  if (Array.isArray(root.items)) return root.items;
  if (Array.isArray(root.data)) return root.data;
  if (
    root.message &&
    typeof root.message === "object" &&
    !Array.isArray(root.message)
  ) {
    return [root.message];
  }
  if (root.payload !== undefined) {
    return extractSocketChatPayloads(root.payload);
  }
  return [root];
}

function simpleStableId(parts: string[]): string {
  const s = parts.join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `chat-${Math.abs(h).toString(36)}`;
}

/** Maps one message record from REST or socket payloads. */
export function parseDonationChatMessageRecord(
  raw: unknown,
): DonationChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = unwrapApiRecord(raw) ?? (raw as Record<string, unknown>);
  const textRaw =
    pickString(r.text ?? r.body ?? r.content ?? r.message) ?? "";
  const text = textRaw.trim();
  if (!text) return null;

  const id =
    pickString(
      r.id ??
        r._id ??
        r.messageId ??
        r.message_id ??
        r.uuid ??
        r.publicId ??
        r.public_id,
    ) ?? null;

  const roleLabel = pickString(
    r.roleLabel ?? r.role_label ?? r.senderRole ?? r.sender_role,
  );
  const kind = pickString(r.kind ?? r.type ?? r.messageType) ?? undefined;
  const senderUserId = pickString(
    r.senderUserId ??
      r.sender_user_id ??
      r.userId ??
      r.user_id ??
      r.fromUserId ??
      r.from_user_id,
  );
  const createdAt =
    pickString(r.createdAt ?? r.created_at ?? r.timestamp ?? r.sentAt) ??
    undefined;

  const resolvedId =
    id ??
    simpleStableId([
      createdAt ?? "",
      senderUserId ?? "",
      text.slice(0, 200),
    ]);

  return {
    id: resolvedId,
    text,
    ...(createdAt ? { createdAt } : {}),
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
