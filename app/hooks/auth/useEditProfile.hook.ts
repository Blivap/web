import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IEditProfilePayload, IUser } from "@/app/types";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";

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
      if (status >= 200 && status < 300 && data) {
        const apiUser = (data as { data?: IUser })?.data ?? (data as IUser);
        // Merge with current user so we keep emailVerified and set profileImage from payload (API may omit or return partial data)
        const mergedUser: IUser = {
          ...(currentUser ?? {}),
          ...apiUser,
          id: apiUser?.id ?? currentUser?.id ?? "",
          firstname: apiUser?.firstname ?? currentUser?.firstname ?? "",
          lastname: apiUser?.lastname ?? currentUser?.lastname ?? "",
          email: apiUser?.email ?? currentUser?.email ?? "",
          emailVerified:
            apiUser?.emailVerified ?? currentUser?.emailVerified ?? false,
          profileImage:
            payload.profileImage !== undefined && payload.profileImage !== null
              ? payload.profileImage
              : apiUser?.profileImage ?? currentUser?.profileImage ?? null,
        } as IUser;
        dispatch(setUser(mergedUser));
        showSnackbar(message ?? "Profile updated.", "success");
        return mergedUser;
      }
      showSnackbar(error ?? message ?? "Update failed.", "error");
      return null;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message ??
            err.message
          : "Update failed. Please try again.";
      showSnackbar(msg, "error");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, isLoading };
}
