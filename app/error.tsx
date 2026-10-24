"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { isNetworkFailure } from "@/lib/api/networkFailure";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  const network = isNetworkFailure(error);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !network) {
      console.error(error);
    }
  }, [error, network]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E6E3] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a1a22]">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF5F5] text-primary dark:bg-primary/15">
          <WifiOff className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-text-primary">
          {network ? "Can't reach Blivap" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {network
            ? "We couldn’t reach the server. Check your connection or try again in a moment."
            : "An unexpected error stopped this page. You can try again without leaving the app."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="rounded-md px-4 text-xs font-semibold"
            onClick={reset}
          >
            Try again
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-md px-4 text-xs font-semibold"
            onClick={() => {
              window.location.assign("/");
            }}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
