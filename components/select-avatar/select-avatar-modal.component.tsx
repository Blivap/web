"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/button/button.component";
import { Modal } from "@/components/ui/modal/modal.component";
import { AvatarPicker } from "@/components/select-avatar/avatar-picker.component";
import { useSelectAvatar } from "@/hooks/select-avatar/useSelectAvatar.hook";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeAvatarModal,
  openAvatarModal,
  setSelectedAvatar,
} from "@/store/slices/selectAvatarSlice";

const avatarOptionClass =
  "size-10 shrink-0 rounded-full border border-[#FFFFFF00] bg-[#B190B6] sm:size-15";

export function SelectAvatarModal() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isModalOpen = useAppSelector((s) => s.selectAvatar.isModalOpen);
  const autoOpenedRef = useRef(false);

  const {
    avatars,
    avatarMeta,
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
    if (!open || avatars !== null) return;
    void getAvatars();
  }, [open, avatars, getAvatars]);

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
      label="Select avatar"
      className=" w-fit px-6 py-9 sm:px-7 sm:py-10"
    >
      <div className="flex flex-col gap-6 md:gap-8">
        <h2 className="text-lg sm:text-xl font-semibold text-primary text-center mb-5">
          Select Avatar
        </h2>
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
          tileClassName={avatarOptionClass}
          frameClassName="rounded-3xl bg-[#00000026] px-8 py-8 sm:px-18.75 sm:py-24.5"
        />

        <Button
          disabled={!selectedAvatar || isConfirming}
          loading={isConfirming}
          onClick={async () => {
            const ok = await handleContinue(false);
            if (!ok) return;
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
