"use client";

import classNames from "classnames";
import Image from "next/image";
import { Button } from "../../../components/button/button.component";
import { useSelectAvatar } from "@/hooks/select-avatar/useSelectAvatar.hook";
import { useEffect } from "react";

export default function SelectAvatarPage() {
  const {
    avatars,
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
    <div className="flex flex-1 items-center justify-center p-5">
      <div className="flex flex-col gap-[56px]">
        <p className="text-center text-[32px] font-medium text-primary">
          Select Avatar
        </p>
        <div className="flex flex-col gap-[54px]">
          <div className="grid grid-cols-4 grid-rows-3 gap-4 rounded-3xl bg-[#00000026] px-5 py-10 md:px-[75px] md:py-[98px]">
            {isLoading || !avatars
              ? [...Array(12)].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center size-[60px] shrink-0 animate-pulse rounded-full border border-[#FFFFFF00] bg-[#B190B6] "
                  />
                ))
              : avatars?.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={classNames(
                      "relative size-[60px] shrink-0 overflow-hidden rounded-full border border-[#FFFFFF00] bg-[#B190B6] transition-all duration-150 hover:border-3 hover:border-primary",
                      {
                        "border-3 border-primary":
                          selectedAvatar === avatar.url,
                      },
                    )}
                    onClick={() => handleSelectAvatar(avatar.url)}
                  >
                    <Image
                      src={avatar.url}
                      alt="Avatar option"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
          </div>
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
