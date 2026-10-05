import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { ILoginPayload } from "@/types";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch } from "@/store/hooks";
import {
  applyAuthSession,
  readAuthEnvelope,
} from "@/lib/auth/applyAuthSession";
import {
  classifyAnalyticsError,
  trackFailure,
  trackSuccess,
} from "@/lib/analytics/ga";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleLogin = async (payload: ILoginPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, status, message, error } = await $api.auth.login(payload);
      if (status >= 200 && status < 300) {
        trackSuccess("login", { method: "email" });
        showSnackbar("Login successful!", "success");
        await applyAuthSession({
          authData: readAuthEnvelope(data),
          dispatch,
          router,
          searchParams,
        });
        return true;
      } else {
        trackFailure("login", "api", { method: "email" });
        const errorMessage =
          error ||
          message ||
          "Login failed. Please check your credentials and try again.";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (error) {
      trackFailure("login", classifyAnalyticsError(error), { method: "email" });
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;

        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    handleLogin,
    isLoading,
  };
};
