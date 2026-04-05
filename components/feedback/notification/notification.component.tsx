"use client";

import classNames from "classnames";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/notifications/useNotifications.hook";
import { useAppSelector } from "@/store/hooks";

export type { NotificationItem } from "@/hooks/notifications/useNotifications.hook";

function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export const NotificationBell = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    items: notifications,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    refetch,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ enabled: isAuthenticated });

  useEffect(() => {
    if (!isOpen) return;
    void refetch();
  }, [isOpen, refetch]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  //  fade in and out the panel
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (isOpen) {
      el.style.visibility = "visible";
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: 0.96,
        duration: 0.15,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          if (el) el.style.visibility = "hidden";
        },
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      onClick={() => setIsOpen(!isOpen)}
      className="relative flex cursor-pointer items-center justify-center rounded-full border border-[#9CA3AF] p-2 transition-colors order-1 md:order-2 dark:border-white/25 dark:hover:border-white/40"
    >
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#FF0000] px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      <FiBell
        size={18}
        className="stroke-2 text-sm text-[#374151] dark:text-white/85"
      />
      <span
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={classNames(
          "absolute top-10 left-0 flex h-[400px] w-[280px] flex-1 flex-col origin-top-right rounded-xl border border-[#DADADA] bg-white p-3 shadow-[2px_3px_5px_#00000014] md:left-auto md:-right-1 md:w-[350px] dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[2px_4px_24px_rgba(0,0,0,0.45)]",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{ visibility: "hidden", opacity: 0, transform: "scale(0.96)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] p-3 dark:border-white/10">
          <p className="text-sm font-semibold text-black dark:text-white">
            Notifications
          </p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void markAllAsRead();
              }}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 dark:hover:text-primary"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>
        {error && (
          <p className="shrink-0 px-3 pb-2 text-center text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="overflow-y-auto flex-1 min-h-0 p-2 custom-scrollbar">
          {isLoading && notifications.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#6B7280] dark:text-white/50">
              Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#6B7280] dark:text-white/50">
              No notifications yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1 ">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (n.href) router.push(n.href);
                      void markAsRead(n.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (n.href) router.push(n.href);
                    void markAsRead(n.id);
                  }}
                  className={classNames(
                    "rounded-lg p-2.5 transition-colors text-left w-full cursor-pointer",
                    n.read
                      ? "bg-white dark:bg-transparent"
                      : "bg-[#F9FAFB] dark:bg-white/6",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={classNames(
                          "truncate text-sm font-medium",
                          n.read
                            ? "text-[#6B7280] dark:text-white/50"
                            : "text-black dark:text-white",
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280] dark:text-white/55">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-[#9CA3AF] dark:text-white/40">
                        {formatNotificationTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void markAsRead(n.id);
                        }}
                        className="shrink-0 rounded-md p-1.5 text-primary hover:bg-[#E5E7EB] dark:hover:bg-white/10"
                        title="Mark as read"
                        aria-label={`Mark "${n.title}" as read`}
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {hasMore && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void loadMore();
                  }}
                  disabled={isLoadingMore}
                  className="mt-1 w-full rounded-lg py-2 text-xs font-medium text-primary hover:bg-[#F3F4F6] disabled:opacity-50 dark:hover:bg-white/10"
                >
                  {isLoadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>
      </span>
    </div>
  );
};
