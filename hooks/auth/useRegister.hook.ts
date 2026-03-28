import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/services";
import { IAuthResponse, IRegisterApiPayload, IRegisterPayload } from "@/types";
import { isEmailUnverified, normalizeUser } from "@/lib/utils";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/slices/authSlice";
import { useRouter } from "next/navigation";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleRegister = async (
    payload: IRegisterPayload & {
      confirmPassword?: string;
      termsAndCondition?: boolean;
      privacyStatement?: boolean;
    },
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Send only known signup fields. Do not spread Formik `values` — extras
      // (e.g. `dob` from autofill or stale keys) must not reach the API.
      const apiPayload: IRegisterApiPayload = {
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        password: payload.password,
        dateOfBirth: payload.dateOfBirth,
      };
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
          const userPayload = normalizeUser(authData?.user) ?? authData?.user;
          dispatch(
            setCredentials({
              token,
              user: userPayload ?? undefined,
            }),
          );
          if (isEmailUnverified(authData?.user)) {
            router.replace("/verify-email");
          } else {
            router.replace("/overview");
          }
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
