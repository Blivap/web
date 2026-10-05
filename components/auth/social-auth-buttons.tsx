"use client";

import Image from "next/image";

import { useSocialAuth } from "@/hooks/auth/useSocialAuth.hooks";
import { SocialProvider } from "@/lib/firebase/auth";

const PROVIDERS: { provider: SocialProvider; src: string; label: string }[] = [
  { provider: "google", src: "/icons/Google.svg", label: "Google" },
  { provider: "apple", src: "/icons/Apple.svg", label: "Apple" },
  { provider: "facebook", src: "/icons/facebook.svg", label: "Facebook" },
];

export function SocialAuthButtons() {
  const { signIn, pending } = useSocialAuth();

  return (
    <>
      {PROVIDERS.map((item) => (
        <button
          key={item.provider}
          type="button"
          aria-label={`Continue with ${item.label}`}
          disabled={pending !== null}
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
