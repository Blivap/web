"use client";

import Image from "next/image";
import classNames from "classnames";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IAvatar } from "@/types";

const PAGE_SIZE = 12;

const chevronClass =
  "absolute top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-text-primary shadow-sm ring-1 ring-black/10 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-35 dark:bg-[#2c2c34] dark:text-white dark:ring-white/15 dark:hover:bg-[#3a3a44]";

type AvatarPickerProps = {
  avatars: IAvatar[] | null;
  isLoading: boolean;
  selectedUrl: string | null;
  onSelect: (url: string) => void;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  tileClassName: string;
  frameClassName: string;
  skeletonClassName?: string;
};

export function AvatarPicker({
  avatars,
  isLoading,
  selectedUrl,
  onSelect,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  tileClassName,
  frameClassName,
  skeletonClassName = "animate-pulse",
}: AvatarPickerProps) {
  const showSkeleton = isLoading || !avatars;
  const currentPage = Math.max(1, page);
  const pageCount = Math.max(1, totalPages);

  return (
    <div className={frameClassName}>
      <div className="relative">
        <button
          type="button"
          aria-label="Previous avatars"
          disabled={showSkeleton || !hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          className={classNames(chevronClass, "-left-7.5")}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <div
          role="group"
          className="grid grid-cols-4 grid-rows-3 gap-4"
          aria-label={
            showSkeleton
              ? "Loading avatars"
              : `Avatars, page ${currentPage} of ${pageCount}`
          }
        >
          {showSkeleton
            ? Array.from({ length: PAGE_SIZE }, (_, index) => (
                <div
                  key={index}
                  className={classNames(tileClassName, skeletonClassName)}
                />
              ))
            : Array.from({ length: PAGE_SIZE }, (_, index) => {
                const avatar = avatars?.[index];
                if (!avatar) {
                  return (
                    <div
                      key={`empty-${index}`}
                      aria-hidden
                      className={classNames(tileClassName, "invisible")}
                    />
                  );
                }
                const selected = selectedUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    aria-label={`Avatar option ${(currentPage - 1) * PAGE_SIZE + index + 1}`}
                    aria-pressed={selected}
                    className={classNames(
                      tileClassName,
                      "relative overflow-hidden transition-all duration-150 hover:border-3 hover:border-primary",
                      selected && "border-3 border-primary",
                    )}
                    onClick={() => onSelect(avatar.url)}
                  >
                    <Image
                      src={avatar.url}
                      alt=""
                      fill
                      sizes="60px"
                      className="object-fit bg-center bg-no-repeat"
                      unoptimized
                    />
                  </button>
                );
              })}
        </div>
        <button
          type="button"
          aria-label="Next avatars"
          disabled={showSkeleton || !hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className={classNames(chevronClass, "-right-7.5")}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
