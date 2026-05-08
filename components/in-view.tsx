"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ObserverOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
};

/**
 * Callback ref + visibility flag. Fires when the element intersects (preload with rootMargin).
 */
export function useInView<T extends Element = HTMLElement>(
  options: ObserverOptions = {},
): [(node: T | null) => void, boolean] {
  const { rootMargin = "180px", threshold = 0, once = true } = options;
  const [element, setElement] = useState<T | null>(null);
  const [inView, setInView] = useState(false);

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;
    if (once && inView) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        if (once) obs.disconnect();
      },
      { rootMargin, threshold },
    );

    obs.observe(element);
    return () => obs.disconnect();
  }, [element, rootMargin, threshold, once, inView]);

  return [ref, inView];
}

type InViewProps = {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  rootMargin?: string;
  once?: boolean;
};

/** Mounts children only after intersection — defers image downloads until near viewport. */
export function InViewMount({
  children,
  fallback = null,
  className,
  rootMargin = "200px",
  once = true,
}: InViewProps) {
  const [ref, visible] = useInView<HTMLDivElement>({
    rootMargin,
    once,
  });

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
