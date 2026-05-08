import { config } from "@/config/env";
import type { INewsItem } from "@/types";

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

type NewsDataArticle = {
  article_id?: string | null;
  title?: string | null;
  description?: string | null;
  content?: string | null;
  link?: string | null;
  image_url?: string | null;
  pubDate?: string | null;
  language?: string | null;
  source_id?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  country?: string[] | null;
  duplicate?: boolean | null;
};

type NewsDataResponse = {
  status?: string;
  totalResults?: number;
  results?: NewsDataArticle[];
  nextPage?: string;
  errors?: string[];
};

const EMPTY_IMAGE = "/images/news_image.jpg";

const toIsoString = (dateValue?: string | null): string => {
  if (!dateValue) return new Date().toISOString();
  const normalized = dateValue.includes("T")
    ? dateValue
    : dateValue.replace(" ", "T");
  const withTimezone = /(Z|[+-]\d{2}:\d{2})$/.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const parsed = new Date(withTimezone);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
};

const mapNewsDataArticle = (
  article: NewsDataArticle,
  index: number,
): INewsItem | null => {
  const url = article.link?.trim();
  const title = article.title?.trim();
  if (!url || !title) return null;

  return {
    id: article.article_id ?? `${url}-${index}`,
    title,
    description: article.description?.trim() ?? "",
    content: article.content?.trim() ?? "",
    url,
    image: article.image_url?.trim() || EMPTY_IMAGE,
    publishedAt: toIsoString(article.pubDate),
    lang: article.language?.trim() ?? "en",
    source: {
      id: article.source_id?.trim() ?? "newsdata",
      name: article.source_name?.trim() || "News source",
      url: article.source_url?.trim() || url,
      country: article.country?.[0]?.trim() ?? "global",
    },
  };
};

export default function NewsRepository() {
  return {
    getNews: async () => {
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
