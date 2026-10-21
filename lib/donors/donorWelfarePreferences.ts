import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";

export type DonorWelfareCoverage = "self" | "requester";

export type DonorWelfarePackage = {
  code: string;
  title: string;
  detail: string;
  amountKobo: number;
};

export type DonorWelfarePreferences = {
  coverage: DonorWelfareCoverage;
  items: string[];
};

export type MeetupCareQuoteLine = {
  code: string;
  title: string;
  detail: string;
  amountKobo: number;
  payer: "you" | "donor";
};

export type MeetupCareQuote = {
  enabled: boolean;
  coverage: DonorWelfareCoverage;
  lines: MeetupCareQuoteLine[];
  dueKobo: number;
};

export const DEFAULT_DONOR_WELFARE_PREFERENCES: DonorWelfarePreferences = {
  coverage: "self",
  items: [],
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data;
  const inner = asRecord(record.data);
  if (inner && Array.isArray(inner.data)) return inner.data;
  return [];
}

function readAmount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.trunc(value)
    : 0;
}

export function parseWelfarePackages(payload: unknown): DonorWelfarePackage[] {
  return unwrapList(payload).flatMap((item) => {
    const record = asRecord(item);
    const code = typeof record?.code === "string" ? record.code.trim() : "";
    const title = typeof record?.title === "string" ? record.title.trim() : "";
    const detail =
      typeof record?.detail === "string" ? record.detail.trim() : "";
    if (!code || !title) return [];
    return [
      {
        code,
        title,
        detail,
        amountKobo: readAmount(record?.amountKobo),
      },
    ];
  });
}

export function parseMeetupCarePreferences(
  payload: unknown,
): DonorWelfarePreferences {
  const record = unwrapApiRecord(payload) ?? asRecord(payload);
  const care = asRecord(record?.meetupCare) ?? record;
  const coverage = care?.coverage === "requester" ? "requester" : "self";
  const items = Array.isArray(care?.items)
    ? care.items.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];
  return {
    coverage,
    items: coverage === "self" ? [] : items,
  };
}

export function parseMeetupCareQuote(payload: unknown): MeetupCareQuote | null {
  const record = unwrapApiRecord(payload) ?? asRecord(payload);
  if (!record || !Array.isArray(record.lines)) return null;
  const lines = record.lines.flatMap((item) => {
    const line = asRecord(item);
    const code = typeof line?.code === "string" ? line.code : "";
    const title = typeof line?.title === "string" ? line.title : "";
    if (!code || !title) return [];
    return [
      {
        code,
        title,
        detail: typeof line?.detail === "string" ? line.detail : "",
        amountKobo: readAmount(line?.amountKobo),
        payer: line?.payer === "you" ? ("you" as const) : ("donor" as const),
      },
    ];
  });
  const dueFromLines = lines
    .filter((line) => line.payer === "you")
    .reduce((sum, line) => sum + line.amountKobo, 0);
  return {
    enabled: record.enabled !== false,
    coverage: record.coverage === "requester" ? "requester" : "self",
    lines,
    dueKobo: dueFromLines,
  };
}
