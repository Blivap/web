import { useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { IAuthResponse, IRegisterApiPayload, IRegisterPayload } from "@/types";
import { buildE164Phone } from "@/lib/phone-country-codes";
import { isEmailUnverified, normalizeUser } from "@/lib/utils";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, setUser } from "@/store/slices/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";
import {
  getDnRedirect,
  getPostAuthRedirect,
  withDn,
} from "@/lib/navigation/authRedirect";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
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
        phonenumber: buildE164Phone(
          payload.phoneCountryCode,
          payload.phoneNational,
        ),
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
          dispatch(setCredentials({ token }));
          const dnRedirect = getDnRedirect(searchParams);
          let userPayload = normalizeUser(authData?.user) ?? null;
          if (!userPayload) {
            try {
              const me = await $api.auth.me();
              if (me.status >= 200 && me.status < 300 && me.data) {
                userPayload = normalizeUser(me.data);
              }
            } catch {
              /* token may not be readable by /me yet */
            }
          }
          if (userPayload) {
            dispatch(setUser(userPayload));
          }
          if (isEmailUnverified(userPayload ?? authData?.user)) {
            router.replace(withDn(routes.verifyEmail, dnRedirect));
          } else {
            router.replace(getPostAuthRedirect(searchParams));
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
