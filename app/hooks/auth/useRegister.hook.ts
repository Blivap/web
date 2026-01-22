import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IAuthResponse, IRegisterPayload } from "@/app/types";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/slices/authSlice";
import { useRouter } from "next/navigation";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleRegister = async (
    payload: IRegisterPayload & { confirmPassword?: string },
  ): Promise<boolean> => {
    setIsLoading(true);
   
    try {
      // Exclude confirmPassword from the API payload
      const { confirmPassword, ...apiPayload } = payload;
      const { data, status, message, error } =
        await $api.auth.register(apiPayload);
      if (status >= 200 && status < 300) {
        const envelope = (data || {}) as {
          message?: string;
          data?: IAuthResponse;
        };
        const authData = envelope.data ?? ((data || {}) as IAuthResponse);
        const token =
          authData.accessToken ?? authData.access_token ?? authData.token;
        showSnackbar(
          message ||
            envelope.message ||
            "Registration successful! Please log in.",
          "success",
        );

        if (token) {
          dispatch(
            setCredentials({
              token,
              user: authData?.user || undefined,
            }),
          );
          router.push("/dashboard");
        }
        return true;
      } else {
        const errorMessage =
          error || message || "Registration failed. Please try again.";
        showSnackbar(errorMessage, "error");
        return false;
      }
    } catch (error: unknown) {
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
    handleRegister,
    isLoading,
  };
};
