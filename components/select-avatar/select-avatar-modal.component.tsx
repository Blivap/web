"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import classNames from "classnames";
import { Button } from "@/components/button/button.component";
import { Modal } from "@/components/ui/modal/modal.component";
import { useSelectAvatar } from "@/hooks/select-avatar/useSelectAvatar.hook";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeAvatarModal,
  openAvatarModal,
  setSelectedAvatar,
} from "@/store/slices/selectAvatarSlice";

export function SelectAvatarModal() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isModalOpen = useAppSelector((s) => s.selectAvatar.isModalOpen);
  const autoOpenedRef = useRef(false);

  const {
    avatars,
    isLoading,
    selectedAvatar,
    handleSelectAvatar,
    getAvatars,
    handleContinue,
    isConfirming,
  } = useSelectAvatar();

  const requiresAvatar = !!user && !user.profileImage;
  const open = requiresAvatar || isModalOpen;

  useEffect(() => {
    if (!avatars) {
      void getAvatars();
    }
  }, [avatars, getAvatars]);

  useEffect(() => {
    if (!requiresAvatar || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    dispatch(openAvatarModal());
  }, [dispatch, requiresAvatar]);

  useEffect(() => {
    if (!open) return;
    if (!selectedAvatar && user?.profileImage) {
      dispatch(setSelectedAvatar(user.profileImage));
    }
  }, [dispatch, open, selectedAvatar, user?.profileImage]);

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={() => dispatch(closeAvatarModal())}
      className="w-full max-w-[750px] px-6 py-9 sm:px-7 sm:py-10"
    >
      <div className="flex flex-col gap-6 md:gap-8">
        <h2 className="text-lg sm:text-xl font-semibold text-primary text-center mb-5">
          Select Avatar
        </h2>
        <div className="grid grid-cols-4 grid-rows-3 gap-4 rounded-3xl bg-[#00000026] px-8 py-8 sm:px-[75px] sm:py-[98px] ">
          {isLoading || !avatars
            ? [...Array(12)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center size-[60px] shrink-0 animate-pulse rounded-full border border-[#FFFFFF00] bg-[#B190B6] "
                />
              ))
            : avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={classNames(
                    "relative size-10 sm:size-[60px] shrink-0 overflow-hidden rounded-full border border-[#FFFFFF00] bg-[#B190B6] transition-all duration-150 hover:border-3 hover:border-primary",
                    {
                      "border-3 border-primary": selectedAvatar === avatar.url,
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
          onClick={() => {
            void handleContinue(false);
            dispatch(closeAvatarModal());
          }}
          className="rounded-[40px]! px-5 py-2"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
