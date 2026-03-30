"use client";

import classNames from "classnames";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Check, CheckCheck } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO or display string
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Donation reminder",
    message: "You're eligible to donate again. Book your next appointment.",
    read: false,
    createdAt: "2024-03-10T14:00:00",
  },
  {
    id: "2",
    title: "Appointment confirmed",
    message:
      "Your donation appointment at Lagos Blood Bank is confirmed for Mar 15.",
    read: false,
    createdAt: "2024-03-09T10:30:00",
  },
  {
    id: "3",
    title: "Profile updated",
    message: "Your profile picture was updated successfully.",
    read: true,
    createdAt: "2024-03-08T09:15:00",
  },
  {
    id: "4",
    title: "Welcome to Blivap",
    message:
      "Thank you for registering as a donor. Complete your profile to get started.",
    read: true,
    createdAt: "2024-03-05T12:00:00",
  },
];

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
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    () => MOCK_NOTIFICATIONS,
  );
  const panelRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
        <div className="absolute top-2 right-3 size-1.5 rounded-full border border-white bg-[#FF0000] dark:border-[#111118]" />
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
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 dark:hover:text-primary"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 p-2 custom-scrollbar">
          {notifications.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#6B7280] dark:text-white/50">
              No notifications yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1 ">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={classNames(
                    "rounded-lg p-2.5 transition-colors",
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
                          markAsRead(n.id);
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
            </div>
          )}
        </div>
      </span>
    </div>
  );
};
