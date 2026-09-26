import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IResetPasswordPayload } from "@/types";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useRouter } from "next/navigation";
import {
  classifyAnalyticsError,
  trackFailure,
  trackSuccess,
} from "@/lib/analytics/ga";

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const resetPassword = async (
    payload: IResetPasswordPayload,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, message, error } = await $api.auth.resetPassword(payload);
      if (status >= 200 && status < 300) {
        trackSuccess("password_reset_completed");
        showSnackbar("Password reset successfully.", "success");
        router.replace("/login");
        return true;
      }
      trackFailure("password_reset_completed", "api");
      showSnackbar(error ?? message ?? "Reset failed.", "error");
      return false;
    } catch (err) {
      trackFailure("password_reset_completed", classifyAnalyticsError(err));
      const msg =
        err instanceof AxiosError
          ? ((err.response?.data as { message?: string })?.message ??
            err.message)
          : "Reset failed. Please try again.";
      showSnackbar(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading };
}
