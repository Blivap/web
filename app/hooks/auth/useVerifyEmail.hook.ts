import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IVerifyEmailPayload } from "@/app/types";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { useRouter } from "next/navigation";

export function useVerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const verifyEmail = async (
    payload: IVerifyEmailPayload,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, message, error } = await $api.auth.verifyEmail(payload);
      if (status >= 200 && status < 300) {
        showSnackbar(message ?? "Email verified successfully.", "success");
        router.push("/login");
        return true;
      }
      showSnackbar(error ?? message ?? "Verification failed.", "error");
      return false;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message ??
            err.message
          : "Verification failed. Please try again.";
      showSnackbar(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyEmail, isLoading };
}
