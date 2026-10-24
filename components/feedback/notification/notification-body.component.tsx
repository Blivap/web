"use client";

import { useState } from "react";
import classNames from "classnames";
import {
  notificationBodyLooksLikeHtml,
  notificationBodyToPlainText,
  sanitizeNotificationHtml,
} from "@/lib/notifications/notificationBody";

type NotificationBodyProps = {
  message: string;
  /**
   * Compact one/two-line plain preview (popover / collapsed list).
   * When false, still starts collapsed and expands on demand for long bodies.
   */
  preview?: boolean;
  className?: string;
};

const PREVIEW_CHARS = 140;

/**
 * Renders notification body HTML safely, or a plain-text preview for compact lists.
 * Long bodies stay collapsed by default so list rows stay scannable.
 */
export function NotificationBody({
  message,
  preview = false,
  className,
}: NotificationBodyProps) {
  const plain = notificationBodyToPlainText(message);
  const isHtml = notificationBodyLooksLikeHtml(message);
  const isLong = plain.length > PREVIEW_CHARS || (isHtml && plain.length > 90);
  const [expanded, setExpanded] = useState(false);

  if (preview) {
    return (
      <p
        className={classNames(
          "line-clamp-2 text-xs leading-snug text-[#6B7280] dark:text-white/55",
          className,
        )}
      >
        {plain}
      </p>
    );
  }

  if (!isLong || !expanded) {
    return (
      <div className={classNames("flex flex-col gap-1.5", className)}>
        <p className="line-clamp-2 text-[13px] leading-snug text-text-secondary">
          {plain}
        </p>
        {isLong ? (
          <button
            type="button"
            className="w-fit text-[12px] font-medium text-primary hover:underline"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(true);
            }}
          >
            Show more
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={classNames("flex flex-col gap-1.5", className)}>
      <div
        className={classNames(
          "notification-body max-h-40 overflow-y-auto rounded-lg border border-border/70 bg-[#FAFAFA] px-3 py-2.5 text-[13px] leading-relaxed text-text-secondary custom-scrollbar dark:border-white/10 dark:bg-white/5",
          "[&_p]:mt-0 [&_p]:mb-2.5 [&_p:last-child]:mb-0",
          "[&_br]:block [&_br]:content-[''] [&_br]:mt-2",
          "[&_strong]:font-semibold [&_strong]:text-text-primary",
          "[&_b]:font-semibold [&_b]:text-text-primary",
          "[&_em]:italic [&_i]:italic",
          "[&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4",
        )}
        dangerouslySetInnerHTML={{
          __html: isHtml
            ? sanitizeNotificationHtml(message)
            : sanitizeNotificationHtml(plain),
        }}
      />
      <button
        type="button"
        className="w-fit text-[12px] font-medium text-primary hover:underline"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setExpanded(false);
        }}
      >
        Show less
      </button>
    </div>
  );
}
