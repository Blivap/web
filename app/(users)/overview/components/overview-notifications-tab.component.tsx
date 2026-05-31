"use client";

import classNames from "classnames";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/notifications/useNotifications.hook";
import { formatNotificationTime } from "@/lib/notifications/formatNotificationTime";
import { notificationPresentation } from "@/lib/notifications/notificationPresentation";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { OverviewNotificationsTabSkeleton } from "./overview-notifications-tab-skeleton.component";

export function OverviewNotificationsTab() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const {
    items,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ enabled: isAuthenticated });

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DADADA] bg-white dark:border-white/10 dark:bg-[#1a1a22]">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Updates about donor approval, bookings, and verification.
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit gap-1.5"
            onClick={() => void markAllAsRead()}
          >
            <CheckCheck className="size-4" aria-hidden />
            Mark all as read
          </Button>
        ) : null}
      </div>

      {error ? (
        <p
          className="border-b border-border px-5 py-3 text-sm text-red-600 dark:border-white/10 dark:text-red-400 sm:px-6"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="max-h-[min(70vh,520px)] overflow-y-auto custom-scrollbar">
        {isLoading && items.length === 0 ? (
          <OverviewNotificationsTabSkeleton />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F9E8EE] text-primary dark:bg-primary/20">
              <Bell className="size-7" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-text-primary">
                No notifications yet
              </p>
              <p className="max-w-sm text-sm text-text-secondary">
                When your donor request is approved or booking status changes,
                updates will show up here.
              </p>
            </div>
          </div>
        ) : (
          <ul>
            {items.map((notification, index) => {
              const presentation = notificationPresentation(notification.type);
              const Icon = presentation.Icon;
              const content = (
                <div className="flex items-center justify-between gap-4 w-full">
                  <div
                    className={classNames(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      presentation.iconClassName,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={classNames(
                          "text-sm font-semibold leading-snug",
                          notification.read
                            ? "text-text-secondary"
                            : "text-text-primary",
                        )}
                      >
                        {notification.title}
                      </p>
                      {/* {!notification.read ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      ) : null} */}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
                      <span>
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="font-medium uppercase tracking-wide">
                        {presentation.label}
                      </span>
                      {notification.href ? (
                        <>
                          <span aria-hidden>·</span>
                          <span className="font-medium text-primary">
                            View details
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {!notification.read ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void markAsRead(notification.id);
                      }}
                      className="shrink-0 rounded-lg border border-border p-2 text-primary transition hover:bg-primary/5 dark:border-white/10"
                      title="Mark as read"
                      aria-label={`Mark "${notification.title}" as read`}
                    >
                      <Check className="size-4" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              );

              const rowClassName = classNames(
                "flex gap-4 px-5 py-4 sm:px-6",
                index > 0 ? "border-t border-border dark:border-white/10" : "",
                notification.read
                  ? "bg-white dark:bg-[#1a1a22]"
                  : "border-l-4 bg-[#FFFBFC] dark:bg-primary/5",
                !notification.read && presentation.unreadAccentClassName,
                notification.href
                  ? "cursor-pointer transition hover:bg-[#FAFAFA] dark:hover:bg-white/5"
                  : "",
              );

              return (
                <li key={notification.id}>
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      className={rowClassName}
                      onClick={() => {
                        if (!notification.read) {
                          void markAsRead(notification.id);
                        }
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className={rowClassName}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {hasMore ? (
        <div className="border-t border-border px-5 py-4 sm:px-6 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isLoadingMore}
            onClick={() => void loadMore()}
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
