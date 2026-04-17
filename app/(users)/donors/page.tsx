"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Star, Droplet, Loader2 } from "lucide-react";
import { Layout } from "../../../layout/layout.component";
import Link from "next/link";
import { $api } from "@/app/api";
import { parseDonorsListResponse } from "@/lib/donors/parseDonorsListResponse";
import { BLOOD_TYPES, type BloodType, type Donor } from "./donors.data";
import { Avatar } from "@/components/ui/Avatar/avatar.component";

const INITIAL_BATCH = 9;
const BATCH_SIZE = 6;

type DonorsInfiniteGridProps = {
  donors: Donor[];
  emptyMessage: string;
};

function DonorsInfiniteGrid({ donors, emptyMessage }: DonorsInfiniteGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleDonors = useMemo(
    () => donors.slice(0, visibleCount),
    [donors, visibleCount],
  );

  const hasMore = visibleDonors.length < donors.length;

  useEffect(() => {
    if (!hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || isFetchingMore) return;

        setIsFetchingMore(true);
        window.setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, donors.length));
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
  }, [donors.length, hasMore, isFetchingMore]);

  return (
    <>
      {visibleDonors.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-text-secondary">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid  grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 xl:grid-cols-3">
          {visibleDonors.map((donor) => (
            <article
              key={donor.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-5 sm:py-5 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={donor.profileImage} />
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-text-primary">
                      {donor.id.slice(0, 6)}
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

              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star
                    className="size-3.5 fill-[#FACC15] text-[#FACC15]"
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
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-primary/90 sm:px-4 sm:py-2 sm:text-xs"
                >
                  Book Appointment
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="mt-4 h-6" />

      {isFetchingMore && (
        <div className="mt-2 text-center text-xs text-text-secondary">
          Loading more donors…
        </div>
      )}

      {!hasMore && donors.length > 0 && (
        <div className="mt-3 text-center text-[11px] text-text-tertiary">
          You have reached the end of the list.
        </div>
      )}
    </>
  );
}

export default function DonorsPage() {
  const [search, setSearch] = useState("");
  const [activeBloodType, setActiveBloodType] = useState<BloodType>("All");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadDonors = useCallback(async () => {
    setLoadState("loading");
    setFetchError(null);
    try {
      const { data, status } = await $api.donors.list();
      if (status < 200 || status >= 300 || data === undefined) {
        setLoadState("error");
        setFetchError("Could not load donors. Please try again.");
        return;
      }
      setDonors(parseDonorsListResponse(data));
      setLoadState("ok");
    } catch {
      setLoadState("error");
      setFetchError("Could not load donors. Please try again.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- GET /donors on mount
    void loadDonors();
  }, [loadDonors]);

  const filteredDonors = useMemo(() => {
    const term = search.trim().toLowerCase();
    return donors.filter((donor) => {
      const matchesBloodType =
        activeBloodType === "All" || donor.bloodType === activeBloodType;

      if (!term) return matchesBloodType;

      const haystack =
        `${donor.id} ${donor.location} ${donor.country} ${donor.bloodType}`
          .toLowerCase()
          .trim();

      return matchesBloodType && haystack.includes(term);
    });
  }, [activeBloodType, donors, search]);

  const listKey = `${activeBloodType}-${search}`;
  const showInitialSpinner = loadState === "loading" && donors.length === 0;
  const showFatalFetchError = loadState === "error" && donors.length === 0;
  const gridEmptyMessage =
    donors.length === 0
      ? "No donors available yet."
      : "No donors match your filters yet.";

  return (
    <Layout>
      <section className="flex h-full flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
              Donors
            </h1>
            <p className="max-w-xl text-xs text-text-secondary sm:text-sm">
              Browse available donors
            </p>
          </header>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search available donor"
                className="w-full rounded-xl border border-border bg-[#F9FAFB] py-2.5 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm dark:border-white/10 dark:bg-white/6"
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
          {showInitialSpinner ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-text-secondary">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading donors…
            </div>
          ) : showFatalFetchError ? (
            <div className="rounded-xl border border-border bg-white px-4 py-5 text-sm dark:border-white/10 dark:bg-[#1a1a22]">
              <p className="font-medium text-text-primary">
                {fetchError ?? "Could not load donors. Please try again."}
              </p>
              <button
                type="button"
                onClick={() => void loadDonors()}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <DonorsInfiniteGrid
              key={listKey}
              donors={filteredDonors}
              emptyMessage={gridEmptyMessage}
            />
          )}
        </div>
      </section>
    </Layout>
  );
}
