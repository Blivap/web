"use client";

import Image from "next/image";

import { useSocialAuth } from "@/hooks/auth/useSocialAuth.hooks";
import { isFirebaseAuthConfigured, SocialProvider } from "@/lib/firebase/auth";

const PROVIDERS: {
  provider: SocialProvider;
  src: string;
  label: string;
  available: boolean;
}[] = [
  { provider: "google", src: "/icons/Google.svg", label: "Google", available: true },
  {
    provider: "apple",
    src: "/icons/Apple.svg",
    label: "Apple",
    available: false,
  },
  {
    provider: "facebook",
    src: "/icons/facebook.svg",
    label: "Facebook",
    available: false,
  },
];

type SocialAuthButtonsProps = {
  /** When false, buttons stay visible but blocked (e.g. terms not accepted). */
  enabled?: boolean;
};

export function SocialAuthButtons({ enabled = true }: SocialAuthButtonsProps) {
  const configured = isFirebaseAuthConfigured();
  const { signIn, pending } = useSocialAuth({ enabled });

  if (!configured) {
    return (
      <p className="max-w-xs text-center text-xs text-text-tertiary">
        Social sign-in is unavailable until Firebase Authentication is enabled
        for this project.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-6">
        {PROVIDERS.map((item) => {
          const underConstruction = !item.available;
          return (
            <button
              key={item.provider}
              type="button"
              aria-label={
                underConstruction
                  ? `${item.label} sign-in is under construction`
                  : `Continue with ${item.label}`
              }
              aria-disabled={underConstruction || undefined}
              disabled={underConstruction || pending !== null || !enabled}
              title={
                underConstruction
                  ? "Under construction"
                  : !enabled
                    ? "Accept the terms to continue"
                    : undefined
              }
              onClick={() => {
                if (underConstruction) return;
                void signIn(item.provider);
              }}
              className={
                underConstruction
                  ? "cursor-not-allowed opacity-40"
                  : "disabled:opacity-50"
              }
            >
              <Image src={item.src} alt="" width={32} height={32} />
            </button>
          );
        })}
      </div>
      <p className="max-w-xs text-center text-xs text-text-tertiary">
        Apple and Facebook sign-in are under construction.
      </p>
    </div>
  );
}
