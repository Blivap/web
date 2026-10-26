"use client";

import { notificationBodyToPlainText } from "@/lib/notifications/notificationBody";
import { notificationPresentation } from "@/lib/notifications/notificationPresentation";
import { resolveNotificationHref } from "@/lib/notifications/resolveNotificationHref";
import {
  markNotificationRead,
  subscribeNotificationToasts,
} from "@/lib/notifications/notificationInboxStore";
import type { InAppNotification } from "@/types/notifications";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const VISIBLE_MS = 5600;
const SLIDE_MS = 480;

export function NotificationToast() {
  const router = useRouter();
  const [queue, setQueue] = useState<InAppNotification[]>([]);
  const [current, setCurrent] = useState<InAppNotification | null>(null);
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    return subscribeNotificationToasts((notification) => {
      setQueue((items) =>
        items.some((item) => item.id === notification.id)
          ? items
          : [...items, notification],
      );
    });
  }, []);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next ?? null);
    setShown(false);
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [current, queue]);

  const dismiss = useCallback(() => {
    setShown(false);
    setPaused(false);
    window.setTimeout(() => setCurrent(null), SLIDE_MS);
  }, []);

  useEffect(() => {
    if (!current || !shown || paused) return;
    const id = window.setTimeout(dismiss, VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [current, shown, paused, dismiss]);

  if (!current) return null;

  const href = resolveNotificationHref(current.type, current.data);
  const presentation = notificationPresentation(current.type);
  const Icon = presentation.Icon;
  const preview = notificationBodyToPlainText(current.body);

  const open = () => {
    if (!current.readAt) void markNotificationRead(current.id);
    if (href) router.push(href);
    dismiss();
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center px-3",
        "transition-transform duration-500 ease-out motion-reduce:transition-none",
        shown ? "translate-y-[4.5rem]" : "-translate-y-full",
      )}
    >
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[#e7b4ba] bg-[#fff4f1] shadow-[0_2px_8px_rgba(150,0,24,0.08)] dark:border-[#c45b68]/40 dark:bg-[#2a1418] dark:shadow-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          type="button"
          onClick={open}
          className="flex w-full items-start gap-3 px-3.5 py-3 text-left"
        >
          <span
            className={cn(
              "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-[#e7b4ba] dark:border-[#c45b68]/40",
              presentation.iconClassName,
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#960018] dark:text-[#ffb4be]">
              {presentation.label}
            </span>
            <span className="mt-0.5 block text-sm font-medium text-[#3d2426] dark:text-[#ffe4e6]">
              {current.title}
            </span>
            {preview ? (
              <span className="mt-0.5 line-clamp-2 block text-xs font-normal leading-relaxed text-[#6d3a40] dark:text-[#e7c5c8]">
                {preview}
              </span>
            ) : null}
          </span>
        </button>
      </div>
    </div>
  );
}
