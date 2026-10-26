"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "../../../layout/layout.component";
import Link from "next/link";
import { $api } from "@/app/api";
import {
  parseDonorRecord,
  parseDonorsListResponse,
  type DonorsListMeta,
} from "@/lib/donors/parseDonorsListResponse";
import { unwrapApiRecord } from "@/lib/donors/unwrapApiData";
import { BLOOD_TYPES, type BloodType, type Donor } from "./donors.data";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListPaginationBar } from "@/components/ui/list-pagination-bar.component";
import { DonorsPageSkeleton } from "./components/donors-page-skeleton.component";
import { Input } from "@/components/forms/inputs/input.component";
import Image from "next/image";
import { SCREENING_DONATION_TYPE_OPTIONS } from "@/lib/donors/screeningDonationTypes";
import { DonorCooldownDisplay } from "./components/donor-cooldown-display.component";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import { useDebouncedSearch } from "@/hooks/navigation/useDebouncedSearch.hook";
import {
  DEFAULT_PAGE_SIZE,
  usePageSize,
} from "@/hooks/navigation/usePageSize.hook";
import {
  useQueryParam,
  useQueryParamNumber,
  useSetQueryParams,
} from "@/hooks/navigation/useQueryParamState.hook";
import {
  applyOwnerCooldown,
  donorIsCoolingDown,
} from "@/lib/donors/donorCooldown";
import { displayPublicId } from "@/lib/users/formatPublicId";
import { routes } from "@/config/routes";
import { Button } from "@/components/button/button.component";

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

const DEFAULT_META: DonorsListMeta = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
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
  const bookingBlocked = donorIsCoolingDown(donor);
  const routeOwner = isOwner ? routes.settings : routes.donorsDetail(donor.id);
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_8px_16px_rgba(15,23,42,0.03)] sm:px-5 sm:py-5 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar src={donor.profileImage ?? undefined} />
          <div className="min-w-0 flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-primary">
              {displayPublicId(donor.publicId)}
            </p>
            <div className="mb-3">
              <DonorCooldownDisplay
                cooldownEndsAt={donor.cooldownEndsAt}
                unavailable={
                  donor.isInDonationCooldown || donor.isPermanentDonationBlock
                }
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

      <div className="mt-2 flex items-center justify-between gap-3">
        <p
          className="min-w-0 flex-1 truncate text-xs text-text-secondary"
          title={`${donor.location}, ${donor.country}`}
        >
          {donor.location}, {donor.country}
        </p>
        {isOwner ? (
          <Link
            href={routeOwner}
            prefetch={false}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-primary/90 sm:px-4 sm:py-2 sm:text-xs"
          >
            Settings
          </Link>
        ) : (
          <Button
            type="button"
            size="xs"
            disabled={bookingBlocked}
            className="px-3 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-xs"
            {...(bookingBlocked ? {} : { href: routeOwner, prefetch: false })}
          >
            Book Appointment
          </Button>
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
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

function DonorsPaginatedGrid({
  donors,
  meta,
  emptyMessage,
  isRefetching,
  currentUserId,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DonorsPaginatedGridProps) {
  const { page: safePage, totalPages, total } = meta;

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
      className={`flex flex-col gap-4 transition-opacity ${isRefetching ? "pointer-events-none opacity-60" : ""}`}
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

      <ListPaginationBar
        className="mt-auto"
        page={safePage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        hasNextPage={meta.hasNextPage}
        hasPreviousPage={meta.hasPreviousPage}
        disabled={isRefetching}
      />
    </div>
  );
}

function DonorsPageContent() {
  const { user } = useDashboard();
  const setParams = useSetQueryParams();
  const [urlSearch] = useQueryParam("q", "", { omitWhen: "" });
  const [activeBloodType] = useQueryParam("bloodType", "All", {
    omitWhen: "All",
    allowed: BLOOD_TYPES,
  });
  const [page, setPage] = useQueryParamNumber("page", 1, { omitWhen: 1 });
  const [pageSize, setPageSize] = usePageSize();
  const [searchInput, setSearchInput] = useDebouncedSearch(
    urlSearch,
    (trimmed) => {
      setParams({
        q: trimmed || null,
        page: null,
      });
    },
  );
  const [donors, setDonors] = useState<Donor[]>([]);
  const [ownerCooldownEndsAt, setOwnerCooldownEndsAt] = useState<
    string | null | undefined
  >(undefined);
  const [meta, setMeta] = useState<DonorsListMeta>(DEFAULT_META);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const bloodType = (
    BLOOD_TYPES.includes(activeBloodType as BloodType) ? activeBloodType : "All"
  ) as BloodType;

  const loadDonors = useCallback(async () => {
    setLoadState("loading");
    setFetchError(null);
    try {
      const { data, status } = await $api.donors.list({
        page,
        limit: pageSize,
        ...(urlSearch ? { search: urlSearch } : {}),
        ...(bloodType !== "All" ? { bloodType } : {}),
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
  }, [page, pageSize, urlSearch, bloodType]);

  useEffect(() => {
    /* Fetch when filters change — async work is deferred inside loadDonors. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load donors on mount/filter change
    void loadDonors();
  }, [loadDonors]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, status } = await $api.donors.me();
        if (cancelled || status < 200 || status >= 300 || !data) return;
        const raw =
          unwrapApiRecord(data) ?? (typeof data === "object" ? data : null);
        const row = parseDonorRecord(raw);
        if (!cancelled) setOwnerCooldownEndsAt(row?.cooldownEndsAt ?? null);
      } catch {
        if (!cancelled) setOwnerCooldownEndsAt(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleDonors = useMemo(
    () => applyOwnerCooldown(donors, user?.id, ownerCooldownEndsAt),
    [donors, ownerCooldownEndsAt, user?.id],
  );

  const handleBloodTypeChange = (value: BloodType) => {
    setParams({
      bloodType: value === "All" ? null : value,
      page: null,
    });
  };

  const showInitialSkeleton = loadState === "loading" && donors.length === 0;
  const showFatalFetchError = loadState === "error" && donors.length === 0;
  const isRefetching = loadState === "loading" && donors.length > 0;
  const gridEmptyMessage =
    urlSearch || bloodType !== "All"
      ? "No donors match your filters yet."
      : "No donors available yet.";

  return (
    <section className="flex flex-col gap-6">
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

          <div className="w-full sm:w-50">
            <Select
              value={bloodType}
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

      <div>
        {showInitialSkeleton ? (
          <DonorsPageSkeleton count={pageSize} />
        ) : showFatalFetchError ? (
          <div className="rounded-xl border border-border bg-white px-4 py-5 text-sm dark:border-white/10 dark:bg-[#1a1a22]">
            <p className="font-medium text-text-primary">
              {fetchError ?? "Could not load donors. Please try again."}
            </p>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="mt-3 h-auto p-0 text-xs"
              onClick={() => void loadDonors()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <DonorsPaginatedGrid
            donors={visibleDonors}
            meta={meta}
            emptyMessage={gridEmptyMessage}
            isRefetching={isRefetching}
            currentUserId={user?.id}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </section>
  );
}

export default function DonorsPage() {
  return (
    <Layout>
      <Suspense fallback={<DonorsPageSkeleton count={DEFAULT_PAGE_SIZE} />}>
        <DonorsPageContent />
      </Suspense>
    </Layout>
  );
}
