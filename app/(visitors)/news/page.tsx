"use client";

import { useEffect, useMemo, useState } from "react";
import { formatNewsPublishedDate } from "@/lib/news-date";
import { HomeLayout } from "@/layout/home.layout.component";
import { NewsFallbackImage } from "@/components/image/news-fallback-image.component";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock3,
  ExternalLink,
  Filter,
  Globe2,
  Languages,
  Newspaper,
  RefreshCw,
  Search,
} from "lucide-react";
import { useNews } from "@/hooks/news/useNews.hooks";
import type {
  NewsCategory,
  NewsCountry,
  NewsLanguage,
  NewsTimeframe,
} from "@/app/api/newsRepository";

const NEWS_CATEGORIES: { label: string; value: NewsCategory }[] = [
  { label: "General", value: "general" },
  { label: "World", value: "world" },
  { label: "Nation", value: "nation" },
  { label: "Business", value: "business" },
  { label: "Technology", value: "technology" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Sports", value: "sports" },
  { label: "Science", value: "science" },
  { label: "Health", value: "health" },
];

const NEWS_LANGUAGES: { label: string; value: NewsLanguage }[] = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
];

const NEWS_COUNTRIES: { label: string; value: NewsCountry }[] = [
  { label: "United States", value: "us" },
  { label: "Nigeria", value: "ng" },
  { label: "India", value: "in" },
];

