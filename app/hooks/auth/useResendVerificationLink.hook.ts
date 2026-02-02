import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IResendVerificationQuery } from "@/app/types";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";

export function useResendVerificationLink() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const resendLink = async (
    query: IResendVerificationQuery,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, message, error } =
        await $api.auth.resendEmailVerificationLink(query);
      if (status >= 200 && status < 300) {
        showSnackbar(
        "Verification link sent.",
          "success",
        );
        return true;
      }
      showSnackbar(error ?? message ?? "Failed to resend link.", "error");
      return false;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message ??
            err.message
          : "Failed to resend verification link.";
      showSnackbar(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { resendLink, isLoading };
}
