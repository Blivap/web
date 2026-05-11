"use client";

import classNames from "classnames";
import gsap from "gsap";
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useSnackbar } from "./snackbar.context";

export type SnackbarSeverity = "success" | "error" | "warning" | "info";

const ENTER_MS = 760;
const EXIT_MS = 380;

export const Snackbar = () => {
  const { snackbar, hideSnackbar } = useSnackbar();
  const [displayedSnackbar, setDisplayedSnackbar] = useState(snackbar);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const dismissTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const idleTweenRef = useRef<ReturnType<typeof gsap.to> | null>(null);

  const clearTimers = useCallback(() => {
    if (dismissTimeoutRef.current != null) {
      window.clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current != null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const closeSnackbar = useCallback(() => {
    clearTimers();
    setIsClosing(true);
    setIsVisible(false);
    hideTimeoutRef.current = window.setTimeout(() => {
      hideSnackbar();
      setDisplayedSnackbar(null);
      setIsClosing(false);
    }, EXIT_MS);
  }, [clearTimers, hideSnackbar]);

  useEffect(() => {
    if (!snackbar) return;

    clearTimers();
    setDisplayedSnackbar(snackbar);
    setIsClosing(false);
    setIsVisible(false);

    const raf = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    dismissTimeoutRef.current = window.setTimeout(
      closeSnackbar,
      snackbar.duration ?? 3000,
    );

    return () => {
      cancelAnimationFrame(raf);
      clearTimers();
    };
  }, [clearTimers, closeSnackbar, snackbar]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const panel = panelRef.current;
    const accent = accentRef.current;
    const content = contentRef.current;
    const closeButton = closeButtonRef.current;
    if (!displayedSnackbar || !shell || !panel || !accent || !content || !closeButton) {
      return;
    }

    idleTweenRef.current?.kill();
    idleTweenRef.current = null;
    gsap.killTweensOf([shell, panel, accent, content, closeButton]);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(shell, {
        autoAlpha: isVisible ? 1 : 0,
        x: 0,
        y: isVisible ? 0 : -10,
        rotate: 0,
      });
      gsap.set(panel, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        rotateX: 0,
        skewY: 0,
        filter: "blur(0px)",
      });
      gsap.set(accent, { scaleY: 1, transformOrigin: "top center" });
      gsap.set(content, { opacity: 1, x: 0, y: 0, filter: "blur(0px)" });
      gsap.set(closeButton, {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      });
      return;
    }

    if (!isVisible && !isClosing) {
      gsap.set(shell, {
        autoAlpha: 0,
        x: 120,
        y: -72,
        rotate: -8,
        transformPerspective: 1400,
      });
      gsap.set(panel, {
        x: 0,
        y: 0,
        scaleX: 0.84,
        scaleY: 0.78,
        rotate: -6,
        rotateX: -18,
        skewY: -4,
        filter: "blur(10px) brightness(1.08)",
        transformOrigin: "top right",
        transformPerspective: 1400,
      });
      gsap.set(accent, {
        scaleY: 0.18,
        yPercent: -32,
        transformOrigin: "top center",
      });
      gsap.set(content, {
        opacity: 0,
        x: 26,
        y: 18,
        filter: "blur(10px)",
      });
      gsap.set(closeButton, {
        opacity: 0,
        x: 24,
        y: -12,
        rotate: -22,
        scale: 0.8,
      });
      return;
    }

    if (isVisible) {
      const tl = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          gsap.set([shell, panel, accent, content, closeButton], {
            clearProps: "will-change,filter",
          });
          idleTweenRef.current = gsap.to(panel, {
            y: "-=1.8",
            rotate: 0.18,
            duration: 1.85,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        },
      });

      gsap.set([shell, panel, accent, content, closeButton], {
        willChange: "transform, opacity, filter",
      });

      tl.set(shell, { autoAlpha: 1 }, 0)
        .to(
        shell,
        {
          keyframes: [
            {
              x: -20,
              y: 18,
              rotate: 2.4,
              duration: 0.22,
              ease: "power3.out",
            },
            {
              x: 7,
              y: -6,
              rotate: -0.9,
              duration: 0.18,
              ease: "sine.inOut",
            },
            {
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.2,
              ease: "power2.out",
            },
          ],
        },
        0,
      )
        .to(
          panel,
          {
            keyframes: [
              {
                scaleX: 1.05,
                scaleY: 0.97,
                rotate: 1.8,
                rotateX: 8,
                skewY: 1.4,
                filter: "blur(0px) brightness(1)",
                duration: 0.28,
                ease: "power4.out",
              },
              {
                scaleX: 0.992,
                scaleY: 1.012,
                rotate: -0.65,
                rotateX: -2,
                skewY: -0.45,
                duration: 0.2,
                ease: "sine.inOut",
              },
              {
                scaleX: 1,
                scaleY: 1,
                rotate: 0,
                rotateX: 0,
                skewY: 0,
                duration: ENTER_MS / 1000 - 0.48,
                ease: "power2.out",
              },
            ],
          },
          0,
        )
        .to(
          accent,
          {
            keyframes: [
              {
                scaleY: 1.22,
                yPercent: 8,
                duration: 0.24,
                ease: "power3.out",
              },
              {
                scaleY: 0.92,
                yPercent: -3,
                duration: 0.16,
                ease: "sine.inOut",
              },
              {
                scaleY: 1,
                yPercent: 0,
                duration: 0.18,
                ease: "power2.out",
              },
            ],
          },
          0.06,
        )
        .to(
          content,
          {
            keyframes: [
              {
                opacity: 1,
                x: -6,
                y: -2,
                filter: "blur(0px)",
                duration: 0.24,
                ease: "power2.out",
              },
              {
                x: 2,
                y: 1,
                duration: 0.14,
                ease: "sine.inOut",
              },
              {
                x: 0,
                y: 0,
                duration: 0.12,
                ease: "power1.out",
              },
            ],
          },
          0.14,
        )
        .to(
          closeButton,
          {
            keyframes: [
              {
                opacity: 1,
                x: -4,
                y: 2,
                rotate: 8,
                scale: 1.06,
                duration: 0.22,
                ease: "power2.out",
              },
              {
                x: 1,
                y: -1,
                rotate: -2,
                scale: 0.98,
                duration: 0.14,
                ease: "sine.inOut",
              },
              {
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                duration: 0.12,
                ease: "power1.out",
              },
            ],
          },
          0.18,
        );

      return () => {
        tl.kill();
        idleTweenRef.current?.kill();
        idleTweenRef.current = null;
        gsap.killTweensOf([shell, panel, accent, content, closeButton]);
      };
    }

    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

    gsap.set([shell, panel, accent, content, closeButton], {
      willChange: "transform, opacity, filter",
    });

    tl.to(
      shell,
      {
        x: -8,
        y: 6,
        rotate: -0.8,
        duration: 0.08,
        ease: "power1.out",
      },
      0,
    )
      .to(
      panel,
      {
        keyframes: [
          {
            x: -8,
            y: 5,
            scaleX: 0.988,
            scaleY: 1.02,
            rotate: -0.8,
            skewY: 0.6,
            duration: 0.09,
            ease: "power1.out",
          },
          {
            x: 18,
            y: -18,
            scaleX: 0.9,
            scaleY: 0.84,
            rotate: 5.5,
            rotateX: 10,
            skewY: 2,
            filter: "blur(6px) brightness(1.03)",
            duration: EXIT_MS / 1000 - 0.09,
            ease: "power3.in",
          },
        ],
      },
      0,
    )
      .to(
        shell,
        {
          x: 54,
          y: -42,
          rotate: 7,
          autoAlpha: 0,
          duration: EXIT_MS / 1000,
          ease: "power3.in",
        },
        0,
      )
      .to(
        accent,
        {
          scaleY: 0.35,
          yPercent: -24,
          duration: 0.22,
          ease: "power2.in",
        },
        0,
      )
      .to(
        content,
        {
          opacity: 0,
          x: 22,
          y: -8,
          filter: "blur(8px)",
          duration: 0.18,
          ease: "power2.in",
        },
        0,
      )
      .to(
        closeButton,
        {
          opacity: 0,
          x: 18,
          y: -10,
          rotate: 14,
          scale: 0.86,
          duration: 0.16,
          ease: "power2.in",
        },
        0.02,
      );

    return () => {
      tl.kill();
      idleTweenRef.current?.kill();
      idleTweenRef.current = null;
      gsap.killTweensOf([shell, panel, accent, content, closeButton]);
    };
  }, [displayedSnackbar, isClosing, isVisible]);

  if (!displayedSnackbar || !portalTarget) return null;

  const currentSeverity = displayedSnackbar.severity ?? "info";

  const severityStyles = {
    success: {
      accent: "bg-emerald-500/80 dark:bg-emerald-400/75",
      panel:
        "shadow-[0_24px_56px_rgba(15,23,42,0.16),0_10px_24px_rgba(16,185,129,0.10)] dark:shadow-[0_28px_64px_rgba(0,0,0,0.42),0_10px_24px_rgba(16,185,129,0.14)]",
    },
    error: {
      accent: "bg-rose-500/80 dark:bg-rose-400/75",
      panel:
        "shadow-[0_24px_56px_rgba(15,23,42,0.16),0_10px_24px_rgba(244,63,94,0.10)] dark:shadow-[0_28px_64px_rgba(0,0,0,0.42),0_10px_24px_rgba(244,63,94,0.14)]",
    },
    warning: {
      accent: "bg-amber-500/80 dark:bg-amber-400/75",
      panel:
        "shadow-[0_24px_56px_rgba(15,23,42,0.16),0_10px_24px_rgba(245,158,11,0.10)] dark:shadow-[0_28px_64px_rgba(0,0,0,0.42),0_10px_24px_rgba(245,158,11,0.14)]",
    },
    info: {
      accent: "bg-sky-500/80 dark:bg-sky-400/75",
      panel:
        "shadow-[0_24px_56px_rgba(15,23,42,0.16),0_10px_24px_rgba(14,165,233,0.10)] dark:shadow-[0_28px_64px_rgba(0,0,0,0.42),0_10px_24px_rgba(14,165,233,0.14)]",
    },
  };

  const currentStyle = severityStyles[currentSeverity];
  const liveRole = currentSeverity === "error" ? "alert" : "status";

  return createPortal(
    <div
      ref={shellRef}
      className={classNames(
        "pointer-events-none fixed top-4 right-4 z-2147483647 w-[min(92vw,24rem)] origin-top-right sm:top-5 sm:right-5",
      )}
      role={liveRole}
      aria-live={currentSeverity === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div
        ref={panelRef}
        className={classNames(
          "pointer-events-auto relative overflow-hidden rounded-2xl border border-black/5 bg-white/78 backdrop-blur-xl dark:border-white/10 dark:bg-[#111827]/80",
          currentStyle.panel,
        )}
      >
        <div
          ref={accentRef}
          className={classNames(
            "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
            currentStyle.accent,
          )}
        />
        <div className="flex items-start gap-3 py-3.5 pr-3 pl-5">
          <div ref={contentRef} className="min-w-0 flex-1 pt-0.5">
            <p className="wrap-break-word text-sm leading-6 text-[#1F2937] dark:text-slate-100">
              {displayedSnackbar.message}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            onClick={closeSnackbar}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
};
