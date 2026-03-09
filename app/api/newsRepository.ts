import { config } from "../utils/config";

export type NewsCategory =
  | "general"
  | "world"
  | "nation"
  | "business"
  | "technology"
  | "entertainment"
  | "sports"
  | "science"
  | "health";

export type NewsLanguage = "en" | "fr" | "es";
export type NewsCountry = "us" | "ng" | "in";
export type NewsTruncate = "content";

export interface GetNewsParams {
  category?: NewsCategory;
  query?: string;
  max?: number;
  page?: number;
  lang?: NewsLanguage;
  country?: NewsCountry;
  from?: string;
  to?: string;
  truncate?: NewsTruncate;
}

const DEFAULT_NEWS_MAX = 10;
const MIN_NEWS_MAX = 1;
const MAX_NEWS_MAX = 100;
const MAX_NEWS_QUERY_LENGTH = 200;
const DEFAULT_NEWS_PAGE = 1;

export default function NewsRepository() {
  return {
    getNews: async ({
      category = "general",
      query,
      max = DEFAULT_NEWS_MAX,
      page = DEFAULT_NEWS_PAGE,
      lang = "en",
      country = "us",
      from,
      to,
      truncate = "content",
    }: GetNewsParams = {}) => {
      const { url, apiKey } = config.news;
      const baseUrl = url?.endsWith("/") ? url : `${url}/`;
      const normalizedQuery = query?.trim().slice(0, MAX_NEWS_QUERY_LENGTH);
      const endpoint = normalizedQuery ? "search" : "top-headlines";
      const safeMax = Math.min(MAX_NEWS_MAX, Math.max(MIN_NEWS_MAX, max));
      const safePage = Math.max(DEFAULT_NEWS_PAGE, Math.floor(page));
      const searchParams = new URLSearchParams({
        apikey: apiKey ?? "",
        max: String(safeMax),
        page: String(safePage),
        lang,
        country,
        truncate,
      });

      if (normalizedQuery) {
        searchParams.set("q", normalizedQuery);
      } else {
        searchParams.set("category", category);
      }

      if (from) {
        searchParams.set("from", from);
      }

      if (to) {
        searchParams.set("to", to);
      }

      const response = await fetch(
        `${baseUrl}${endpoint}?${searchParams.toString()}`,
      );
      const data = await response.json();
      const errors = Array.isArray((data as { errors?: unknown })?.errors)
        ? ((data as { errors?: string[] }).errors ?? [])
        : undefined;
      return {
        data,
        status: response.status,
        message: response.statusText,
        error: errors?.[0] ?? null,
        errors,
        meta: undefined,
      };
    },
  };
}
