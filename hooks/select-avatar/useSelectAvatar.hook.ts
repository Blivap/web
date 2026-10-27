"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { AxiosError } from "axios";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import {
  emptyAvatarListMeta,
  setAvatarPage,
  setIsLoading,
  setSelectedAvatar,
  toggleSelectedAvatar,
} from "@/store/slices/selectAvatarSlice";
import { normalizeUser } from "@/lib/utils";
import { AvatarListMeta, IUser } from "@/types";
import { getPostAuthRedirect } from "@/lib/navigation/authRedirect";
import {
  classifyAnalyticsError,
  trackFailure,
  trackSuccess,
} from "@/lib/analytics/ga";

function readAvatarListMeta(body: unknown): AvatarListMeta {
  if (!body || typeof body !== "object") return emptyAvatarListMeta;
  const raw = (body as { meta?: unknown }).meta;
  if (!raw || typeof raw !== "object") return emptyAvatarListMeta;
  const meta = raw as Record<string, unknown>;
  const total = Math.max(0, Math.round(Number(meta.total) || 0));
  const totalPages = Math.max(1, Math.round(Number(meta.totalPages) || 1));
  const page = Math.min(
    totalPages,
    Math.max(1, Math.round(Number(meta.page) || 1)),
  );
  return {
    page,
    total,
    totalPages,
    hasNextPage:
      typeof meta.hasNextPage === "boolean"
        ? meta.hasNextPage
        : page < totalPages,
    hasPreviousPage:
      typeof meta.hasPreviousPage === "boolean"
        ? meta.hasPreviousPage
        : page > 1,
  };
}

function mergeUserWithAvatar(
  currentUser: IUser | null,
  nextUser: IUser | null,
  profileImage: string,
): IUser | null {
  if (!currentUser && !nextUser) return null;

  return {
    ...(currentUser ?? {}),
    ...(nextUser ?? {}),
    profileImage,
  } as IUser;
}

export function useSelectAvatar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { avatars, meta, isLoading, selectedAvatar } = useAppSelector(
    (state) => state.selectAvatar,
  );
  const user = useAppSelector((state) => state.auth.user);

  /* Keeps getAvatars() stable so useEffects that depend on it don’t loop when snackbar context identity changes. */
  const showSnackbarRef = useRef(showSnackbar);
  showSnackbarRef.current = showSnackbar;

  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const requestId = useRef(0);
  const avatarsRef = useRef(avatars);
  avatarsRef.current = avatars;

  const markLoadFinished = useCallback(() => {
    /* `null` means “never fetched” and the open effects would retry forever. */
    if (avatarsRef.current !== null) return;
    dispatch(setAvatarPage({ avatars: [], meta: emptyAvatarListMeta }));
  }, [dispatch]);

  const getAvatars = useCallback(
    async (page = 1) => {
      const id = ++requestId.current;
      try {
        dispatch(setIsLoading(true));
        const { data, status } = await $api.avatar.getAvatars(page);
        if (id !== requestId.current) return;
        if (status >= 200 && status < 300 && data) {
          const list = Array.isArray(data.data) ? data.data : [];
          dispatch(
            setAvatarPage({ avatars: list, meta: readAvatarListMeta(data) }),
          );
        } else {
          markLoadFinished();
        }
      } catch (err: unknown) {
        if (id !== requestId.current) return;
        const message =
          err instanceof AxiosError
            ? ((err.response?.data as { message?: string })?.message ??
              err.message)
            : "Unable to load avatars.";
        showSnackbarRef.current(message, "error");
        markLoadFinished();
      } finally {
        if (id === requestId.current) dispatch(setIsLoading(false));
      }
    },
    [dispatch, markLoadFinished],
  );

  const handleSelectAvatar = (avatarUrl: string) => {
    dispatch(toggleSelectedAvatar(avatarUrl));
  };

  const handleContinue = async (
    shouldRedirect: boolean = true,
  ): Promise<boolean> => {
    try {
      if (!selectedAvatar) {
        trackFailure("avatar_selected", "validation");
        return false;
      }
      setIsConfirming(true);
      const { data, status } = await $api.avatar.setAvatar(selectedAvatar);
      if (status >= 200 && status < 300 && data) {
        trackSuccess("avatar_selected");
        const newProfileImage = data.data?.url ?? selectedAvatar;
        dispatch(setSelectedAvatar(newProfileImage));

        // Update UI immediately from setAvatar response (avoids me() cache / "have to do it twice")
        const optimisticUser = mergeUserWithAvatar(user, null, newProfileImage);
        if (optimisticUser) {
          dispatch(setUser(optimisticUser));
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
          const mergedUser = mergeUserWithAvatar(
            optimisticUser,
            userPayload,
            newProfileImage,
          );
          if (mergedUser) {
            dispatch(setUser(mergedUser));
          }
        }

        if (shouldRedirect) {
          router.replace(getPostAuthRedirect(searchParams));
          return true;
        }
        return true;
      }
      trackFailure("avatar_selected", "api");
      return false;
    } catch (err: unknown) {
      trackFailure("avatar_selected", classifyAnalyticsError(err));
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
    avatarMeta: meta,
    selectedAvatar,
    handleSelectAvatar,
    handleContinue,
    getAvatars,
    isLoading,
    isConfirming,
  };
}
