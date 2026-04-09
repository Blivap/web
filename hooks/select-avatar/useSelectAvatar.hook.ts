"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { $api } from "@/api";
import { AxiosError } from "axios";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import {
  setAvatars,
  setIsLoading,
  setSelectedAvatar,
  toggleSelectedAvatar,
} from "@/store/slices/selectAvatarSlice";
import { normalizeUser } from "@/lib/utils";

export function useSelectAvatar() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { avatars, isLoading, selectedAvatar } = useAppSelector(
    (state) => state.selectAvatar,
  );
  const user = useAppSelector((state) => state.auth.user);

  const [isConfirming, setIsConfirming] = useState<boolean>(false);
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

  const handleSelectAvatar = (avatarUrl: string) => {
    dispatch(toggleSelectedAvatar(avatarUrl));
  };

  const handleContinue = async (
    shouldRedirect: boolean = true,
  ): Promise<boolean> => {
    try {
      if (!selectedAvatar) return false;
      setIsConfirming(true);
      const { data, status } = await $api.avatar.setAvatar(selectedAvatar);
      if (status >= 200 && status < 300 && data) {
        const newProfileImage = data.data?.url ?? selectedAvatar;
        dispatch(setSelectedAvatar(newProfileImage));

        // Update UI immediately from setAvatar response (avoids me() cache / "have to do it twice")
        if (user) {
          dispatch(setUser({ ...user, profileImage: newProfileImage }));
        }
        if (typeof window !== "undefined" && newProfileImage) {
          window.dispatchEvent(
            new CustomEvent("blivap:set-avatar", {
              detail: newProfileImage,
            }),
          );
        }

        // Refetch full user so rest of profile stays in sync
        const { data: meData, status: meStatus } = await $api.auth.me();
        if (meStatus >= 200 && meStatus < 300 && meData) {
          const userPayload = normalizeUser(meData);
          if (userPayload) dispatch(setUser(userPayload));
        }

        if (shouldRedirect) {
          router.replace("/overview");
          return true;
        }
        return true;
      }
      return false;
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? ((err.response?.data as { message?: string })?.message ??
            err.message)
          : "Unable to set avatar.";
      showSnackbar(message, "error");
      return false;
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    avatars,
    selectedAvatar,
    handleSelectAvatar,
    handleContinue,
    getAvatars,
    isLoading,
    isConfirming,
  };
}
