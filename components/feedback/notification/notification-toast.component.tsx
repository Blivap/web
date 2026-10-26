"use client";

import { notificationBodyToPlainText } from "@/lib/notifications/notificationBody";
import { notificationPresentation } from "@/lib/notifications/notificationPresentation";
import { resolveNotificationHref } from "@/lib/notifications/resolveNotificationHref";
import {
  markNotificationRead,
  subscribeNotificationToasts,
} from "@/lib/notifications/notificationInboxStore";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const VISIBLE_MS = 5600;
const SLIDE_MS = 500;

type ToastPhase = "closed" | "open" | "leaving";

export function NotificationToast() {
  const router = useRouter();
  const {
    activeToast: current,
    enqueueToast,
    dismissActiveToast,
  } = useSnackbar();
  const [phase, setPhase] = useState<ToastPhase>("closed");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    return subscribeNotificationToasts(enqueueToast);
  }, [enqueueToast]);

  useEffect(() => {
    if (!current || phase !== "closed") return;
    // Paint the off-screen position first, then slide in.
    const frame = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(frame);
  }, [current, phase]);

  const dismiss = useCallback(() => {
    setPaused(false);
    setPhase((currentPhase) =>
      currentPhase === "open" ? "leaving" : currentPhase,
    );
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const id = window.setTimeout(() => {
      dismissActiveToast();
      setPhase("closed");
    }, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [dismissActiveToast, phase]);

  useEffect(() => {
    if (!current || phase !== "open" || paused) return;
    const id = window.setTimeout(dismiss, VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [current, phase, paused, dismiss]);

  const href = current
    ? resolveNotificationHref(current.type, current.data)
    : null;
  const presentation = current ? notificationPresentation(current.type) : null;
  const Icon = presentation?.Icon;
  const preview = current ? notificationBodyToPlainText(current.body) : "";

  if (!current || !Icon || !presentation) return null;

  const open = () => {
    if (!current.readAt) void markNotificationRead(current.id);
    if (href) router.push(href);
    dismiss();
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center px-3",
        "transition-transform ease-out motion-reduce:transition-none",
        phase === "open" ? "translate-y-3" : "-translate-y-full",
      )}
      style={{ transitionDuration: `${SLIDE_MS}ms` }}
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
