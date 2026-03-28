import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { $api } from "@/services";
import { IVerifyEmailPayload } from "@/types";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils";

export function useVerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const verifyEmail = async (
    payload: IVerifyEmailPayload,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, message, error } = await $api.auth.verifyEmail(payload);

      if (status >= 200 && status < 300) {
        showSnackbar(message ?? "Email verified successfully.", "success");

        // Refresh user data so emailVerified/profileImage are up to date
        try {
          const { data, status: meStatus } = await $api.auth.me();
          if (meStatus >= 200 && meStatus < 300 && data) {
            const userPayload = normalizeUser(data);
            if (userPayload) {
              dispatch(setUser(userPayload));
            }
          }
        } catch {
          // If /me fails, still proceed with navigation
        }

        // After email verification, always go to select avatar (replace so back doesn't return to verify-email)
        router.replace("/select_avatar");
        return true;
      }

      showSnackbar(error ?? message ?? "Verification failed.", "error");
      return false;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? ((err.response?.data as { message?: string })?.message ??
            err.message)
          : "Verification failed. Please try again.";
      showSnackbar(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyEmail, isLoading };
}
