"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditProfile } from "@/app/hooks/auth/useEditProfile.hook";

const DEFAULT_AVATAR_URLS = [
  "https://picsum.photos/600/400?random=1",
  "https://picsum.photos/600/400?random=2",
  "https://picsum.photos/600/400?random=3",
  "https://picsum.photos/600/400?random=4",
  "https://picsum.photos/600/600?random=5",
  "https://picsum.photos/600/600?random=6",
  "https://picsum.photos/800/500?random=7",
  "https://picsum.photos/800/500?random=8",
  "https://picsum.photos/500/700?random=9",
  "https://picsum.photos/500/700?random=10",
  "https://picsum.photos/700/700?random=11",
  "https://picsum.photos/900/600?random=12",
  "https://picsum.photos/1200/800?random=13",
  "https://picsum.photos/400/400?random=14",
  "https://picsum.photos/400/400?random=15",
  "https://picsum.photos/400/400?random=16",
];

export function useSelectAvatar() {
  const router = useRouter();
  const { updateProfile, isLoading } = useEditProfile();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleSelectAvatar = (avatarUrl: string) => {
    setSelectedAvatar((prev) => (prev === avatarUrl ? null : avatarUrl));
  };

  const handleContinue = async () => {
    if (!selectedAvatar) return;
    const updated = await updateProfile({ profileImage: selectedAvatar });
    if (updated) {
      router.replace("/overview");
    }
  };

  return {
    avatars: DEFAULT_AVATAR_URLS,
    selectedAvatar,
    handleSelectAvatar,
    handleContinue,
    isLoading,
  };
}
