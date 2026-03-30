/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Star, Droplet } from "lucide-react";
import { Layout } from "../../layout/layout.component";
import Link from "next/link";
import { ALL_DONORS, BLOOD_TYPES, type BloodType } from "./donors.data";

const INITIAL_BATCH = 9;
const BATCH_SIZE = 6;

export default function DonorsPage() {
  const [search, setSearch] = useState("");
  const [activeBloodType, setActiveBloodType] = useState<BloodType>("All");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredDonors = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ALL_DONORS.filter((donor) => {
      const matchesBloodType =
        activeBloodType === "All" || donor.bloodType === activeBloodType;

      if (!term) return matchesBloodType;

      const haystack =
        `${donor.id} ${donor.location} ${donor.country} ${donor.bloodType}`
          .toLowerCase()
          .trim();

      return matchesBloodType && haystack.includes(term);
    });
  }, [activeBloodType, search]);

  const visibleDonors = useMemo(
    () => filteredDonors.slice(0, visibleCount),
    [filteredDonors, visibleCount],
  );

  const hasMore = visibleDonors.length < filteredDonors.length;

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [activeBloodType, search]);

  useEffect(() => {
    if (!hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || isFetchingMore) return;

        setIsFetchingMore(true);
        // Simulate async fetch; replace with API call when backend is ready
        window.setTimeout(() => {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_SIZE, filteredDonors.length),
          );
          setIsFetchingMore(false);
        }, 350);
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [filteredDonors.length, hasMore, isFetchingMore]);

  return (
    <Layout>
      <section className="flex flex-col gap-6 h-full flex-1">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
              Donors
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Browse available donors
            </p>
          </header>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search available donor"
                className="w-full rounded-xl border border-border bg-[#F9FAFB] py-2.5 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm dark:bg-white/[0.06] dark:border-white/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {BLOOD_TYPES.map((type) => {
                const selected = activeBloodType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveBloodType(type)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors sm:px-4 sm:text-sm ${
                      selected
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-text-primary dark:border-white/10 dark:bg-[#1a1a22]"
                    }`}
                  >
                    {type === "All" ? "All Types" : type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-full grow overflow-scroll">
          {visibleDonors.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-text-secondary ">
              No donors match your filters yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6   grow h-full">
              {visibleDonors.map((donor) => (
                <article
                  key={donor.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-5 sm:py-5 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6] sm:size-11 dark:bg-white/10">
                        <span className="text-xs font-medium text-text-primary">
                          {donor.id.slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold text-text-primary">
                          {donor.id}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {donor.packs} packs
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-[#FDECEE] px-2 py-1 text-[11px] font-medium text-primary dark:bg-primary/20">
                      <span>{donor.bloodType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star
                        className="size-3.5 text-[#FACC15] fill-[#FACC15]"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs font-medium text-text-primary">
                        {donor.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Droplet className="size-3.5 text-primary" />
                      <span>{donor.donations} donations</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <p className="text-xs text-text-secondary">
                        {donor.location}, {donor.country}
                      </p>
                    </div>
                    <Link
                      href={`/donors/${encodeURIComponent(donor.id)}`}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-[11px] sm:text-xs font-medium text-white hover:bg-primary/90 transition-colors"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div ref={sentinelRef} className="h-6 mt-4" />

          {isFetchingMore && (
            <div className="mt-2 text-xs text-text-secondary text-center">
              Loading more donors…
            </div>
          )}

          {!hasMore && filteredDonors.length > 0 && (
            <div className="mt-3 text-[11px] text-text-tertiary text-center">
              You have reached the end of the list.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
