import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IChangePasswordPayload } from "@/app/types";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const changePassword = async (
    payload: IChangePasswordPayload,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, message, error } =
        await $api.auth.changePassword(payload);
      if (status >= 200 && status < 300) {
        showSnackbar(message ?? "Password changed successfully.", "success");
        return true;
      }
      showSnackbar(error ?? message ?? "Change failed.", "error");
      return false;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message ??
            err.message
          : "Change failed. Please try again.";
      showSnackbar(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { changePassword, isLoading };
}
