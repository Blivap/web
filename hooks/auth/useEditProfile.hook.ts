import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IEditProfilePayload, IUser } from "@/types";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils";

function mergeProfileUpdate(
  currentUser: IUser | null,
  payload: IEditProfilePayload,
  apiUser: IUser | null,
): IUser | null {
  if (!currentUser && !apiUser) return null;

  const base = {
    ...(currentUser ?? {}),
    ...(apiUser ?? {}),
  } as IUser;

  return {
    ...base,
    id: apiUser?.id || currentUser?.id || "",
    firstname:
      payload.firstname !== undefined
        ? payload.firstname
        : (apiUser?.firstname ?? currentUser?.firstname ?? ""),
    lastname:
      payload.lastname !== undefined
        ? payload.lastname
        : (apiUser?.lastname ?? currentUser?.lastname ?? ""),
    email: apiUser?.email ?? currentUser?.email ?? "",
    emailVerified:
      apiUser?.emailVerified ?? currentUser?.emailVerified ?? false,
    phonenumber:
      payload.phonenumber !== undefined
        ? payload.phonenumber
        : (apiUser?.phonenumber ?? currentUser?.phonenumber ?? null),
    dateOfBirth:
      payload.dateOfBirth !== undefined
        ? payload.dateOfBirth
        : (apiUser?.dateOfBirth ?? currentUser?.dateOfBirth ?? null),
    profileImage:
      payload.profileImage !== undefined
        ? payload.profileImage
        : (apiUser?.profileImage ?? currentUser?.profileImage ?? null),
    nationalIdentificationNumber:
      apiUser?.nationalIdentificationNumber ??
      currentUser?.nationalIdentificationNumber ??
      null,
    nationalIdentificationNumberVerified:
      apiUser?.nationalIdentificationNumberVerified ??
      currentUser?.nationalIdentificationNumberVerified ??
      false,
    hasAcceptedTermsAndConditions:
      apiUser?.hasAcceptedTermsAndConditions ??
      currentUser?.hasAcceptedTermsAndConditions ??
      false,
    isDeleted: apiUser?.isDeleted ?? currentUser?.isDeleted ?? false,
    lastActive:
      apiUser?.lastActive ??
      currentUser?.lastActive ??
      new Date().toISOString(),
    ...(apiUser?.roles || currentUser?.roles
      ? { roles: apiUser?.roles ?? currentUser?.roles }
      : {}),
  };
}

export function useEditProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const updateProfile = async (
    payload: IEditProfilePayload,
  ): Promise<IUser | null> => {
    setIsLoading(true);
    try {
      const { data, status, message, error } =
        await $api.auth.updateProfile(payload);
      if (status >= 200 && status < 300) {
        const apiUser = data ? normalizeUser(data) : null;

        // Apply submitted fields immediately so header/settings/verify-id stay in sync
        const optimisticUser = mergeProfileUpdate(
          currentUser,
          payload,
          apiUser,
        );
        if (optimisticUser) {
          dispatch(setUser(optimisticUser));
        }

        // Refetch /me so any server-normalized fields replace the optimistic merge
        try {
          const me = await $api.auth.me();
          if (me.status >= 200 && me.status < 300 && me.data) {
            const meUser = normalizeUser(me.data);
            const synced = mergeProfileUpdate(optimisticUser, payload, meUser);
            if (synced) {
              dispatch(setUser(synced));
              showSnackbar("Profile updated.");
              return synced;
            }
          }
        } catch {
          /* keep optimistic user if /me fails */
        }

        showSnackbar("Profile updated.");
        return optimisticUser;
      }
      showSnackbar(error ?? message ?? "Update failed.", "error");
      return null;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? ((err.response?.data as { message?: string })?.message ??
            err.message)
          : "Update failed. Please try again.";
      showSnackbar(msg, "error");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, isLoading };
}