const NEWS_TIMEFRAMES: { label: string; value: NewsTimeframe | "" }[] = [
  { label: "Default", value: "" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
];

function estimateReadingTime(text?: string) {
  if (!text) return "2 min read";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(2, Math.ceil(words / 180))} min read`;
}

function getCategoryLabel(category: NewsCategory): string {
  return (
    NEWS_CATEGORIES.find((item) => item.value === category)?.label ?? "Health"
  );
}

function NewsHeroSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] gap-6">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white animate-pulse dark:border-white/10 dark:bg-[#111827]">
        <div className="h-[260px] bg-linear-to-br from-[#E5E7EB] via-[#F3F4F6] to-[#E5E7EB] dark:from-[#1F2937] dark:via-[#111827] dark:to-[#1F2937] sm:h-[360px]" />
        <div className="p-5 sm:p-6 flex flex-col gap-3">
          <div className="h-3 w-28 rounded-full bg-[#D1D5DB] dark:bg-slate-600" />
          <div className="h-6 w-4/5 rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
          <div className="h-4 w-full rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
          <div className="h-4 w-3/4 rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
          <div className="mt-2 h-4 w-24 rounded-full bg-[#F3D5DB] dark:bg-primary/30" />
        </div>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 animate-pulse dark:border-white/10 dark:bg-[#111827] sm:p-6">
        <div className="h-4 w-28 rounded-full bg-[#D1D5DB] dark:bg-slate-600" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-20 rounded-full bg-[#D1D5DB] dark:bg-slate-600" />
              <div className="h-4 w-full rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
              <div className="h-4 w-5/6 rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white animate-pulse dark:border-white/10 dark:bg-[#111827]"
        >
          <div className="h-[220px] bg-[#E5E7EB] dark:bg-[#1F2937]" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-24 rounded-full bg-[#D1D5DB] dark:bg-slate-600" />
            <div className="h-5 w-4/5 rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
            <div className="h-4 w-full rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
            <div className="h-4 w-2/3 rounded-full bg-[#E5E7EB] dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_NEWS_QUERY = "blood donation";

export default function News() {
  const [query, setQuery] = useState(DEFAULT_NEWS_QUERY);
  const [debouncedQuery, setDebouncedQuery] = useState(DEFAULT_NEWS_QUERY);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | "">(
    "",
  );
  const [selectedLanguage, setSelectedLanguage] = useState<NewsLanguage | "">(
    "",
  );
  const [selectedCountry, setSelectedCountry] = useState<NewsCountry | "">("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    NewsTimeframe | ""
  >("");
  const selectedCategoryLabel = selectedCategory
    ? getCategoryLabel(selectedCategory)
    : "All";
  const hasFilterOverrides = Boolean(
    query.trim() !== DEFAULT_NEWS_QUERY ||
    selectedCategory ||
    selectedTimeframe ||
    selectedLanguage ||
    selectedCountry ||
    currentPage !== 1,
  );

  const resetFilters = () => {
    setQuery(DEFAULT_NEWS_QUERY);
    setDebouncedQuery(DEFAULT_NEWS_QUERY);
    setCurrentPage(1);
    setSelectedCategory("");
    setSelectedLanguage("");
    setSelectedCountry("");
    setSelectedTimeframe("");
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const newsParams = useMemo(
    () => ({
      category: selectedCategory || undefined,
      q: debouncedQuery || undefined,
      page: currentPage > 1 ? currentPage : undefined,
      language: selectedLanguage || undefined,
      country: selectedCountry || undefined,
      timeframe: selectedTimeframe || undefined,
    }),
    [
      debouncedQuery,
      currentPage,
      selectedCategory,
      selectedLanguage,
      selectedCountry,
      selectedTimeframe,
    ],
  );

  const { news, isLoading, error, refetch } = useNews(newsParams);

  const sourceCount = useMemo(
    () => new Set(news.map((item) => item.source?.name).filter(Boolean)).size,
    [news],
  );

  const featured = news[0];
  const latest = news.slice(1);

  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col py-6 sm:py-8 gap-8 ">
        <header className="flex flex-col gap-5 ">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Newspaper size={14} />
              Blivap news room
            </span>
            <h1 className="font-semibold text-primary text-2xl sm:text-3xl tracking-tight">
              News and trending updates
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#6B7280] dark:text-slate-400">
              Explore trusted coverage across health, science, business,
              technology, sports, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                {selectedCategory
                  ? `${selectedCategoryLabel} stories`
                  : "Stories"}
              </p>
              <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                {news.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                Sources
              </p>
              <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                {sourceCount}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                Showing
              </p>
              <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                {news.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
                Page
              </p>
              <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                {currentPage}
              </p>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
          <div className="border-b border-[#F1F5F9] bg-linear-to-r from-[#FFF7F8] via-white to-[#F8FAFC] px-4 py-4 dark:border-white/10 dark:from-[#2A1117] dark:via-[#111827] dark:to-[#0F172A] sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ">
                  <Filter size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    Refine your news feed
                  </p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6B7280] dark:text-slate-400">
                    Search headlines, switch categories, and narrow the feed by
                    language, country, or timeframe.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasFilterOverrides ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-medium text-[#4B5563] transition-colors hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-primary/30 dark:hover:text-primary"
                  >
                    Clear all
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:border-primary hover:text-primary dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary"
                >
                  <RefreshCw
                    size={15}
                    className={isLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-4 py-4 sm:px-5 sm:py-5">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-500"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setCurrentPage(1);
                  setQuery(e.target.value);
                }}
                maxLength={200}
                placeholder={
                  selectedCategory
                    ? `Search ${selectedCategoryLabel.toLowerCase()} headlines and summaries`
                    : "Search headlines and summaries"
                }
                className="w-full rounded-2xl border border-[#E2E8F0] bg-[#FCFCFD] py-3 pl-11 pr-4 text-sm text-black outline-none transition placeholder:text-[#9CA3AF] focus:border-primary focus:ring-4 focus:ring-primary/8 dark:border-white/10 dark:bg-[#0F172A] dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF] dark:text-slate-500">
                Current view
              </span>
              <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#475467] dark:bg-[#0F172A] dark:text-slate-300">
                {selectedCategory ? selectedCategoryLabel : "All categories"}
              </span>
              <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#475467] dark:bg-[#0F172A] dark:text-slate-300">
                {selectedLanguage
                  ? selectedLanguage.toUpperCase()
                  : "Any language"}
              </span>
              <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#475467] dark:bg-[#0F172A] dark:text-slate-300">
                {selectedCountry
                  ? selectedCountry.toUpperCase()
                  : "All countries"}
              </span>
              {selectedTimeframe ? (
                <span className="rounded-full bg-[#FFF1F3] px-3 py-1.5 text-xs font-medium text-primary dark:bg-primary/15">
                  {selectedTimeframe}
                </span>
              ) : null}
              {debouncedQuery ? (
                <span className="rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-medium text-[#4338CA] dark:bg-[#312E81]/30 dark:text-indigo-200">
                  &quot;{debouncedQuery}&quot;
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border border-[#EEF2F6] bg-[#FCFCFD] p-4 dark:border-white/10 dark:bg-[#0F172A]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-black dark:text-white">
                      Category
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
                      Choose a topic only when you want to narrow the feed.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#667085] dark:bg-[#111827] dark:text-slate-400">
                    Optional
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {NEWS_CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setCurrentPage(1);
                        setSelectedCategory((current) =>
                          current === category.value ? "" : category.value,
                        );
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedCategory === category.value
                          ? "bg-primary text-white shadow-[0_6px_18px_rgba(150,0,24,0.18)]"
                          : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-primary/40 dark:hover:text-primary"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-[#EEF2F6] bg-[#FCFCFD] p-4 dark:border-white/10 dark:bg-[#0F172A]">
                  <div className="mb-3 flex items-center gap-2">
                    <Languages
                      size={15}
                      className="text-[#667085] dark:text-slate-500"
                    />
                    <p className="text-sm font-semibold text-black dark:text-white">
                      Language
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {NEWS_LANGUAGES.map((language) => (
                      <button
                        key={language.value}
                        type="button"
                        onClick={() => {
                          setCurrentPage(1);
                          setSelectedLanguage((current) =>
                            current === language.value ? "" : language.value,
                          );
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedLanguage === language.value
                            ? "bg-foundation-dark text-white"
                            : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-foundation-dark/30 hover:text-foundation-dark dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-primary/30 dark:hover:text-white"
                        }`}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EEF2F6] bg-[#FCFCFD] p-4 dark:border-white/10 dark:bg-[#0F172A]">
                  <div className="mb-3 flex items-center gap-2">
                    <Globe2
                      size={15}
                      className="text-[#667085] dark:text-slate-500"
                    />
                    <p className="text-sm font-semibold text-black dark:text-white">
                      Country
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {NEWS_COUNTRIES.map((country) => (
                      <button
                        key={country.value}
                        type="button"
                        onClick={() => {
                          setCurrentPage(1);
                          setSelectedCountry((current) =>
                            current === country.value ? "" : country.value,
                          );
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedCountry === country.value
                            ? "bg-secondary text-white"
                            : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-secondary/40 hover:text-secondary dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-secondary/40 dark:hover:text-secondary"
                        }`}
                      >
                        {country.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EEF2F6] bg-[#FCFCFD] p-4 dark:border-white/10 dark:bg-[#0F172A]">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock3
                      size={15}
                      className="text-[#667085] dark:text-slate-500"
                    />
                    <p className="text-sm font-semibold text-black dark:text-white">
                      Timeframe
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {NEWS_TIMEFRAMES.map((timeframe) => (
                      <button
                        key={timeframe.label}
                        type="button"
                        onClick={() => {
                          setCurrentPage(1);
                          setSelectedTimeframe((current) =>
                            current === timeframe.value ? "" : timeframe.value,
                          );
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedTimeframe === timeframe.value
                            ? "bg-primary text-white"
                            : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-primary/40 dark:hover:text-primary"
                        }`}
                      >
                        {timeframe.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && news.length === 0 ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-[#F5C2C7] bg-[#FFF5F6] p-6 dark:border-primary/20 dark:bg-[#241217]">
            <p className="text-lg font-semibold text-black dark:text-white">
              Could not load news
            </p>
            <p className="max-w-xl text-sm text-[#6B7280] dark:text-slate-400">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Try again
            </button>
          </section>
        ) : isLoading && news.length === 0 ? (
          <>
            <NewsHeroSkeleton />
            <NewsGridSkeleton />
          </>
        ) : news.length === 0 ? (
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center dark:border-white/10 dark:bg-[#111827]">
            <p className="text-lg font-semibold text-black dark:text-white">
              No articles found
            </p>
            <p className="mt-2 text-sm text-[#6B7280] dark:text-slate-400">
              Try a different keyword or adjust the other filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Clear filters
              <ArrowRight size={14} />
            </button>
          </section>
        ) : (
          <>
            {featured && (
              <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] gap-6">
                <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#111827]">
                  <a
                    href={featured.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    <div className="relative h-[260px] sm:h-[360px]">
                      <NewsFallbackImage
                        src={featured.image}
                        alt={featured.title}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 1280px) 100vw, 60vw"
                      />
                    </div>
                    <div className="flex flex-col gap-3 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-wide text-[#6B7280] dark:text-slate-400">
                        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280] dark:bg-[#0F172A] dark:text-slate-400">
                          {debouncedQuery
                            ? selectedCategory
                              ? `${selectedCategoryLabel} search result`
                              : "Search result"
                            : selectedCategory
                              ? selectedCategoryLabel
                              : "Top story"}
                        </span>
                        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280] dark:bg-[#0F172A] dark:text-slate-400">
                          {selectedLanguage
                            ? selectedLanguage.toUpperCase()
                            : "Any language"}
                        </span>
                        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280] dark:bg-[#0F172A] dark:text-slate-400">
                          {selectedCountry
                            ? selectedCountry.toUpperCase()
                            : "All countries"}
                        </span>
                        <span>{featured.source?.name || "News source"}</span>
                        <span>
                          {formatNewsPublishedDate(featured.publishedAt)}
                        </span>
                        <span>{estimateReadingTime(featured.content)}</span>
                      </div>
                      <h2 className="text-xl font-semibold leading-snug text-black transition-colors group-hover:text-primary dark:text-white sm:text-2xl">
                        {featured.title}
                      </h2>
                      <p className="line-clamp-3 text-sm leading-relaxed text-[#6B7280] dark:text-slate-400">
                        {featured.description || featured.content}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Open original story
                        <ExternalLink size={15} />
                      </span>
                    </div>
                  </a>
                </article>

                <aside className="rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-white/10 dark:bg-[#111827] sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280] dark:text-slate-400">
                      Quick picks
                    </h2>
                    <span className="text-xs text-[#9CA3AF] dark:text-slate-500">
                      {Math.min(latest.length, 3)} stories
                    </span>
                  </div>
                  <div className="mt-5 flex flex-col gap-4">
                    {latest.slice(0, 3).map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group rounded-xl border border-[#F3F4F6] p-4 transition-colors hover:border-[#D1D5DB] hover:bg-[#FCFCFD] dark:border-white/10 dark:hover:border-white/16 dark:hover:bg-[#0F172A]"
                      >
                        <div className="flex items-center justify-between gap-3 text-[11px] text-[#9CA3AF] dark:text-slate-500">
                          <span>{item.source?.name || "Source"}</span>
                          <span>
                            {formatNewsPublishedDate(item.publishedAt)}
                          </span>
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-black transition-colors group-hover:text-primary dark:text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs text-[#6B7280] dark:text-slate-400">
                          {item.description || item.content}
                        </p>
                      </a>
                    ))}
                  </div>
                </aside>
              </section>
            )}

            <section className="flex flex-col gap-4 ">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-black dark:text-white">
                    Latest coverage
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
                    {debouncedQuery
                      ? `${
                          selectedCategory
                            ? `${selectedCategoryLabel}-related `
                            : ""
                        }results for "${debouncedQuery}"`
                      : selectedCategory
                        ? `Top ${selectedCategoryLabel.toLowerCase()} headlines from trusted media sources.`
                        : "Top headlines from trusted media sources."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1 || isLoading}
                    className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={isLoading || news.length < 10}
                    className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {latest.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-[#111827]"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block h-full"
                    >
                      <div className="relative h-[220px]">
                        <NewsFallbackImage
                          src={item.image}
                          alt={item.title}
                          fallbackSrc="/images/news_image.jpg"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                      <div className="flex flex-col gap-3 p-5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9CA3AF] dark:text-slate-500">
                          <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280] dark:bg-[#0F172A] dark:text-slate-400">
                            {item.source?.name || "Source"}
                          </span>
                          <span>
                            {formatNewsPublishedDate(item.publishedAt)}
                          </span>
                          <span>
                            {estimateReadingTime(
                              item.content || item.description,
                            )}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-black transition-colors group-hover:text-primary dark:text-white">
                          {item.title}
                        </h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-[#6B7280] dark:text-slate-400">
                          {item.description || item.content}
                        </p>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mt-1">
                          Read full article
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-primary text-white px-5 sm:px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 3xl:max-w-1/2">
              <div className="max-w-2xl">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Want to see how Blivap turns awareness into action?
                </h2>
                <p className="mt-1 text-sm text-white/85 leading-relaxed">
                  Explore how our platform supports donors, healthcare teams,
                  and people in need across Nigeria.
                </p>
              </div>
              <Button
                variant="link"
                href="/register"
                className="text-xs font-medium py-2  px-6 rounded-full bg-white text-primary hover:bg-white/90 hover:text-primary! transition-colors shrink-0"
              >
                Register
              </Button>
            </section>
          </>
        )}
      </div>
    </HomeLayout>
  );
}
