"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const STORAGE_KEY = "blivap-app-waitlist";

const stores = [
  { id: "ios", label: "App Store" },
  { id: "android", label: "Google Play" },
  { id: "both", label: "Both" },
] as const;

type StoreId = (typeof stores)[number]["id"];

type SavedJoin = {
  email: string;
  store: StoreId;
};

function isStoreId(value: string | null): value is StoreId {
  return value === "ios" || value === "android" || value === "both";
}

function readyLine(store: StoreId): string {
  if (store === "ios") return "the App Store listing is live";
  if (store === "android") return "the Google Play listing is live";
  return "the App Store and Google Play listings are live";
}

function readSavedJoin(): SavedJoin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedJoin>;
    if (
      typeof parsed.email !== "string" ||
      !parsed.email.includes("@") ||
      !isStoreId(parsed.store ?? null)
    ) {
      return null;
    }
    return { email: parsed.email, store: parsed.store };
  } catch {
    return null;
  }
}

function PhonePreview() {
  return (
    <div
      className="relative w-52.5 rounded-[2rem] border-[6px] border-[#171717] bg-[#111827] p-2 shadow-[0_24px_50px_rgba(15,23,42,0.25)] dark:border-white/20"
      aria-hidden
    >
      <div className="absolute left-1/2 top-1.5 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#374151]" />
      <div className="flex aspect-9/16 flex-col gap-3 overflow-hidden rounded-[1.4rem] bg-linear-to-b from-[#FDF2F4] to-white p-4 dark:from-[#2A1117] dark:to-[#111827]">
        <div className="h-3 w-20 rounded-full bg-primary/30" />
        <div className="mt-2 h-8 w-full rounded-lg bg-primary/15" />
        <div className="h-24 w-full rounded-xl bg-white shadow-sm dark:bg-white/5" />
        <div className="h-16 w-full rounded-xl bg-white shadow-sm dark:bg-white/5" />
        <div className="mt-auto h-10 w-full rounded-full bg-primary" />
      </div>
    </div>
  );
}

export function WaitlistJoin() {
  const searchParams = useSearchParams();
  const requestedStore = searchParams.get("store");
  const initialStore = isStoreId(requestedStore) ? requestedStore : "both";

  const [email, setEmail] = useState("");
  const [store, setStore] = useState<StoreId>(initialStore);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedJoin | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(readSavedJoin());
    setReady(true);
  }, []);

  useEffect(() => {
    if (isStoreId(requestedStore)) setStore(requestedStore);
  }, [requestedStore]);

  const headingStore = readyLine(store);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    const join = { email: nextEmail, store };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(join));
    } catch {
      setError("Could not save your place on this device. Try again.");
      return;
    }
    setError(null);
    setSaved(join);
  };

  return (
    <div className="flex flex-1 flex-col py-6 sm:py-8">
      <section className="grid grid-cols-1 items-center gap-10 overflow-hidden border border-[#E5E7EB] bg-[#FDF2F4] dark:border-primary/20 dark:bg-[#2A1117] lg:grid-cols-2 lg:gap-12">
        <div className="px-5 py-8 sm:px-8 sm:py-10 lg:pl-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Coming soon
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Carry Blivap in your pocket
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            {saved
              ? "The mobile app will bring live matches, alerts, and secure messaging to your phone."
              : `Leave your email and the store you use. We'll tell you when ${headingStore}.`}
          </p>

          {ready && saved ? (
            <div className="mt-6 max-w-md rounded-2xl border border-primary/20 bg-white p-5 dark:border-white/10 dark:bg-[#14141a]">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Check className="size-4 text-primary" aria-hidden />
                You&apos;re on the list
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                We&apos;ll email{" "}
                <span className="font-medium text-text-primary">
                  {saved.email}
                </span>{" "}
                when {readyLine(saved.store)}.
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => {
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch {
                    /* ignore */
                  }
                  setSaved(null);
                  setEmail("");
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form className="mt-6 flex max-w-md flex-col gap-4" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="waitlist-email"
                  className="text-sm font-medium text-text-primary"
                >
                  Email
                </label>
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  placeholder="you@email.com"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                  className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-primary/45 dark:border-white/15 dark:bg-[#111118]"
                />
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium text-text-primary">
                  Store
                </legend>
                <div className="flex flex-wrap gap-2">
                  {stores.map((option) => {
                    const selected = store === option.id;
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "cursor-pointer rounded-full border px-3 py-1.5 text-sm",
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-white text-text-primary dark:border-white/15 dark:bg-[#111118]",
                        )}
                      >
                        <input
                          type="radio"
                          name="store"
                          value={option.id}
                          checked={selected}
                          className="sr-only"
                          onChange={() => setStore(option.id)}
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-fit rounded-full px-6">
                Join the waitlist
              </Button>
            </form>
          )}

          <p className="mt-4 max-w-sm text-xs leading-relaxed text-text-tertiary">
            Prefer the web today?{" "}
            <Link
              href={routes.register}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Register free
            </Link>
            . We treat health data carefully — read our{" "}
            <Link
              href={routes.privacy}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>

        <div className="flex justify-center px-6 pb-10 pt-2 lg:pb-12">
          <PhonePreview />
        </div>
      </section>
    </div>
  );
}
