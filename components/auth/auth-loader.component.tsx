"use client";

import { BlivapLogo } from "@/public/svg";
import Image from "next/image";

export function AuthLoader() {
  return (
    <div
      className="fixed inset-0 z-100 flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-[#0B0D12]"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <BlivapLogo fill="#960018" className="size-17" />
      <p className="text-sm font-medium text-[#49475A] dark:text-slate-300">
        Checking authentication
      </p>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span
          className="h-2 w-2 rounded-full bg-primary"
          style={{
            animation: "authLoaderDot 0.4s ease-in-out infinite alternate",
            animationDelay: "0ms",
          }}
        />
        <span
          className="h-2 w-2 rounded-full bg-primary"
          style={{
            animation: "authLoaderDot 0.4s ease-in-out infinite alternate",
            animationDelay: "150ms",
          }}
        />
        <span
          className="h-2 w-2 rounded-full bg-primary"
          style={{
            animation: "authLoaderDot 0.4s ease-in-out infinite alternate",
            animationDelay: "300ms",
          }}
        />
      </div>
    </div>
  );
}
