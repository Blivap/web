import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IEditProfilePayload, IUser } from "@/app/types";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";

export function useEditProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const updateProfile = async (
    payload: IEditProfilePayload,
  ): Promise<IUser | null> => {
    setIsLoading(true);
    try {
      const { data, status, message, error } =
        await $api.auth.updateProfile(payload);
      if (status >= 200 && status < 300 && data) {
        const user = (data as { data?: IUser })?.data ?? (data as IUser);
        dispatch(setUser(user));
        showSnackbar(message ?? "Profile updated.", "success");
        return user as IUser;
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
