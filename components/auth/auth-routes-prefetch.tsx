"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Warms `/login` and `/register` route bundles so navigation + GSAP run sooner.
 * (Plain `<a href>` links do not get Next.js prefetch the way `<Link>` does.)
 */
export function AuthRoutesPrefetch() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/login");
    router.prefetch("/register");
  }, [router]);

  return null;
}
