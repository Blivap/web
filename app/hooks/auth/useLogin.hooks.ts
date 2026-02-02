import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { $api } from "@/app/api";
import { ILoginPayload, IAuthResponse } from "@/app/types";
import { isEmailUnverified, normalizeUser } from "@/app/utils/user";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/slices/authSlice";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleLogin = async (payload: ILoginPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, status, message, error } = await $api.auth.login(payload);
      if (status >= 200 && status < 300) {
        // Backend shape: { message: string; data: { accessToken, user, ... } }
        const envelope = (data || {}) as {
          message?: string;
          data?: IAuthResponse;
        };
        const authData = envelope.data ?? ((data || {}) as IAuthResponse);

        const token =
          authData?.accessToken ??
          (authData as { access_token?: string })?.access_token ??
          authData?.token;

        showSnackbar(
          message || envelope.message || "Login successful!",
          "success",
        );

        if (token) {
          const userPayload = normalizeUser(authData?.user ?? authData) ?? authData?.user;
          dispatch(
            setCredentials({
              token,
              user: userPayload ?? undefined,
            }),
          );
          if (isEmailUnverified(userPayload ?? authData?.user)) {
            router.push("/verify-email");
          } else {
            router.push("/dashboard");
          }
        }
        return true;
      } else {
        const errorMessage =
          error ||
          message ||
          "Login failed. Please check your credentials and try again.";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (error) {
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
