"use client";

import {
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
};

/**
 * Fade + slight upward slide + scale 0.96→1 on scroll into view (once).
 * Skips animation when prefers-reduced-motion is set.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { clearProps: "all" });
      return;
    }

    gsap.set(el, {
      opacity: 0,
      y: 20,
      scale: 0.96,
      willChange: "opacity, transform",
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          delay,
          ease: "power2.out",
          clearProps: "opacity,transform,will-change",
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(el);
    };
  }, [reduced, delay]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
