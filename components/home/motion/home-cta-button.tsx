"use client";

import { useCallback, type MouseEvent, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type HomeCtaButtonProps = ButtonProps & {
  children: ReactNode;
};

/**
 * Landing CTA: soft scale + shadow on hover; CSS ripple on click.
 * Ripple/scale disabled under prefers-reduced-motion.
 */
export function HomeCtaButton({
  className,
  children,
  onClick,
  ...props
}: HomeCtaButtonProps) {
  const reduced = usePrefersReducedMotion();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => {
      if (!reduced) {
        const host = e.currentTarget;
        const rect = host.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const ripple = document.createElement("span");
        ripple.className =
          "home-cta-ripple home-cta-ripple-active pointer-events-none absolute z-0 rounded-full bg-white/35";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        host.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 600);
      }
      onClick?.(e as never);
    },
    [onClick, reduced],
  );

  return (
    <Button
      {...props}
      onClick={handleClick}
      className={cn(
        "home-cta-button relative overflow-hidden",
        !reduced &&
          "transition-[transform,box-shadow] duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_10px_28px_rgba(150,0,24,0.28)] active:scale-[0.98]",
        className,
      )}
    >
      <span className="relative z-1">{children}</span>
    </Button>
  );
}
