"use client";

import Image from "next/image";

import { useSocialAuth } from "@/hooks/auth/useSocialAuth.hooks";
import { isFirebaseAuthConfigured, SocialProvider } from "@/lib/firebase/auth";

const PROVIDERS: { provider: SocialProvider; src: string; label: string }[] = [
  { provider: "google", src: "/icons/Google.svg", label: "Google" },
  { provider: "apple", src: "/icons/Apple.svg", label: "Apple" },
  { provider: "facebook", src: "/icons/facebook.svg", label: "Facebook" },
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
    <>
      {PROVIDERS.map((item) => (
        <button
          key={item.provider}
          type="button"
          aria-label={`Continue with ${item.label}`}
          disabled={pending !== null || !enabled}
          title={!enabled ? "Accept the terms to continue" : undefined}
          onClick={() => {
            void signIn(item.provider);
          }}
          className="disabled:opacity-50"
        >
          <Image src={item.src} alt="" width={32} height={32} />
        </button>
      ))}
    </>
  );
}
