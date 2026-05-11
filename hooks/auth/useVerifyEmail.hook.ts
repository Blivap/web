import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { IVerifyEmailPayload } from "@/types";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils";
import { getPostAuthRedirect } from "@/lib/navigation/authRedirect";

export function useVerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const existingUser = useAppSelector((s) => s.auth.user);

  const verifyEmail = async (
    payload: IVerifyEmailPayload,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, message, error } = await $api.auth.verifyEmail(payload);

      if (status >= 200 && status < 300) {
        showSnackbar(message ?? "Email verified successfully.", "success");

        /* Refresh profile from /me. If the API lags, /me can still return
         * email_verified: false and AuthChecker will send the user back to
         * /verify-email — so we always treat verification success as verified. */
        let userPayload: ReturnType<typeof normalizeUser> = null;
        try {
          const { data, status: meStatus } = await $api.auth.me();
          if (meStatus >= 200 && meStatus < 300 && data) {
            userPayload = normalizeUser(data);
          }
        } catch {
          // If /me fails, merge below from existing session user
        }

        if (userPayload) {
          dispatch(setUser({ ...userPayload, emailVerified: true }));
        } else if (existingUser) {
          dispatch(setUser({ ...existingUser, emailVerified: true }));
        }

        router.replace(getPostAuthRedirect(searchParams));
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
