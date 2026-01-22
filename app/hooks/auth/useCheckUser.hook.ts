import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUser, logout } from "@/app/store/slices/authSlice";
import Cookies from "js-cookie";

export const useCheckUser = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );
  const hasCheckedRef = useRef<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      // Check if we have a token (from Redux or cookie) but no user
      const cookieToken = Cookies.get("auth_token");
      const hasToken = token || cookieToken;
      
      if (hasToken && !user && !hasCheckedRef.current) {
        hasCheckedRef.current = true;
        setIsChecking(true);
        try {
          const { data, status } = await $api.auth.me();
          if (status >= 200 && status < 300 && data) {
            console.log("[useCheckUser] User fetched:", data);
            dispatch(setUser(data));
          } else {
            console.log("[useCheckUser] Failed to fetch user, logging out");
            dispatch(logout());
            hasCheckedRef.current = false;
          }
        } catch (error: unknown) {
          console.error("[useCheckUser] Error fetching user:", error);
          if (error instanceof AxiosError) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
              dispatch(logout());
            }
          }
          hasCheckedRef.current = false;
        } finally {
          setIsChecking(false);
        }
      }
    };

    // Reset ref when token or user changes (for refresh scenarios)
    if (!token && !Cookies.get("auth_token")) {
      hasCheckedRef.current = false;
    }

    checkUser();
  }, [token, isAuthenticated, user, dispatch]);

  return { isChecking };
};
