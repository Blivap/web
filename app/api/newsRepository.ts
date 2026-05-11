import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import { parseNewsPublishedAtToIso } from "@/lib/news-date";
import type { IResponse, INewsArticleRaw, INewsItem } from "@/types";

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
export type NewsTimeframe = "24h" | "7d" | "30d";
export type NewsBinaryFlag = 0 | 1;

export interface GetNewsParams {
  q?: string;
  qInTitle?: string;
  qInMeta?: string;
  timeframe?: NewsTimeframe;
  country?: NewsCountry;
  excludecountry?: string;
  category?: NewsCategory;
  excludecategory?: string;
  language?: NewsLanguage;
  excludelanguage?: string;
  domain?: string;
  domainurl?: string;
  excludedomain?: string;
  region?: string;
  datatype?: string;
  prioritydomain?: string;
  image?: NewsBinaryFlag;
  video?: NewsBinaryFlag;
  removeduplicate?: NewsBinaryFlag;
  size?: number;
  page?: number;
}

type NewsDataResponse = {
  status?: string;
  totalResults?: number;
  results?: INewsArticleRaw[];
  nextPage?: string;
  errors?: string[];
};

type NewsRepositoryResponse = NewsDataResponse & {
  articles?: INewsItem[];
};

const LANGUAGE_NAME_TO_CODE: Record<string, string> = {
  english: "en",
  french: "fr",
  spanish: "es",
  german: "de",
  dutch: "nl",
  portuguese: "pt",
  italian: "it",
  arabic: "ar",
  hindi: "hi",
};

function normalizeArticleLang(language?: string | null): {
  lang: string;
  languageRaw?: string;
} {
  const raw = language?.trim();
  if (!raw) return { lang: "en" };
  if (/^[a-z]{2}([-_][a-z]{2,4})?$/i.test(raw)) {
    return { lang: raw.slice(0, 2).toLowerCase() };
  }
  const key = raw.toLowerCase();
  const mapped = LANGUAGE_NAME_TO_CODE[key];
  if (mapped) return { lang: mapped, languageRaw: raw };
  return { lang: "en", languageRaw: raw };
}

const EMPTY_IMAGE = "/images/news_image.jpg";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractNewsPayload(payload: unknown): NewsRepositoryResponse {
  if (!isRecord(payload)) return {};

  const nested = payload.data;
  if (
    isRecord(nested) &&
    !("results" in payload) &&
    !("articles" in payload) &&
    ("results" in nested || "articles" in nested)
  ) {
    return nested as NewsRepositoryResponse;
  }

  return payload as NewsRepositoryResponse;
}

const mapNewsDataArticle = (
  article: INewsArticleRaw,
  index: number,
): INewsItem | null => {
  const url = article.link?.trim();
  const title = article.title?.trim();
  if (!url || !title) return null;

  const { lang, languageRaw } = normalizeArticleLang(article.language);
  const countries =
    article.country?.map((c) => c?.trim()).filter(Boolean) ?? [];
  const countryLabel = countries[0] ?? "global";

  return {
    id: article.article_id?.trim() || `${url}-${index}`,
    title,
    description: article.description?.trim() ?? "",
    content: article.content?.trim() ?? "",
    url,
    image: article.image_url?.trim() || EMPTY_IMAGE,
    pubDate: article.pubDate?.trim() || undefined,
    publishedAt: parseNewsPublishedAtToIso(article.pubDate, article.pubDateTZ),
    lang,
    languageRaw,
    source: {
      id: article.source_id?.trim() ?? "newsdata",
      name: article.source_name?.trim() || "News source",
      url: article.source_url?.trim() || url,
      country: countryLabel,
      icon: article.source_icon?.trim() || null,
      priority: article.source_priority ?? undefined,
    },
    duplicate: article.duplicate ?? undefined,
    keywords: article.keywords?.length ? article.keywords : undefined,
    creators: article.creator?.length ? article.creator : undefined,
    categories: article.category?.length ? article.category : undefined,
    countries: countries.length ? countries : undefined,
    pubDateTZ: article.pubDateTZ?.trim() || undefined,
    fetchedAt: article.fetched_at?.trim() || undefined,
    videoUrl: article.video_url?.trim() || null,
    datatype: article.datatype?.trim() || undefined,
  };
};

export default function NewsRepository() {
  return {
    getNews: async (
      params: GetNewsParams = {},
    ): Promise<IResponse<NewsRepositoryResponse>> => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        query.set(key, String(value));
      }

      const url = query.size
        ? `${endpoints.news}?${query.toString()}`
        : endpoints.news;

      const {
        data,
        status,
        message,
        error: apiError,
      } = await fetcher<
        NewsRepositoryResponse | { data?: NewsRepositoryResponse }
      >(url, { method: "GET" });

      const rawData = extractNewsPayload(data);
      const errors = Array.isArray(rawData.errors) ? rawData.errors : undefined;

      const normalizedArticles = Array.isArray(rawData.articles)
        ? [...rawData.articles].sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime(),
          )
        : (rawData.results ?? [])
            .filter((article) => !article.duplicate)
            .map(mapNewsDataArticle)
            .filter((article): article is INewsItem => article !== null)
            .sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime(),
            );

      return {
        data: {
          ...rawData,
          articles: normalizedArticles,
        },
        status,
        message,
        error: apiError ?? errors?.[0] ?? null,
        errors: errors?.length ? { news: errors } : undefined,
        meta: undefined,
      };
    },
  };
}
