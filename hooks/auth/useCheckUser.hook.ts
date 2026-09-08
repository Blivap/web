import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { $api } from "@/app/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils";
import { forceSessionEnd } from "@/lib/auth/forceSessionEnd";
import { isJwtExpired } from "@/lib/auth/isJwtExpired";
import Cookies from "js-cookie";

export const useCheckUser = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );
  const hasCheckedRef = useRef<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      const cookieToken = Cookies.get("auth_token");
      const hasToken = Boolean(token || cookieToken);
      const activeToken = token || cookieToken || "";

      if (!hasToken) {
        hasCheckedRef.current = false;
        return;
      }

      // Cookie/JWT already past exp — clear and send to login before calling /me
      if (activeToken && isJwtExpired(activeToken)) {
        forceSessionEnd({
          replace: (path) => router.replace(path),
        });
        return;
      }

      if (user || hasCheckedRef.current) return;

      hasCheckedRef.current = true;
      setIsChecking(true);
      try {
        const { data, status } = await $api.auth.me();
        if (status >= 200 && status < 300 && data) {
          const userPayload = normalizeUser(data);
          if (userPayload) {
            dispatch(setUser(userPayload));
          } else {
            hasCheckedRef.current = false;
            forceSessionEnd({
              replace: (path) => router.replace(path),
            });
          }
        } else {
          hasCheckedRef.current = false;
          forceSessionEnd({
            replace: (path) => router.replace(path),
          });
        }
      } catch (error: unknown) {
        hasCheckedRef.current = false;
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            // Interceptor may already redirect; ensure session is cleared
            forceSessionEnd({
              replace: (path) => router.replace(path),
            });
            return;
          }
        }
        // Network blip: allow a later retry without logging the user out
      } finally {
        setIsChecking(false);
      }
    };

    void checkUser();
  }, [token, isAuthenticated, user, dispatch, router]);

  return { isChecking };
};
