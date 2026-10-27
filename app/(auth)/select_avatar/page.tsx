"use client";

import { Button } from "../../../components/button/button.component";
import { AvatarPicker } from "@/components/select-avatar/avatar-picker.component";
import { useSelectAvatar } from "@/hooks/select-avatar/useSelectAvatar.hook";
import { useEffect } from "react";

export default function SelectAvatarPage() {
  const {
    avatars,
    avatarMeta,
    selectedAvatar,
    handleSelectAvatar,
    handleContinue,
    isLoading,
    getAvatars,
    isConfirming,
  } = useSelectAvatar();
  useEffect(() => {
    if (!avatars) {
      void getAvatars();
    }
  }, [avatars, getAvatars]);
  return (
    <div className="flex flex-1 items-center justify-center bg-white p-5 dark:bg-[#0B0D12]">
      <div className="flex flex-col gap-14">
        <p className="text-center text-[32px] font-medium text-primary dark:text-white">
          Select Avatar
        </p>
        <div className="flex flex-col gap-13.5">
          <AvatarPicker
            avatars={avatars}
            isLoading={isLoading}
            selectedUrl={selectedAvatar}
            onSelect={handleSelectAvatar}
            page={avatarMeta.page}
            totalPages={avatarMeta.totalPages}
            hasNextPage={avatarMeta.hasNextPage}
            hasPreviousPage={avatarMeta.hasPreviousPage}
            onPageChange={(nextPage) => void getAvatars(nextPage)}
            tileClassName="size-15 shrink-0 rounded-full border border-transparent bg-[#B190B6] dark:bg-[#374151]"
            skeletonClassName="animate-pulse dark:bg-[#4B5563]"
            frameClassName="rounded-3xl border border-black/5 bg-[#00000026] px-8 py-10 dark:border-white/10 dark:bg-white/6 md:px-18.75 md:py-24.5"
          />
          <Button
            disabled={!selectedAvatar || isConfirming}
            loading={isConfirming}
            onClick={() => void handleContinue()}
            className="rounded-[40px]!"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
