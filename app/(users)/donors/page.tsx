"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { Droplet } from "lucide-react";
import { Layout } from "../../../layout/layout.component";
import Link from "next/link";
import { $api } from "@/app/api";
import {
  parseDonorsListResponse,
  type DonorsListMeta,
} from "@/lib/donors/parseDonorsListResponse";
import { BLOOD_TYPES, type BloodType, type Donor } from "./donors.data";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination-controls.component";
import { DonorsPageSkeleton } from "./components/donors-page-skeleton.component";
import { Input } from "@/components/forms/inputs/input.component";
import Image from "next/image";
import { SCREENING_DONATION_TYPE_OPTIONS } from "@/lib/donors/screeningDonationTypes";
import { DonorCooldownDisplay } from "./components/donor-cooldown-display.component";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import { resolveDonorCooldown } from "@/lib/donors/donorCooldown";
import { routes } from "@/config/routes";

const DONATION_TYPE_LABELS = new Map(
  SCREENING_DONATION_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

function donationTypeLabel(type: string): string {
  return (
    DONATION_TYPE_LABELS.get(
      type as (typeof SCREENING_DONATION_TYPE_OPTIONS)[number]["value"],
    ) ?? type.replace(/_/g, " ")
  );
}

const PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 400;

const DEFAULT_META: DonorsListMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

function DonorCard({
  donor,
  currentUserId,
}: {
  donor: Donor;
  currentUserId?: string;
}) {
  const isOwner =
    !!currentUserId && !!donor.userId && donor.userId === currentUserId;
  const cooldown = resolveDonorCooldown(donor.cooldownEndsAt);
  const bookingBlocked = cooldown.isActive;
  const routeOwner = isOwner ? routes.settings : routes.donorsDetail(donor.id);
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-5 sm:py-5 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar src={donor.profileImage ?? undefined} />
          <div className="min-w-0 flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-text-primary">
              {donor.userId?.slice(0, 6)}
            </p>
            <div className="mb-3">
              <DonorCooldownDisplay
                cooldownEndsAt={donor.cooldownEndsAt}
                variant={isOwner ? "owner" : "public"}
              />
            </div>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FDECEE] px-2 py-2 text-[11px] font-medium text-primary dark:bg-primary/20">
          <span className="uppercase">{donor.bloodType}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {donor.activeDonationTypes.length === 0 ? (
          <span className="text-[11px] text-text-tertiary">—</span>
        ) : (
          donor.activeDonationTypes.slice(0, 3).map((type) => (
            <span
              key={type}
              className="inline-flex max-w-full truncate rounded-full border border-border bg-[#F4F4F5] px-2 py-0.5 text-[10px] font-medium text-text-secondary dark:border-white/10 dark:bg-white/8 dark:text-text-secondary"
            >
              {donationTypeLabel(type)}
            </span>
          ))
        )}
        {donor.activeDonationTypes.length > 3 ? (
          <span className="text-[11px] text-text-tertiary">...</span>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-xs text-text-secondary">
          {donor.location}, {donor.country}
        </p>
        {bookingBlocked && !isOwner ? (
          <span
            className="inline-flex items-center justify-center rounded-lg border border-border bg-[#F4F4F5] px-3 py-1.5 text-[11px] font-medium text-text-tertiary sm:px-4 sm:py-2 sm:text-xs dark:border-white/10 dark:bg-white/8"
            aria-disabled
          >
            Booking paused
          </span>
        ) : (
          <Link
            href={routeOwner}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-primary/90 sm:px-4 sm:py-2 sm:text-xs"
          >
            {!isOwner ? "Book Appointment" : "Settings"}
          </Link>
        )}
      </div>
    </article>
  );
}

type DonorsPaginatedGridProps = {
  donors: Donor[];
  meta: DonorsListMeta;
  emptyMessage: string;
  isRefetching: boolean;
  currentUserId?: string;
  onPageChange: (page: number) => void;
};

function DonorsPaginatedGrid({
  donors,
  meta,
  emptyMessage,
  isRefetching,
  currentUserId,
  onPageChange,
}: DonorsPaginatedGridProps) {
  const { page: safePage, totalPages, total, limit } = meta;

  const rangeFrom = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const rangeTo = Math.min(safePage * limit, total);

  if (total === 0 && !isRefetching) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <Image src="/svg/nodata.svg" alt="No data" width={100} height={100} />
        <p className="text-sm text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full flex-col gap-4 transition-opacity ${isRefetching ? "pointer-events-none opacity-60" : ""}`}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-5 md:gap-6 xl:grid-cols-3">
        {donors.map((donor) => (
          <DonorCard
            key={donor.id}
            donor={donor}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3 rounded-lg border border-border bg-[#F9FAFB] px-3 py-3 dark:border-white/10 dark:bg-white/6 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-center text-xs text-text-secondary sm:text-left">
          Showing{" "}
          <span className="font-semibold text-text-primary">
            {rangeFrom}–{rangeTo}
          </span>{" "}
          of <span className="font-semibold text-text-primary">{total}</span>
          {totalPages > 1 ? (
            <span className="text-text-tertiary">
              {" "}
              · Page {safePage} of {totalPages}
            </span>
          ) : null}
        </p>
        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          disabled={isRefetching}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

export default function DonorsPage() {
  const { user } = useDashboard();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeBloodType, setActiveBloodType] = useState<BloodType>("All");
  const [page, setPage] = useState(1);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [meta, setMeta] = useState<DonorsListMeta>(DEFAULT_META);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const applyDebouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
        setPage(1);
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    applyDebouncedSearch(searchInput.trim());
    return () => applyDebouncedSearch.cancel();
  }, [searchInput, applyDebouncedSearch]);

  const loadDonors = useCallback(async () => {
    setLoadState("loading");
    setFetchError(null);
    try {
      const { data, status } = await $api.donors.list({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(activeBloodType !== "All" ? { bloodType: activeBloodType } : {}),
      });
      if (status < 200 || status >= 300 || data === undefined) {
        setLoadState("error");
        setFetchError("Could not load donors. Please try again.");
        return;
      }
      const parsed = parseDonorsListResponse(data);
      setDonors(parsed.donors);
      setMeta(parsed.meta);
      setLoadState("ok");
    } catch {
      setLoadState("error");
      setFetchError("Could not load donors. Please try again.");
    }
  }, [page, debouncedSearch, activeBloodType]);

  useEffect(() => {
    /* Fetch when filters change — async work is deferred inside loadDonors. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load donors on mount/filter change
    void loadDonors();
  }, [loadDonors]);

  const handleBloodTypeChange = (value: BloodType) => {
    setActiveBloodType(value);
    setPage(1);
  };

  const showInitialSkeleton = loadState === "loading" && donors.length === 0;
  const showFatalFetchError = loadState === "error" && donors.length === 0;
  const isRefetching = loadState === "loading" && donors.length > 0;
  const gridEmptyMessage =
    debouncedSearch || activeBloodType !== "All"
      ? "No donors match your filters yet."
      : "No donors available yet.";

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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <Input
              name="search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search available donor"
              autoComplete="off"
              aria-label="Search donors"
            />

            <div className="w-full sm:w-[200px]">
              <Select
                value={activeBloodType}
                onValueChange={(v) => handleBloodTypeChange(v as BloodType)}
              >
                <SelectTrigger
                  id="blood-type-filter"
                  className="w-full border-border bg-[#F9FAFB] dark:border-white/10 dark:bg-white/6"
                >
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "All" ? "All types" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="h-full grow overflow-scroll">
          {showInitialSkeleton ? (
            <DonorsPageSkeleton count={PAGE_SIZE} />
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
            <DonorsPaginatedGrid
              donors={donors}
              meta={meta}
              emptyMessage={gridEmptyMessage}
              isRefetching={isRefetching}
              currentUserId={user?.id}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>
    </Layout>
  );
}
