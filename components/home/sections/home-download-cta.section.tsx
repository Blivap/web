"use client";

import { $api } from "@/app/api";
import { liveStoreUrl, type WaitlistStore } from "@/app/api/publicRepository";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { routes } from "@/config/routes";
import { usePublicApp } from "@/hooks/public/usePublicSite.hooks";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ScrollReveal } from "../motion/scroll-reveal";
import { HomeCtaButton } from "../motion/home-cta-button";

const STORAGE_KEY = "blivap-app-waitlist-v2";

type StoreChoice = "ios" | "android";

type SavedJoin = {
  email: string;
  store: WaitlistStore;
  alreadyJoined: boolean;
};

const storeCopy: Record<StoreChoice, { button: string; listing: string }> = {
  ios: {
    button: "App Store",
    listing: "the App Store listing is live",
  },
  android: {
    button: "Google Play",
    listing: "the Google Play listing is live",
  },
};

function isWaitlistStore(value: string | null): value is WaitlistStore {
  return value === "ios" || value === "android" || value === "both";
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
      !isWaitlistStore(store)
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
let savedSnapshot: SavedJoin | null | undefined;

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
  if (savedSnapshot === undefined) savedSnapshot = readSavedJoin();
  return savedSnapshot;
}

function writeSavedJoin(join: SavedJoin | null) {
  try {
    if (join) localStorage.setItem(STORAGE_KEY, JSON.stringify(join));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The server already has the email. Remembering it here is optional.
  }
  savedSnapshot = join;
  emitSaved();
}

function coversStore(saved: SavedJoin, store: StoreChoice) {
  return saved.store === store || saved.store === "both";
}

