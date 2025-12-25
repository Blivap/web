"use client";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useSnackbar } from "./snackbar.context";

export type SnackbarSeverity = "success" | "error" | "warning" | "info";

export const Snackbar = () => {
  const { snackbar, hideSnackbar } = useSnackbar();
  const [isVisible, setIsVisible] = useState(false);

  // When snackbar appears, trigger fade-in on next frame
  useEffect(() => {
    if (!snackbar) return;

    const raf = requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => hideSnackbar(), 300);
    }, snackbar.duration || 3000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [snackbar, hideSnackbar]);

  if (!snackbar) return null;

  const severityColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-[#24afb5]",
  };

  const severityIcons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={classNames(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out md:left-[calc(292px+50%)]",
        {
          "opacity-100 translate-y-0": isVisible,
          "opacity-0 translate-y-4 pointer-events-none": !isVisible,
        },
      )}
    >
      <div
        className={classNames(
          "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-70 max-w-[90vw] md:max-w-125",
          severityColors[snackbar.severity || "info"],
        )}
      >
        <span className="text-xl font-bold shrink-0">
          {severityIcons[snackbar.severity || "info"]}
        </span>
        <p className="flex-1 text-sm font-medium wrap-break-words">
          {snackbar.message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => hideSnackbar(), 300);
          }}
          className="text-white hover:text-gray-200 transition-colors shrink-0 ml-2"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
