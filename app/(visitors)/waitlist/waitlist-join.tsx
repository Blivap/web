"use client";

import { $api } from "@/app/api";
import { liveStoreUrl, type WaitlistStore } from "@/app/api/publicRepository";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { usePublicApp } from "@/hooks/public/usePublicSite.hooks";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "blivap-app-waitlist-v2";

const stores = [
  { id: "ios", label: "App Store" },
  { id: "android", label: "Google Play" },
  { id: "both", label: "Both" },
] as const;

type StoreId = WaitlistStore;

type SavedJoin = {
  email: string;
  store: StoreId;
  alreadyJoined: boolean;
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
    const store = parsed.store ?? null;
    if (
      typeof parsed.email !== "string" ||
      !parsed.email.includes("@") ||
      !isStoreId(store)
    ) {
      return null;
    }
    return {
      email: parsed.email,
      store,
      alreadyJoined: parsed.alreadyJoined === true,
    };
  } catch {
    return null;
  }
}

const savedListeners = new Set<() => void>();
let savedSnapshot: SavedJoin | null = null;
let savedSnapshotReady = false;

function emitSaved() {
  for (const listener of savedListeners) listener();
}

function subscribeSaved(listener: () => void) {
  savedListeners.add(listener);
  return () => {
    savedListeners.delete(listener);
  };
}

function getSavedSnapshot(): SavedJoin | null {
  if (!savedSnapshotReady) {
    savedSnapshot = readSavedJoin();
    savedSnapshotReady = true;
  }
  return savedSnapshot;
}

function getServerSavedSnapshot(): SavedJoin | null {
  return null;
}

function persistSaved(join: SavedJoin | null): boolean {
  try {
    if (join) localStorage.setItem(STORAGE_KEY, JSON.stringify(join));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    return false;
  }
  savedSnapshot = join;
  savedSnapshotReady = true;
  emitSaved();
  return true;
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
  const storeFromQuery = isStoreId(requestedStore) ? requestedStore : "both";
  const [storeChoice, setStoreChoice] = useState<{
    query: string | null;
    store: StoreId;
  } | null>(null);
  const store =
    storeChoice?.query === requestedStore ? storeChoice.store : storeFromQuery;

  const { stores: appStores, status: appStatus } = usePublicApp();
  const iosUrl = liveStoreUrl(appStores?.ios);
  const androidUrl = liveStoreUrl(appStores?.android);
  const waitlistStores = stores.filter((option) => {
    if (option.id === "ios") return !iosUrl;
    if (option.id === "android") return !androidUrl;
    return !iosUrl && !androidUrl;
  });
  const storeIsOpen = waitlistStores.some((option) => option.id === store);
  const activeStore = storeIsOpen ? store : (waitlistStores[0]?.id ?? store);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const saved = useSyncExternalStore(
    subscribeSaved,
    getSavedSnapshot,
    getServerSavedSnapshot,
  );

  const headingStore = readyLine(activeStore);
  const storesLive = Boolean(iosUrl || androidUrl);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const company = String(form.get("company") ?? "");
    const nextEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setPending(true);
    setError(null);
    const response = await $api.public.joinWaitlist({
      email: nextEmail,
      store: activeStore,
      source: "waitlist",
      company,
    });
    setPending(false);
    if (!response.data) {
      setError(response.error ?? "Could not join the waitlist.");
      return;
    }
    const join = {
      email: nextEmail,
      store: activeStore,
      alreadyJoined: response.data.alreadyJoined,
    };
    if (!persistSaved(join)) {
      setError("You're on the list, but this device could not remember it.");
    }
  };

  const onLeave = async () => {
    if (!saved) return;
    setPending(true);
    setError(null);
    const response = await $api.public.leaveWaitlist({ email: saved.email });
    setPending(false);
    if (!response.data) {
      setError(response.error ?? "Could not update the waitlist.");
      return;
    }
    persistSaved(null);
    setEmail("");
  };

  return (
    <div className="flex flex-1 flex-col py-6 sm:py-8">
      <section className="grid grid-cols-1 items-center gap-10 overflow-hidden border border-[#E5E7EB] bg-[#FDF2F4] dark:border-primary/20 dark:bg-[#2A1117] lg:grid-cols-2 lg:gap-12">
        <div className="px-5 py-8 sm:px-8 sm:py-10 lg:pl-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {appStatus === "loading"
              ? "The app"
              : storesLive
                ? "Get the app"
                : "Coming soon"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Carry Blivap in your pocket
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            {saved
              ? "The mobile app will bring live matches, alerts, and secure messaging to your phone."
              : storesLive
                ? "Download a live store listing, or leave your email for a store that is still opening."
                : `Leave your email and the store you use. We'll tell you when ${headingStore}.`}
          </p>

          {iosUrl || androidUrl ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {iosUrl ? (
                <Button
                  href={iosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit rounded-full px-6"
                >
                  Download on the App Store
                </Button>
              ) : null}
              {androidUrl ? (
                <Button
                  href={androidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  className="w-fit rounded-full px-6"
                >
                  Get it on Google Play
                </Button>
              ) : null}
            </div>
          ) : null}

          {appStatus === "loading" ? (
            <div className="mt-6 h-40 max-w-md animate-pulse rounded-2xl bg-white/70 dark:bg-white/5" />
          ) : saved ? (
            <div className="mt-6 max-w-md rounded-2xl border border-primary/20 bg-white p-5 dark:border-white/10 dark:bg-[#14141a]">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Check className="size-4 text-primary" aria-hidden />
                {saved.alreadyJoined
                  ? "You're already on the list"
                  : "You're on the list"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                We&apos;ll email{" "}
                <span className="font-medium text-text-primary">
                  {saved.email}
                </span>{" "}
                when {readyLine(saved.store)}.
              </p>
              {error ? (
                <p
                  className="mt-3 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                className="mt-4 text-sm font-medium text-primary underline-offset-2 hover:underline disabled:opacity-60"
                disabled={pending}
                onClick={() => {
                  void onLeave();
                }}
              >
                Use a different email
              </button>
            </div>
          ) : waitlistStores.length > 0 ? (
            <form
              className="relative mt-6 flex max-w-md flex-col gap-4"
              onSubmit={(event) => {
                void onSubmit(event);
              }}
            >
              <HoneypotField />
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
                  {waitlistStores.map((option) => {
                    const selected = activeStore === option.id;
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
                          onChange={() =>
                            setStoreChoice({
                              query: requestedStore,
                              store: option.id,
                            })
                          }
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {error ? (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                loading={pending}
                className="w-fit rounded-full px-6"
              >
                Join the waitlist
              </Button>
            </form>
          ) : null}

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
