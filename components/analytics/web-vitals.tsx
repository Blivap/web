"use client";

import { useReportWebVitals } from "next/web-vitals";

type Gtag = (...args: unknown[]) => void;

/** Forwards Core Web Vitals to GA4 when the analytics script is present. */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const gtag = (window as Window & { gtag?: Gtag }).gtag;
    if (typeof gtag !== "function") return;

    gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value,
      ),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  });

  return null;
}