function StoreNotifyForm({
  store,
  saved,
  onSaved,
  onCleared,
}: {
  store: StoreChoice;
  saved: SavedJoin | null;
  onSaved: (join: SavedJoin) => void;
  onCleared: () => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(saved?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const joined = saved !== null && coversStore(saved, store);

  useEffect(() => {
    if (joined) return;
    inputRef.current?.focus();
  }, [store, joined]);

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
      store,
      source: "home-download",
      company,
    });
    setPending(false);
    if (!response.data) {
      setError(response.error ?? "Could not save your email.");
      return;
    }
    const join: SavedJoin = {
      email: nextEmail,
      store,
      alreadyJoined: response.data.alreadyJoined,
    };
    writeSavedJoin(join);
    onSaved(join);
  };

  const onLeave = async () => {
    if (!saved) return;
    setPending(true);
    setError(null);
    const response = await $api.public.leaveWaitlist({ email: saved.email });
    setPending(false);
    if (!response.data) {
      setError(response.error ?? "Could not update your details.");
      return;
    }
    writeSavedJoin(null);
    setEmail("");
    onCleared();
  };

  if (joined && saved) {
    return (
      <div className="mt-4 max-w-md rounded-2xl border border-primary/20 bg-white p-4 dark:border-white/10 dark:bg-[#14141a]">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Check className="size-4 text-primary" aria-hidden />
          {saved.alreadyJoined
            ? "You're already on the list"
            : "You're on the list"}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          We&apos;ll email{" "}
          <span className="font-medium text-text-primary">{saved.email}</span>{" "}
          when {storeCopy[store].listing}.
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
          className="mt-3 text-sm font-medium text-primary underline-offset-2 hover:underline disabled:opacity-60"
          disabled={pending}
          onClick={() => {
            void onLeave();
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form
      className="relative mt-4 flex max-w-md flex-col gap-2"
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    >
      <HoneypotField />
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-label="Email"
          value={email}
          placeholder="Email"
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
          className="h-12 min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 text-base leading-none text-[#111118] outline-none placeholder:text-[#6B7280] focus:border-primary dark:border-white/25 dark:bg-transparent dark:text-white dark:placeholder:text-white/50"
        />
        <HomeCtaButton
          type="submit"
          loading={pending}
          variant="primary"
          className="h-12 shrink-0 rounded-full px-4 py-0 text-sm"
        >
          Notify me
        </HomeCtaButton>
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function HomeDownloadCtaSection() {
  const { stores, status } = usePublicApp();
  const iosUrl = liveStoreUrl(stores?.ios);
  const androidUrl = liveStoreUrl(stores?.android);
  const anyLive = Boolean(iosUrl || androidUrl);
  const [selected, setSelected] = useState<StoreChoice | null>(null);
  const saved = useSyncExternalStore(
    subscribeSaved,
    getSavedSnapshot,
    () => null,
  );

  const openStore =
    selected &&
    ((selected === "ios" && !iosUrl) || (selected === "android" && !androidUrl))
      ? selected
      : null;

  return (
    <section
      id="download-app"
      className="mx-auto w-full max-w-360 px-4 py-12 sm:px-8 sm:py-16 lg:px-20"
      aria-labelledby="download-app-heading"
    >
      <div className="grid grid-cols-1 items-center gap-10 overflow-hidden border border-[#E5E7EB] bg-[#FDF2F4] dark:border-primary/20 dark:bg-[#2A1117] lg:grid-cols-2 lg:gap-12">
        <ScrollReveal className="px-5 py-8 sm:px-8 sm:py-10 lg:pl-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {status === "loading"
              ? "The app"
              : anyLive
                ? "Get the app"
                : "Coming soon"}
          </p>
          <h2
            id="download-app-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
          >
            Carry Blivap in your pocket
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            {anyLive
              ? "Live matches, alerts, and secure messaging are ready on your phone."
              : "Leave your email and we’ll tell you when the app is on your store."}
          </p>
          {status === "loading" ? (
            <div className="mt-6 h-11 w-56 animate-pulse rounded-full bg-primary/15" />
          ) : (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {iosUrl ? (
                <HomeCtaButton
                  href={iosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  className="rounded-full px-6"
                >
                  Download on the App Store
                </HomeCtaButton>
              ) : (
                <HomeCtaButton
                  type="button"
                  variant="primary"
                  aria-pressed={openStore === "ios"}
                  aria-controls="app-store-notify"
                  onClick={() => setSelected("ios")}
                  className={cn(
                    "rounded-full px-6",
                    openStore === "ios" &&
                      "ring-2 ring-primary/40 ring-offset-2 ring-offset-[#FDF2F4] dark:ring-offset-[#2A1117]",
                  )}
                >
                  {storeCopy.ios.button}
                </HomeCtaButton>
              )}
              {androidUrl ? (
                <HomeCtaButton
                  href={androidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  className="rounded-full border-primary/30 bg-white px-6 dark:bg-transparent"
                >
                  Get it on Google Play
                </HomeCtaButton>
              ) : (
                <HomeCtaButton
                  type="button"
                  variant="outline"
                  aria-pressed={openStore === "android"}
                  aria-controls="app-store-notify"
                  onClick={() => setSelected("android")}
                  className={cn(
                    "rounded-full border-primary/30 bg-white px-6 dark:bg-transparent",
                    openStore === "android" &&
                      "ring-2 ring-primary/40 ring-offset-2 ring-offset-[#FDF2F4] dark:ring-offset-[#2A1117]",
                  )}
                >
                  {storeCopy.android.button}
                </HomeCtaButton>
              )}
            </div>
          )}
          {openStore ? (
            <div id="app-store-notify">
              <StoreNotifyForm
                key={openStore}
                store={openStore}
                saved={saved}
                onSaved={writeSavedJoin}
                onCleared={() => writeSavedJoin(null)}
              />
            </div>
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
        </ScrollReveal>

        <ScrollReveal
          delay={0.1}
          className="relative flex justify-center px-6 pb-10 pt-2 lg:pb-12"
        >
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
        </ScrollReveal>
      </div>
    </section>
  );
}
