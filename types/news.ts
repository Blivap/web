/**
 * Single article row as returned by the news provider API (e.g. NewsData.io-style payloads).
 * Field names match the wire format; many optional strings may be plan-gated placeholders.
 */
export interface INewsArticleRaw {
  article_id?: string | null;
  link?: string | null;
  title?: string | null;
  description?: string | null;
  content?: string | null;
  keywords?: string[] | null;
  creator?: string[] | null;
  /** API may send codes (`en`) or names (`english`). */
  language?: string | null;
  country?: string[] | null;
  category?: string[] | null;
  datatype?: string | null;
  /** e.g. `"2026-05-08 11:22:46"` — no offset; see `pubDateTZ`. */
  pubDate?: string | null;
  /** Zone for the naive `pubDate` (e.g. `"UTC"`). */
  pubDateTZ?: string | null;
  fetched_at?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  source_id?: string | null;
  source_name?: string | null;
  source_priority?: number | null;
  source_url?: string | null;
  source_icon?: string | null;
  sentiment?: string | null;
  sentiment_stats?: string | null;
  ai_tag?: string | null;
  ai_region?: string | null;
  ai_org?: string | null;
  ai_summary?: string | null;
  duplicate?: boolean | null;
}

export interface ISource {
  id: string;
  name: string;
  url: string;
  /** Primary region / territory label for display (first country when API sends an array). */
  country: string;
  /** Provider favicon when available. */
  icon?: string | null;
  /** Provider ordering hint when present. */
  priority?: number;
}

/**
 * Normalized article used by the app UI (mapped from {@link INewsArticleRaw}).
 */
export interface INewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  /** Same wire value as the API, e.g. `2026-05-08 11:22:46`. */
  pubDate?: string;
  /** Same instant as {@link pubDate}, normalized to ISO 8601 for sorting and `Date` parsing. */
  publishedAt: string;
  /** Short language code for UI (`en`, `fr`, …). */
  lang: string;
  /** Original API language string when it was not a short code (e.g. `english`). */
  languageRaw?: string;
  source: ISource;
  duplicate?: boolean;
  keywords?: string[];
  creators?: string[];
  categories?: string[];
  countries?: string[];
  pubDateTZ?: string;
  fetchedAt?: string;
  videoUrl?: string | null;
  datatype?: string;
}
