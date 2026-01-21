import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { ILoginPayload, IAuthResponse } from "@/app/types";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/slices/authSlice";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const handleLogin = async (payload: ILoginPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, status, message, error } = await $api.auth.login(payload);
      if (status >= 200 && status < 300) {
        console.log("[useLogin] raw response:", {
          data,
          status,
          message,
          error,
        });
        // Backend shape: { message: string; data: { accessToken, user, ... } }
        const envelope = (data || {}) as {
          message?: string;
          data?: IAuthResponse;
        };
        const authData = envelope.data ?? ((data || {}) as IAuthResponse);

        const token =
          authData.accessToken ?? authData.access_token ?? authData.token;

        console.log("[useLogin] parsed authData:", authData);
        console.log("[useLogin] resolved token:", token);

        showSnackbar(
          message || envelope.message || "Login successful!",
          "success",
        );

        if (token) {
          console.log("[useLogin] dispatching setCredentials");
          dispatch(
            setCredentials({
              token,
              user: authData.user || undefined,
            }),
          );
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
