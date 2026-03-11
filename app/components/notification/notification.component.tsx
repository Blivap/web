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
      className="relative border border-[#9CA3AF] rounded-full p-2 flex items-center justify-center order-1 md:order-2 cursor-pointer"
    >
      {unreadCount > 0 && (
        <div className="absolute size-1.5 bg-[#FF0000] rounded-full top-2 right-3 border border-white" />
      )}
      <FiBell size={18} className="stroke-2 text-sm" />
      <span
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={classNames(
          "w-[280px] md:w-[350px] h-[400px] absolute top-10 left-0 md:left-auto md:-right-1 bg-white rounded border border-[#DADADA] shadow-[2px_3px_5px_#00000014] p-3 origin-top-right flex-1 flex flex-col",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{ visibility: "hidden", opacity: 0, transform: "scale(0.96)" }}
      >
        <div className="p-3 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <p className="text-sm font-semibold text-black">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 p-2 custom-scrollbar">
          {notifications.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-6 text-center">
              No notifications yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1 ">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={classNames(
                    "rounded-lg p-2.5 transition-colors",
                    n.read ? "bg-white" : "bg-[#F9FAFB]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={classNames(
                          "text-sm font-medium truncate",
                          n.read ? "text-[#6B7280]" : "text-black",
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] mt-1">
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
                        className="shrink-0 p-1.5 rounded-md hover:bg-[#E5E7EB] text-primary"
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
