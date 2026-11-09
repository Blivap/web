/**
 * Bliiva's JSON body is the HTTP payload.
 * Blivap does not wrap it again in `{ message, data }`.
 * A missing Blivap JWT is a normal 401, not this envelope.
 */

export const SUPPORT_RESPONSE_TYPES = [
  "ANSWERED",
  "CLARIFICATION_REQUIRED",
  "ACTION_COMPLETED",
  "ACTION_CONFIRMATION_REQUIRED",
  "ESCALATED",
  "HUMAN_HANDLING",
  "UNSUPPORTED",
  "TEMPORARY_ERROR",
] as const;

export type SupportResponseType = (typeof SUPPORT_RESPONSE_TYPES)[number];

export type SupportSenderType = "user" | "bot" | "agent" | "system";

export type BliivaPageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SupportChatMessage = {
  id: string;
  senderType: SupportSenderType;
  content: string;
  messageType: string;
  createdAt: string | null;
};

export type SupportPendingClarification = {
  question: string;
  options: string[];
};

export type SupportConversation = {
  id: string;
  status: string;
  category: string;
  currentIntent: string | null;
  priority: string;
  lastMessageAt: string | null;
  state: string;
  pendingClarification: SupportPendingClarification | null;
};

export type SupportTurn = {
  conversationId: string;
  responseType: SupportResponseType;
  reference: string | null;
  message: SupportChatMessage;
  state: SupportConversation;
};

const RESPONSE_TYPE_SET = new Set<string>(SUPPORT_RESPONSE_TYPES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nullableText(value: unknown): string | null {
  if (value == null) return null;
  return typeof value === "string" ? value : null;
}

export function parseBliivaPageMeta(value: unknown): BliivaPageMeta | null {
  if (!isRecord(value)) return null;
  const page = value.page;
  const limit = value.limit;
  const total = value.total;
  const totalPages = value.totalPages;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    return null;
  }
  return { page, limit, total, totalPages };
}

export function parseSupportMessage(value: unknown): SupportChatMessage | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const content = typeof value.content === "string" ? value.content : null;
  if (!id || content == null) return null;
  const sender = value.senderType;
  const senderType: SupportSenderType =
    sender === "user" ||
    sender === "bot" ||
    sender === "agent" ||
    sender === "system"
      ? sender
      : "bot";
  return {
    id,
    senderType,
    content,
    messageType: text(value.messageType) ?? "text",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : null,
  };
}

export function parsePendingClarification(
  value: unknown,
): SupportPendingClarification | null {
  if (!isRecord(value) || !Array.isArray(value.options)) return null;
  const options: string[] = [];
  for (const option of value.options) {
    if (typeof option === "string" && option.trim()) {
      options.push(option.trim());
      continue;
    }
    if (isRecord(option)) {
      const label = text(option.label);
      if (label) options.push(label);
    }
  }
  const question = typeof value.question === "string" ? value.question : "";
  if (!question && options.length === 0) return null;
  return { question, options };
}

export function parseSupportConversation(
  value: unknown,
): SupportConversation | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  if (!id) return null;
  return {
    id,
    status: text(value.status) ?? "bot",
    category: text(value.category) ?? "general_enquiries",
    currentIntent: nullableText(value.currentIntent),
    priority: text(value.priority) ?? "medium",
    lastMessageAt:
      typeof value.lastMessageAt === "string" ? value.lastMessageAt : null,
    state: text(value.state) ?? "idle",
    pendingClarification: parsePendingClarification(value.pendingClarification),
  };
}

export function parseSupportTurn(value: unknown): SupportTurn | null {
  if (!isRecord(value)) return null;
  const message = parseSupportMessage(value.message);
  const state = parseSupportConversation(value.state);
  if (!message || !state) return null;
  const responseType = value.responseType;
  const known =
    typeof responseType === "string" && RESPONSE_TYPE_SET.has(responseType)
      ? (responseType as SupportResponseType)
      : "ANSWERED";
  return {
    conversationId: text(value.conversationId) ?? state.id,
    responseType: known,
    reference: nullableText(value.reference),
    message,
    state,
  };
}

export function parseSupportMessages(
  value: unknown,
): SupportChatMessage[] | null {
  if (!Array.isArray(value)) return null;
  const messages: SupportChatMessage[] = [];
  for (const item of value) {
    const message = parseSupportMessage(item);
    if (message) messages.push(message);
  }
  return messages;
}

/** Newest-first pages become oldest-first for the thread. */
export function chronologicalMessages(
  messages: SupportChatMessage[],
): SupportChatMessage[] {
  return [...messages].reverse();
}

export type BliivaRead<T> = {
  message: string;
  data: T;
  meta: BliivaPageMeta | null;
};

export function readBliivaData<T>(
  body: unknown,
  parse: (data: unknown) => T | null,
): { ok: true; value: BliivaRead<T> } | { ok: false; message: string } {
  if (!isRecord(body) || body.success !== true) {
    const message = isRecord(body) ? text(body.message) : null;
    return {
      ok: false,
      message: message ?? "Support chat could not be read.",
    };
  }
  const data = parse(body.data);
  if (data == null) {
    return {
      ok: false,
      message: text(body.message) ?? "Support chat could not be read.",
    };
  }
  return {
    ok: true,
    value: {
      message: text(body.message) ?? "",
      data,
      meta: parseBliivaPageMeta(body.meta),
    },
  };
}

export function choicesForResponse(
  responseType: SupportResponseType | null,
  pending: SupportPendingClarification | null,
): string[] {
  if (
    responseType !== "CLARIFICATION_REQUIRED" &&
    responseType !== "ACTION_CONFIRMATION_REQUIRED"
  ) {
    return [];
  }
  return pending?.options ?? [];
}

export function inferResponseType(
  conversation: SupportConversation,
): SupportResponseType | null {
  if (conversation.status === "human" || conversation.status === "waiting") {
    return "HUMAN_HANDLING";
  }
  if (conversation.state === "escalated") return "ESCALATED";
  if (conversation.state === "awaiting_action_confirmation") {
    return "ACTION_CONFIRMATION_REQUIRED";
  }
  if (
    conversation.state === "clarifying" ||
    conversation.state === "awaiting_action_parameter"
  ) {
    return "CLARIFICATION_REQUIRED";
  }
  return null;
}

export function supportStatusLabel(
  responseType: SupportResponseType | null,
  conversationStatus: string | null,
): string {
  if (conversationStatus === "closed" || conversationStatus === "resolved") {
    return "Your next message starts a new conversation";
  }
  switch (responseType) {
    case "CLARIFICATION_REQUIRED":
      return "Choose one, or say it another way";
    case "ACTION_CONFIRMATION_REQUIRED":
      return "Confirm to continue";
    case "ACTION_COMPLETED":
      return "Done";
    case "ESCALATED":
    case "HUMAN_HANDLING":
      return "A specialist has this conversation";
    case "UNSUPPORTED":
      return "No matching answer";
    case "TEMPORARY_ERROR":
      return "That didn't go through";
    default:
      return "Accounts, donations, and your wallet";
  }
}
