import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IForgotPasswordPayload } from "@/types";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useRouter } from "next/navigation";

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const forgotPassword = async (
    payload: IForgotPasswordPayload,
    options?: { redirectOnSuccess?: boolean },
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, message, error } =
        await $api.auth.forgotPassword(payload);
      if (status >= 200 && status < 300) {
        showSnackbar(
          message ?? "If an account exists, you will receive a reset link.",
          "success",
        );
        if (options?.redirectOnSuccess !== false) {
          router.replace("/login");
        }
        return true;
      }
      showSnackbar(error ?? message ?? "Request failed.", "error");
      return false;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? ((err.response?.data as { message?: string })?.message ??
            err.message)
          : "Request failed. Please try again.";
      showSnackbar(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { forgotPassword, isLoading };
}
