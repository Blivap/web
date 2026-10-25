import axios from "axios";
import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import {
  API_UNREACHABLE_MESSAGE,
  isNetworkFailure,
} from "@/lib/api/networkFailure";
import { getApiMessageFromData } from "@/lib/bookings/axiosErrorMessage";
import type { IResponse } from "@/types";

export type PublicStat = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
};

export type PublicCoverageCity = {
  id: string;
  label: string;
  x: number;
  y: number;
  strength: number;
  delay: number;
};

export type PublicCoverageLink = {
  from: string;
  to: string;
};

export type PublicTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
};

export type PublicActivity = {
  id: string;
  kind: "match" | "donate";
  label: string;
  meta: string;
};

export type PublicLanding = {
  stats: PublicStat[];
  openNeeds: number;
  coverage: PublicCoverageCity[];
  coverageLinks: PublicCoverageLink[];
  testimonials: PublicTestimonial[];
  activity: PublicActivity[];
};

export type PublicStoreListing = {
  live: boolean;
  url: string | null;
};

export type PublicAppStores = {
  ios: PublicStoreListing;
  android: PublicStoreListing;
};

export type WaitlistStore = "ios" | "android" | "both";

export type WaitlistJoinResult = {
  id: string;
  alreadyJoined: boolean;
};

export type PublicWriteResult = {
  id: string;
};

const RATE_LIMIT_MESSAGE = "Too many attempts. Try again in about an hour.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrap(payload: unknown): unknown {
  if (!isRecord(payload) || !("data" in payload)) return payload;
  return payload.data;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function fieldErrors(payload: unknown): Record<string, string[]> | undefined {
  if (!isRecord(payload) || !isRecord(payload.errors)) return undefined;
  const errors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(payload.errors)) {
    if (typeof value === "string" && value.trim()) {
      errors[key] = [value.trim()];
    } else if (Array.isArray(value)) {
      const messages = value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim() !== "",
      );
      if (messages.length) errors[key] = messages;
    }
  }
  return Object.keys(errors).length ? errors : undefined;
}

function firstFieldError(
  errors: Record<string, string[]> | undefined,
): string | null {
  if (!errors) return null;
  for (const messages of Object.values(errors)) {
    const message = messages.find((item) => item.trim());
    if (message) return message;
  }
  return null;
}

function failure<T>(error: unknown, fallback: string): IResponse<T> {
  if (isNetworkFailure(error)) {
    return {
      data: undefined,
      status: 0,
      message: "Network Error",
      error: API_UNREACHABLE_MESSAGE,
    };
  }

  if (!axios.isAxiosError(error)) {
    return {
      data: undefined,
      status: 0,
      message: fallback,
      error: fallback,
    };
  }

  const status = error.response?.status ?? 0;
  const errors = fieldErrors(error.response?.data);
  const raw = getApiMessageFromData(error.response?.data);
  const message =
    status === 429
      ? RATE_LIMIT_MESSAGE
      : (firstFieldError(errors) ??
        (raw && !raw.startsWith("ThrottlerException") ? raw : fallback));

  return {
    data: undefined,
    status,
    message,
    error: message,
    errors,
  };
}

function parseStats(value: unknown): PublicStat[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = text(item.id);
    const label = text(item.label);
    const statValue = finiteNumber(item.value);
    if (!id || !label || statValue === null) return [];
    const suffix = typeof item.suffix === "string" ? item.suffix : "";
    return [
      {
        id,
        label,
        value: statValue,
        ...(suffix ? { suffix } : {}),
      },
    ];
  });
}

function parseCoverage(value: unknown): PublicCoverageCity[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = text(item.id);
    const label = text(item.label);
    const x = finiteNumber(item.x);
    const y = finiteNumber(item.y);
    const strength = finiteNumber(item.strength);
    const delay = finiteNumber(item.delay);
    if (!id || !label || x === null || y === null || strength === null) {
      return [];
    }
    return [
      {
        id,
        label,
        x,
        y,
        strength,
        delay: delay ?? 0,
      },
    ];
  });
}

function parseLinks(value: unknown): PublicCoverageLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const from = text(item.from);
    const to = text(item.to);
    if (!from || !to) return [];
    return [{ from, to }];
  });
}

function parseTestimonials(value: unknown): PublicTestimonial[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const quote = text(item.quote);
    const name = text(item.name);
    if (!quote || !name) return [];
    return [
      {
        id: text(item.id) || `testimonial-${index}`,
        quote,
        name,
        role: text(item.role),
        location: text(item.location || item.city),
      },
    ];
  });
}

