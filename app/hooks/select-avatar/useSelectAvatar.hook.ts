"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditProfile } from "@/app/hooks/auth/useEditProfile.hook";
import { $api } from "@/app/api";
import { AxiosError } from "axios";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setAvatars,
  setIsLoading,
  setSelectedAvatar,
  toggleSelectedAvatar,
} from "@/app/store/slices/selectAvatarSlice";

export function useSelectAvatar() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { avatars, isLoading, selectedAvatar } = useAppSelector(
    (state) => state.selectAvatar,
  );

  const getAvatars = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const { data, status } = await $api.avatar.getAvatars();
      if (status >= 200 && status < 300 && data) {
        dispatch(setAvatars(data.data));
      }
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? ((err.response?.data as { message?: string })?.message ??
            err.message)
          : "Unable to load avatars.";
      showSnackbar(message, "error");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, showSnackbar]);

  useEffect(() => {
    if (!avatars) {
      void getAvatars();
    }
  }, [avatars, getAvatars]);

  const handleSelectAvatar = (avatarUrl: string) => {
    dispatch(toggleSelectedAvatar(avatarUrl));
  };

  const handleContinue = async () => {
    try {
      if (!selectedAvatar) return;
      const { data, status } = await $api.avatar.setAvatar(selectedAvatar);
      if (status >= 200 && status < 300 && data) {
        dispatch(setSelectedAvatar(data.data.url));
        router.replace("/overview");
      }
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? ((err.response?.data as { message?: string })?.message ??
            err.message)
          : "Unable to set avatar.";
      showSnackbar(message, "error");
    }
  };

  return {
    avatars,
    selectedAvatar,
    handleSelectAvatar,
    handleContinue,
    isLoading,
  };
}
