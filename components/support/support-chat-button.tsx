"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { Send, UserRound } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import {
  SUPPORT_EMAIL,
  SUPPORT_UNDER_CONSTRUCTION_MESSAGE,
} from "@/lib/support/supportChat";
import { cn } from "@/lib/utils";

type ChatLine = {
  id: string;
  from: "support" | "user";
  text: string;
};

type Side = "left" | "right";

type Place = {
  x: number;
  y: number;
  side: Side;
};

const BUTTON = 64;
const DRAG_SLOP = 8;
const ROD = 32;

const openingMessage: ChatLine = {
  id: "support-opening",
  from: "support",
  text: SUPPORT_UNDER_CONSTRUCTION_MESSAGE,
};

let remembered: Place | null = null;

function viewport() {
  const margin = window.innerWidth >= 768 ? 24 : 16;
  return {
    margin,
    maxX: Math.max(margin, window.innerWidth - BUTTON - margin),
    maxY: Math.max(margin, window.innerHeight - BUTTON - margin),
  };
}

function setScrollOpacity(sheet: HTMLElement | null, opacity: string) {
  const root = sheet?.parentElement?.parentElement;
  if (root) root.style.opacity = opacity;
}

function resting(side: Side, y: number): Place {
  const box = viewport();
  return {
    x: side === "left" ? box.margin : box.maxX,
    y: Math.min(Math.max(box.margin, y), box.maxY),
    side,
  };
}

function SupportHead({ live = true }: { live?: boolean }) {
  const [blinking, setBlinking] = useState(false);
  const [smiling, setSmiling] = useState(false);

  useEffect(() => {
    if (!live) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let alive = true;
    const timers: number[] = [];
    const later = (run: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (alive) run();
      }, ms);
      timers.push(id);
    };

    const scheduleBlink = () => {
      later(blink, 1600 + Math.random() * 6200);
    };

    const blink = () => {
      if (document.hidden) {
        scheduleBlink();
        return;
      }
      setBlinking(true);
      const again = Math.random() < 0.22;
      later(
        () => {
          setBlinking(false);
          if (!again) {
            scheduleBlink();
            return;
          }
          later(
            () => {
              setBlinking(true);
              later(
                () => {
                  setBlinking(false);
                  scheduleBlink();
                },
                60 + Math.random() * 40,
              );
            },
            80 + Math.random() * 90,
          );
        },
        70 + Math.random() * 50,
      );
    };

    const scheduleSmile = () => {
      later(smile, 2400 + Math.random() * 9800);
    };

    const smile = () => {
      if (document.hidden) {
        scheduleSmile();
        return;
      }
      setSmiling(true);
      later(
        () => {
          setSmiling(false);
          scheduleSmile();
        },
        480 + Math.random() * 820,
      );
    };

    scheduleBlink();
    scheduleSmile();

    return () => {
      alive = false;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [live]);

  const eyeScale = blinking ? 0.08 : smiling ? 0.78 : 1;

  return (
    <svg
      viewBox="0 0 80 80"
      className={
        live
          ? "size-full overflow-visible drop-shadow-[0_8px_12px_rgba(58,36,28,0.28)]"
          : "size-full overflow-visible"
      }
      aria-hidden
    >
      <defs>
        <radialGradient id="bliiva-face" cx="40%" cy="34%" r="70%">
          <stop offset="0" stopColor="#FFE7D8" />
          <stop offset="1" stopColor="#E4B08F" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="36" rx="22" ry="24" fill="#3A241C" />
      <ellipse cx="40" cy="48" rx="16" ry="18" fill="url(#bliiva-face)" />
      <path
        d="M26 40c3-9 8-13 14-13s11 4 14 13c-4 3-9 4-14 4s-10-1-14-4z"
        fill="#3A241C"
      />
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: `scaleY(${eyeScale})`,
          transition: blinking
            ? "transform 70ms ease-in"
            : "transform 120ms ease-out",
        }}
      >
        <path
          d="M31 46.5c1.8-2.2 4.2-2.2 5.8 0"
          fill="none"
          stroke="#3A241C"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="34.2" cy="50" r="2.1" fill="#2C241F" />
      </g>
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: `scaleY(${eyeScale})`,
          transition: blinking
            ? "transform 70ms ease-in"
            : "transform 120ms ease-out",
        }}
      >
        <path
          d="M43.2 46.5c1.8-2.2 4.2-2.2 5.8 0"
          fill="none"
          stroke="#3A241C"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="46" cy="50" r="2.1" fill="#2C241F" />
      </g>
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: smiling ? "scale(1.2, 1.65)" : undefined,
          transition: "transform 200ms ease-out",
        }}
      >
        <path
          d="M35 58c1.8 2.2 8 2.2 10 0"
          fill="none"
          stroke="#9A4A3A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M12 36C14 10 26 2 40 2s26 8 28 34"
        fill="none"
        stroke="#1C1A22"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M24 12c4-4 28-4 32 0"
        fill="none"
        stroke="#960018"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <rect x="4" y="30" width="14" height="22" rx="5" fill="#1C1A22" />
      <rect x="62" y="30" width="14" height="22" rx="5" fill="#1C1A22" />
      <rect x="6.2" y="32.4" width="9.6" height="17.2" rx="4" fill="#3A3544" />
      <rect x="64.2" y="32.4" width="9.6" height="17.2" rx="4" fill="#3A3544" />
      <rect x="8" y="35.5" width="6" height="11" rx="3" fill="#960018" />
      <rect x="66" y="35.5" width="6" height="11" rx="3" fill="#960018" />
      <path
        d="M66 50c-4 8-14 14-26 13"
        fill="none"
        stroke="#1C1A22"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="39" cy="63" r="2.7" fill="#1C1A22" />
      <circle cx="39" cy="63" r="1.3" fill="#960018" />
    </svg>
  );
}