function parseActivity(value: unknown): PublicActivity[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const label = text(item.label);
    const kind =
      item.kind === "donate"
        ? "donate"
        : item.kind === "match"
          ? "match"
          : null;
    if (!label || !kind) return [];
    return [
      {
        id: text(item.id) || `activity-${index}`,
        kind,
        label,
        meta: text(item.meta),
      },
    ];
  });
}

export function parsePublicLanding(payload: unknown): PublicLanding | null {
  const body = unwrap(payload);
  if (!isRecord(body) || !Array.isArray(body.stats)) return null;
  return {
    stats: parseStats(body.stats),
    openNeeds: finiteNumber(body.openNeeds) ?? 0,
    coverage: parseCoverage(body.coverage),
    coverageLinks: parseLinks(body.coverageLinks),
    testimonials: parseTestimonials(body.testimonials),
    activity: parseActivity(body.activity),
  };
}

export function parsePublicApp(payload: unknown): PublicAppStores | null {
  const body = unwrap(payload);
  if (!isRecord(body)) return null;
  const ios = parseStore(body.ios);
  const android = parseStore(body.android);
  if (!ios || !android) return null;
  return { ios, android };
}

function parseStore(value: unknown): PublicStoreListing | null {
  if (!isRecord(value) || typeof value.live !== "boolean") return null;
  const url = text(value.url);
  return { live: value.live && Boolean(url), url: url || null };
}

function parseWrite(
  payload: unknown,
  alreadyJoined = false,
): (PublicWriteResult & { alreadyJoined?: boolean }) | null {
  const body = unwrap(payload);
  if (!isRecord(body)) return null;
  const id = text(body.id);
  if (!id) return null;
  return {
    id,
    alreadyJoined:
      typeof body.alreadyJoined === "boolean"
        ? body.alreadyJoined
        : alreadyJoined,
  };
}

export function liveStoreUrl(
  store: PublicStoreListing | undefined,
): string | null {
  if (!store?.live) return null;
  const url = store.url?.trim();
  return url || null;
}

async function read<T>(
  url: string,
  parse: (payload: unknown) => T | null,
  fallback: string,
): Promise<IResponse<T>> {
  try {
    const response = await fetcher<unknown>(url, { method: "GET" });
    const data = parse(response.data);
    if (!data) {
      return {
        ...response,
        data: undefined,
        error: fallback,
        message: fallback,
      };
    }
    return { ...response, data, error: null };
  } catch (error) {
    return failure(error, fallback);
  }
}

export default function PublicRepository() {
  return {
    getLanding(): Promise<IResponse<PublicLanding>> {
      return read(
        endpoints.public.landing,
        parsePublicLanding,
        "Could not load homepage details.",
      );
    },

    getApp(): Promise<IResponse<PublicAppStores>> {
      return read(
        endpoints.public.app,
        parsePublicApp,
        "Could not check the app stores.",
      );
    },

    async joinWaitlist(body: {
      email: string;
      store: WaitlistStore;
      source?: string;
      company?: string;
    }): Promise<IResponse<WaitlistJoinResult>> {
      try {
        const response = await fetcher<unknown>(endpoints.public.waitlist, {
          method: "POST",
          data: body,
        });
        const parsed = parseWrite(response.data);
        if (!parsed) {
          return {
            ...response,
            data: undefined,
            error: "Could not join the waitlist.",
          };
        }
        return {
          ...response,
          data: {
            id: parsed.id,
            alreadyJoined: parsed.alreadyJoined === true,
          },
          error: null,
        };
      } catch (error) {
        return failure(error, "Could not join the waitlist.");
      }
    },

    async leaveWaitlist(body: {
      email: string;
    }): Promise<IResponse<{ removed: boolean }>> {
      try {
        const response = await fetcher<unknown>(endpoints.public.waitlist, {
          method: "DELETE",
          data: body,
        });
        if (response.status < 200 || response.status >= 300) {
          return {
            ...response,
            data: undefined,
            error: response.error ?? "Could not update the waitlist.",
          };
        }
        return {
          ...response,
          data: { removed: true },
          error: null,
        };
      } catch (error) {
        return failure(error, "Could not update the waitlist.");
      }
    },

    async sendContact(body: {
      name: string;
      email: string;
      message: string;
      company?: string;
    }): Promise<IResponse<PublicWriteResult>> {
      try {
        const response = await fetcher<unknown>(endpoints.public.contact, {
          method: "POST",
          data: body,
        });
        const parsed = parseWrite(response.data);
        if (!parsed || response.status !== 201) {
          return {
            ...response,
            data: undefined,
            error: "Could not send your message.",
          };
        }
        return {
          ...response,
          data: { id: parsed.id },
          error: null,
        };
      } catch (error) {
        return failure(error, "Could not send your message.");
      }
    },
  };
}
