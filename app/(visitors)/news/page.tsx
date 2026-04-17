"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { HomeLayout } from "@/layout/home.layout.component";
import { NewsFallbackImage } from "@/components/image/news-fallback-image.component";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Newspaper,
  RefreshCw,
  Search,
} from "lucide-react";
import { useNews } from "@/hooks/news/useNews.hooks";
import type {
  NewsCategory,
  NewsCountry,
  NewsLanguage,
} from "@/app/api/newsRepository";

const HEALTH_CATEGORY: NewsCategory = "health";

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

function formatNewsDate(date?: string) {
  if (!date) return "Latest update";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Latest update"
    : format(parsed, "d MMMM yyyy");
}

function estimateReadingTime(text?: string) {
  if (!text) return "2 min read";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(2, Math.ceil(words / 180))} min read`;
}

function NewsHeroSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] gap-6">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white animate-pulse">
        <div className="h-[260px] sm:h-[360px] bg-linear-to-br from-[#E5E7EB] via-[#F3F4F6] to-[#E5E7EB]" />
        <div className="p-5 sm:p-6 flex flex-col gap-3">
          <div className="h-3 w-28 rounded-full bg-[#D1D5DB]" />
          <div className="h-6 w-4/5 rounded-full bg-[#E5E7EB]" />
          <div className="h-4 w-full rounded-full bg-[#E5E7EB]" />
          <div className="h-4 w-3/4 rounded-full bg-[#E5E7EB]" />
          <div className="h-4 w-24 rounded-full bg-[#F3D5DB] mt-2" />
        </div>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 animate-pulse">
        <div className="h-4 w-28 rounded-full bg-[#D1D5DB]" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-20 rounded-full bg-[#D1D5DB]" />
              <div className="h-4 w-full rounded-full bg-[#E5E7EB]" />
              <div className="h-4 w-5/6 rounded-full bg-[#E5E7EB]" />
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
          className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white animate-pulse"
        >
          <div className="h-[220px] bg-[#E5E7EB]" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-24 rounded-full bg-[#D1D5DB]" />
            <div className="h-5 w-4/5 rounded-full bg-[#E5E7EB]" />
            <div className="h-4 w-full rounded-full bg-[#E5E7EB]" />
            <div className="h-4 w-2/3 rounded-full bg-[#E5E7EB]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function News() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<NewsLanguage>("en");
  const [selectedCountry, setSelectedCountry] = useState<NewsCountry>("us");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const hasInvalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const newsParams = useMemo(
    () => ({
      category: HEALTH_CATEGORY,
      query: debouncedQuery ? `health AND ${debouncedQuery}` : undefined,
      max: 10,
      page: currentPage,
      lang: selectedLanguage,
      country: selectedCountry,
      from: fromDate
        ? new Date(`${fromDate}T00:00:00.000Z`).toISOString()
        : undefined,
      to: toDate
        ? new Date(`${toDate}T23:59:59.999Z`).toISOString()
        : undefined,
    }),
    [
      debouncedQuery,
      currentPage,
      selectedLanguage,
      selectedCountry,
      fromDate,
      toDate,
    ],
  );

  const { news, isLoading, error, refetch } = useNews(newsParams, {
    enabled: !hasInvalidDateRange,
  });

  const sourceCount = useMemo(
    () => new Set(news.map((item) => item.source?.name).filter(Boolean)).size,
    [news],
  );

  const featured = news[0];
  const latest = news.slice(1);

  return (
    <HomeLayout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 xl:px-36 max-w-[1440px] mx-auto gap-8">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Newspaper size={14} />
              Blivap news room
            </span>
            <h1 className="font-semibold text-primary text-2xl sm:text-3xl tracking-tight">
              News and healthcare updates
            </h1>
            <p className="text-sm text-[#6B7280] max-w-2xl leading-relaxed">
              Follow the latest stories around blood donation, medical research,
              and healthcare progress from trusted sources.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                Health stories
              </p>
              <p className="mt-1 text-2xl font-semibold text-black">
                {news.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                Sources
              </p>
              <p className="mt-1 text-2xl font-semibold text-black">
                {sourceCount}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                Showing
              </p>
              <p className="mt-1 text-2xl font-semibold text-black">
                {news.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                Page
              </p>
              <p className="mt-1 text-2xl font-semibold text-black">
                {currentPage}
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setQuery(e.target.value);
                  }}
                  maxLength={200}
                  placeholder="Search health headlines and summaries"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:border-primary hover:text-primary transition-colors"
              >
                <RefreshCw
                  size={15}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1.5 text-xs font-medium bg-primary text-white">
                Health only
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {NEWS_LANGUAGES.map((language) => (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => {
                    setCurrentPage(1);
                    setSelectedLanguage(language.value);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedLanguage === language.value
                      ? "bg-foundation-dark text-white"
                      : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-foundation-dark/30 hover:text-foundation-dark"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {NEWS_COUNTRIES.map((country) => (
                <button
                  key={country.value}
                  type="button"
                  onClick={() => {
                    setCurrentPage(1);
                    setSelectedCountry(country.value);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCountry === country.value
                      ? "bg-secondary text-white"
                      : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-secondary/40 hover:text-secondary"
                  }`}
                >
                  {country.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="news-from-date"
                  className="text-xs font-medium text-[#6B7280]"
                >
                  From
                </label>
                <input
                  id="news-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setFromDate(e.target.value);
                  }}
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white py-2.5 px-3 text-sm text-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="news-to-date"
                  className="text-xs font-medium text-[#6B7280]"
                >
                  To
                </label>
                <input
                  id="news-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setToDate(e.target.value);
                  }}
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white py-2.5 px-3 text-sm text-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
            {hasInvalidDateRange && (
              <p className="text-sm text-[#B42318]">
                The `From` date must be earlier than or equal to the `To` date.
              </p>
            )}
          </div>
        </section>

        {hasInvalidDateRange ? (
          <section className="rounded-2xl border border-[#F5C2C7] bg-[#FFF5F6] p-6 flex flex-col gap-3">
            <p className="text-lg font-semibold text-black">
              Invalid date range
            </p>
            <p className="text-sm text-[#6B7280] max-w-xl">
              Update your `From` and `To` filters so the range is valid.
            </p>
          </section>
        ) : error && news.length === 0 ? (
          <section className="rounded-2xl border border-[#F5C2C7] bg-[#FFF5F6] p-6 flex flex-col gap-3">
            <p className="text-lg font-semibold text-black">
              Could not load news
            </p>
            <p className="text-sm text-[#6B7280] max-w-xl">{error}</p>
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
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="text-lg font-semibold text-black">
              No articles found
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">
              Try a different keyword or adjust the other filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
                setCurrentPage(1);
                setSelectedLanguage("en");
                setSelectedCountry("us");
                setFromDate("");
                setToDate("");
              }}
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
                <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
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
                    <div className="p-5 sm:p-6 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wide text-[#6B7280] font-medium">
                        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">
                          {debouncedQuery ? "Health search result" : "Health"}
                        </span>
                        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">
                          {selectedLanguage.toUpperCase()}
                        </span>
                        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">
                          {selectedCountry.toUpperCase()}
                        </span>
                        <span>{featured.source?.name || "Healthcare"}</span>
                        <span>{formatNewsDate(featured.publishedAt)}</span>
                        <span>{estimateReadingTime(featured.content)}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-black leading-snug group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-3">
                        {featured.description || featured.content}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Open original story
                        <ExternalLink size={15} />
                      </span>
                    </div>
                  </a>
                </article>

                <aside className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
                      Quick picks
                    </h2>
                    <span className="text-xs text-[#9CA3AF]">
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
                        className="group rounded-xl border border-[#F3F4F6] p-4 hover:border-[#D1D5DB] hover:bg-[#FCFCFD] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3 text-[11px] text-[#9CA3AF]">
                          <span>{item.source?.name || "Source"}</span>
                          <span>{formatNewsDate(item.publishedAt)}</span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-black leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs text-[#6B7280] line-clamp-2">
                          {item.description || item.content}
                        </p>
                      </a>
                    ))}
                  </div>
                </aside>
              </section>
            )}

            <section className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Latest coverage
                  </h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {debouncedQuery
                      ? `Health-related results for "${debouncedQuery}"`
                      : "Top health headlines from trusted media sources."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1 || isLoading}
                    className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={isLoading || news.length < 10}
                    className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {latest.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
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
                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9CA3AF]">
                          <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[#6B7280]">
                            {item.source?.name || "Source"}
                          </span>
                          <span>{formatNewsDate(item.publishedAt)}</span>
                          <span>
                            {estimateReadingTime(
                              item.content || item.description,
                            )}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-black leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-3">
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

            <section className="rounded-2xl bg-primary text-white px-5 sm:px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Want to see how Blivap turns awareness into action?
                </h2>
                <p className="mt-1 text-sm text-white/85 leading-relaxed">
                  Explore how our platform supports donors, healthcare teams,
                  and people in need across Nigeria.
                </p>
              </div>
              <Link
                href="https://calendly.com/care-blivap/30min"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-primary hover:bg白/90 transition-colors"
              >
                Book a demo
                <ArrowRight size={14} />
              </Link>
            </section>
          </>
        )}
      </div>
    </HomeLayout>
  );
}