function ScrollRod() {
  return (
    <div className="relative z-10 h-8">
      <div className="absolute inset-x-4 top-1/2 h-5 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#F8EFD8_0%,#D7BC8A_28%,#8C6A45_62%,#3E2A1C_100%)] shadow-[0_3px_0_#2A1C12,inset_0_1px_0_rgba(255,255,255,0.75)]">
        <span className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-[#24AFB5]/80 shadow-[0_0_6px_#24AFB5]" />
      </div>
      <span className="absolute top-1/2 left-1 size-8 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#F8EFD8,#A68455_46%,#5C4030_78%)] shadow-[inset_0_0_0_2px_#960018,0_0_0_1px_rgba(36,175,181,0.85)]" />
      <span className="absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#F8EFD8,#A68455_46%,#5C4030_78%)] shadow-[inset_0_0_0_2px_#960018,0_0_0_1px_rgba(36,175,181,0.85)]" />
    </div>
  );
}

function UserChatAvatar({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className="relative mt-0.5 inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E7D3A1] text-[#6B4E32] ring-1 ring-[#960018]/30"
      aria-hidden
    >
      {showImage ? (
        // User photos can fail; fall back to the icon without the image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <UserRound className="size-4" />
      )}
    </span>
  );
}

export function SupportChatButton() {
  const { user } = useDashboard();
  const nodeRef = useRef<HTMLButtonElement>(null);
  const placeRef = useRef<Place>({ x: 0, y: 0, side: "right" });
  const boundsRef = useRef({ margin: 16, maxX: 0, maxY: 0 });
  const setXRef = useRef<((value: number) => void) | null>(null);
  const setYRef = useRef<((value: number) => void) | null>(null);
  const frameRef = useRef(0);
  const blockClickRef = useRef(false);
  const openRef = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const rollRootRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const rollRef = useRef({ value: 0 });
  const rollStartedRef = useRef(false);
  const rollTriesRef = useRef(0);
  const rollFrameRef = useRef(0);
  const rollClosedRef = useRef<() => void>(() => {});
  const startRollRef = useRef<() => void>(() => {});
  const dragRef = useRef({
    id: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });
  const [placed, setPlaced] = useState(false);
  const [side, setSide] = useState<Side>("right");
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([openingMessage]);
  const [draft, setDraft] = useState("");

  useLayoutEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    setXRef.current = gsap.quickSetter(el, "x", "px") as (
      value: number,
    ) => void;
    setYRef.current = gsap.quickSetter(el, "y", "px") as (
      value: number,
    ) => void;

    const initial = remembered
      ? resting(remembered.side, remembered.y)
      : resting("right", viewport().maxY);
    placeRef.current = initial;
    remembered = initial;
    gsap.set(el, { x: initial.x, y: initial.y, force3D: true });
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setSide(initial.side);
      setPlaced(true);
    });

    const onResize = () => {
      const next = resting(placeRef.current.side, placeRef.current.y);
      placeRef.current = next;
      remembered = next;
      gsap.killTweensOf(el);
      gsap.set(el, { x: next.x, y: next.y, overwrite: true });
      setSide((current) => (current === next.side ? current : next.side));
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      remembered = placeRef.current;
      gsap.killTweensOf(el);
    };
  }, []);

  const paint = () => {
    frameRef.current = 0;
    setXRef.current?.(placeRef.current.x);
    setYRef.current?.(placeRef.current.y);
  };

  const releaseToEdge = (pointerId: number) => {
    const drag = dragRef.current;
    if (drag.id !== pointerId) return;
    drag.id = -1;
    const el = nodeRef.current;
    if (el?.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
    if (!drag.moved || !el) {
      if (el) el.style.willChange = "auto";
      return;
    }
    blockClickRef.current = true;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    const center = placeRef.current.x + BUTTON / 2;
    const nextSide: Side = center < window.innerWidth / 2 ? "left" : "right";
    const next = resting(nextSide, placeRef.current.y);
    const distance = Math.abs(next.x - placeRef.current.x);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.set(el, { x: placeRef.current.x, y: placeRef.current.y });
    placeRef.current = next;
    remembered = next;
    setSide((current) => (current === next.side ? current : next.side));
    if (distance < 0.5) {
      gsap.set(el, { x: next.x, y: next.y });
      el.style.willChange = "auto";
      return;
    }
    gsap.to(el, {
      x: next.x,
      y: next.y,
      duration: reduced ? 0 : Math.min(0.42, 0.18 + distance / 3200),
      ease: "power3.out",
      force3D: true,
      overwrite: true,
      onComplete: () => {
        el.style.willChange = "auto";
      },
    });
  };

  const paintRoll = (value: number) => {
    const px = `${value}px`;
    const sheet = sheetRef.current;
    const root = sheet?.parentElement?.parentElement ?? rollRootRef.current;
    if (root) root.style.setProperty("--roll", px);
    if (sheet) {
      sheet.style.transform = `translateY(${px})`;
      const clip = sheet.parentElement;
      if (clip)
        clip.style.clipPath = `inset(calc(${px} + ${ROD / 2}px) 0px ${ROD / 2}px 0px)`;
    }
    const rod = root?.querySelector("[data-roll-rod]");
    if (rod instanceof HTMLElement) rod.style.top = px;
  };

  const setSheetNode = useCallback((node: HTMLDivElement | null) => {
    sheetRef.current = node;
    if (node) startRollRef.current();
  }, []);

  const finishClose = () => {
    closingRef.current = false;
    rollStartedRef.current = false;
    rollTriesRef.current = 0;
    openRef.current = false;
    setOpen(false);
  };

  const rollClosed = () => {
    if (!openRef.current || closingRef.current) return;
    if (rollFrameRef.current) {
      cancelAnimationFrame(rollFrameRef.current);
      rollFrameRef.current = 0;
    }
    const sheet = sheetRef.current;
    if (!sheet || !rollStartedRef.current) {
      finishClose();
      return;
    }
    const hidden = Math.max(sheet.offsetHeight - ROD, 0);
    const state = rollRef.current;
    const from = state.value;
    gsap.killTweensOf(state);
    closingRef.current = true;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const distance = Math.abs(hidden - from) / Math.max(hidden, 1);
    gsap.to(state, {
      value: hidden,
      duration: reduced ? 0 : Math.max(0.32, 0.7 * distance),
      ease: "power3.inOut",
      onUpdate: () => {
        paintRoll(state.value);
        const span = Math.max(hidden - from, 1);
        const t = Math.min(1, Math.max(0, (state.value - from) / span));
        setScrollOpacity(sheet, String(1 - t * t));
      },
      onComplete: finishClose,
    });
  };

  const startRoll = () => {
    if (rollStartedRef.current || closingRef.current || !openRef.current)
      return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const hidden = Math.max(sheet.offsetHeight - ROD, 0);
    if (hidden < 8) {
      rollTriesRef.current += 1;
      if (rollTriesRef.current > 12) {
        rollStartedRef.current = true;
        rollRef.current.value = 0;
        paintRoll(0);
        return;
      }
      if (rollFrameRef.current) cancelAnimationFrame(rollFrameRef.current);
      rollFrameRef.current = requestAnimationFrame(() => {
        rollFrameRef.current = 0;
        startRollRef.current();
      });
      return;
    }
    rollTriesRef.current = 0;
    rollStartedRef.current = true;
    setScrollOpacity(sheet, "1");
    const state = rollRef.current;
    gsap.killTweensOf(state);
    state.value = hidden;
    paintRoll(hidden);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.to(state, {
      value: 0,
      duration: reduced ? 0 : 0.85,
      ease: "power3.inOut",
      onUpdate: () => paintRoll(state.value),
    });
  };

  useLayoutEffect(() => {
    rollClosedRef.current = rollClosed;
    startRollRef.current = startRoll;
  });

  useLayoutEffect(() => {
    if (!open) {
      rollStartedRef.current = false;
      return;
    }
    startRollRef.current();
  }, [open]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setLines((current) => [
      ...current,
      { id: `user-${current.length}`, from: "user", text },
      {
        id: `support-${current.length}`,
        from: "support",
        text: SUPPORT_UNDER_CONSTRUCTION_MESSAGE,
      },
    ]);
    setDraft("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (blockClickRef.current) {
          blockClickRef.current = false;
          return;
        }
        if (!next) {
          rollClosedRef.current();
          return;
        }
        openRef.current = true;
        setOpen(true);
      }}
    >
      <PopoverTrigger asChild>
        <button
          ref={nodeRef}
          type="button"
          aria-label="Open Bliiva"
          className={`fixed top-0 left-0 z-[120] size-16 touch-none overflow-visible bg-transparent select-none ${placed ? "cursor-grab active:cursor-grabbing" : "opacity-0"}`}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            const el = nodeRef.current;
            if (!el) return;
            blockClickRef.current = false;
            boundsRef.current = viewport();
            const drag = dragRef.current;
            drag.id = event.pointerId;
            drag.startX = event.clientX;
            drag.startY = event.clientY;
            drag.originX = placeRef.current.x;
            drag.originY = placeRef.current.y;
            drag.moved = false;
            el.setPointerCapture(event.pointerId);
            gsap.killTweensOf(el);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (drag.id !== event.pointerId) return;
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            if (!drag.moved && dx * dx + dy * dy < DRAG_SLOP * DRAG_SLOP)
              return;
            if (!drag.moved) {
              drag.moved = true;
              if (openRef.current) rollClosedRef.current();
              const el = nodeRef.current;
              if (el) el.style.willChange = "transform";
            }
            const box = boundsRef.current;
            placeRef.current.x = Math.min(
              Math.max(box.margin, drag.originX + dx),
              box.maxX,
            );
            placeRef.current.y = Math.min(
              Math.max(box.margin, drag.originY + dy),
              box.maxY,
            );
            if (!frameRef.current)
              frameRef.current = requestAnimationFrame(paint);
          }}
          onPointerUp={(event) => releaseToEdge(event.pointerId)}
          onPointerCancel={(event) => {
            if (dragRef.current.id !== event.pointerId) return;
            dragRef.current.moved = true;
            releaseToEdge(event.pointerId);
          }}
          onClick={(event) => {
            if (!blockClickRef.current) return;
            blockClickRef.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <SupportHead />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align={side === "left" ? "start" : "end"}
        sideOffset={12}
        className="z-[120] w-[min(22rem,calc(100vw-2rem))] !animate-none !overflow-visible !rounded-none !border-0 !bg-transparent !p-0 !shadow-none dark:!border-0 dark:!bg-transparent dark:!shadow-none"
        style={{ backgroundColor: "transparent", animation: "none" }}
      >
        <div
          ref={rollRootRef}
          className="relative drop-shadow-[0_16px_22px_rgba(62,42,28,0.38)]"
        >
          <div
            className="overflow-hidden"
            style={{
              clipPath:
                "inset(calc(var(--roll, calc(100% - 32px)) + 16px) 0 16px 0)",
            }}
          >
            <div
              ref={setSheetNode}
              className="relative z-[1] mx-8 overflow-hidden bg-[linear-gradient(180deg,#F4E4C4_0%,#E4C98A_18%,#F6EBD4_42%,#E7D3A1_100%)] pt-7 shadow-[inset_8px_0_10px_rgba(62,42,28,0.08),inset_-8px_0_10px_rgba(62,42,28,0.08)]"
              style={{
                transform: "translateY(var(--roll, calc(100% - 32px)))",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#8C6A45]/50 to-transparent"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#8C6A45]/45 to-transparent"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_7px,rgba(92,64,32,0.05)_8px)]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-[#24AFB5]/70 to-transparent"
              />
              <div className="relative flex items-center gap-2 px-4 pt-5 pb-2">
                <span className="inline-flex size-8 shrink-0" aria-hidden>
                  <SupportHead live={false} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#3C2A1A]">Bliiva</p>
                  <p className="text-xs text-[#7A6248]">
                    We reply by email for now
                  </p>
                </div>
              </div>
              <div className="custom-scrollbar relative flex max-h-72 flex-col gap-3 overflow-y-auto px-4 py-3">
                {lines.map((line) => {
                  const mine = line.from === "user";
                  return (
                    <div
                      key={line.id}
                      className={cn(
                        "flex",
                        mine ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "flex max-w-[min(100%,26rem)] items-start gap-2",
                          mine && "flex-row-reverse",
                        )}
                      >
                        {mine ? (
                          <UserChatAvatar src={user?.profileImage} />
                        ) : (
                          <span
                            className="mt-0.5 inline-flex size-8 shrink-0"
                            aria-hidden
                          >
                            <SupportHead live={false} />
                          </span>
                        )}
                        <p
                          className={cn(
                            "min-w-0 rounded-xl px-3 py-2 text-xs leading-relaxed wrap-break-word",
                            mine
                              ? "bg-primary text-white shadow-[0_0_0_1px_rgba(36,175,181,0.45)]"
                              : "bg-transparent px-0 text-[#3C2A1A]",
                          )}
                        >
                          {line.text}{" "}
                          {line.from === "support" ? (
                            <a
                              href={`mailto:${SUPPORT_EMAIL}`}
                              className="font-semibold text-primary underline"
                            >
                              {SUPPORT_EMAIL}
                            </a>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={send}
                className="relative flex items-center gap-2 px-3 pt-1 pb-8"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message"
                  aria-label="Message Bliiva"
                  className="h-9 min-w-0 flex-1 border-0 border-b border-[#8C6A45]/50 bg-transparent px-1 text-xs text-[#3C2A1A] outline-none placeholder:text-[#8A7355] focus:border-[#960018]"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[0_0_0_1px_rgba(36,175,181,0.65)]"
                >
                  <Send className="size-3.5" aria-hidden />
                </button>
              </form>
            </div>
          </div>
          <div
            data-roll-rod
            className="pointer-events-none absolute inset-x-0 z-20"
            style={{ top: "var(--roll, calc(100% - 32px))" }}
          >
            <ScrollRod />
            <span
              aria-hidden
              className="absolute inset-x-8 top-full h-3 bg-gradient-to-b from-[#3E2A1C]/40 to-transparent"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
            <ScrollRod />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
