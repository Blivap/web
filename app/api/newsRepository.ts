import { config } from "@/config/env";
import { parseNewsPublishedAtToIso } from "@/lib/news-date";
import type { INewsArticleRaw, INewsItem } from "@/types";

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

type NewsDataResponse = {
  status?: string;
  totalResults?: number;
  results?: INewsArticleRaw[];
  nextPage?: string;
  errors?: string[];
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
    publishedAt: parseNewsPublishedAtToIso(
      article.pubDate,
      article.pubDateTZ,
    ),
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
    /** Params reserved for future query shaping; the current feed URL is fixed in config. */
    getNews: async (_params?: GetNewsParams) => {
      const { url, apiKey } = config.news;

      const response = await fetch(url);

      const rawData = (await response.json()) as NewsDataResponse;
      const errors = Array.isArray(rawData?.errors)
        ? rawData.errors
        : undefined;

      const normalizedArticles = (rawData.results ?? [])
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
        status: response.status,
        message: response.statusText,
        error: errors?.[0] ?? null,
        errors,
        meta: {
          totalResults: rawData.totalResults,
          nextPage: rawData.nextPage,
        },
      };
    },
  };
}
