import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { $api } from "@/app/api";
import { ILoginPayload, IAuthResponse } from "@/types";
import { isEmailUnverified, normalizeUser } from "@/lib/utils";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, setUser } from "@/store/slices/authSlice";
import { routes } from "@/config/routes";
import { getDnRedirect, withDn } from "@/lib/navigation/authRedirect";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleLogin = async (payload: ILoginPayload): Promise<boolean> => {
    const dnRedirect = getDnRedirect(searchParams);
    const postAuthRedirect = dnRedirect ?? routes.overview;
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

        showSnackbar("Login successful!", "success");

        if (token) {
          dispatch(setCredentials({ token }));
          let userPayload = normalizeUser(authData?.user ?? authData) ?? null;
          if (!userPayload) {
            try {
              const me = await $api.auth.me();
              if (me.status >= 200 && me.status < 300 && me.data) {
                userPayload = normalizeUser(me.data);
              }
            } catch {
              /* session token may lag; routing still uses login envelope below */
            }
          }
          if (userPayload) {
            dispatch(setUser(userPayload));
          }
          if (isEmailUnverified(userPayload ?? authData?.user)) {
            router.replace(withDn(routes.verifyEmail, dnRedirect));
          } else {
            router.replace(postAuthRedirect);
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
