"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeAvatarModal,
  openAvatarModal,
} from "@/store/slices/selectAvatarSlice";

/** Shared modal controls for avatar reselection from any component. */
export function useAvatarModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.selectAvatar.isModalOpen);

  return {
    isOpen,
    open: () => dispatch(openAvatarModal()),
    close: () => dispatch(closeAvatarModal()),
  };
}
