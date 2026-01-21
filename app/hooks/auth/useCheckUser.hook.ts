import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUser, logout } from "@/app/store/slices/authSlice";
export const useCheckUser = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );
  const hasCheckedRef = useRef<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  useEffect(() => {
    const checkUser = async () => {
      if (token && isAuthenticated && !user && !hasCheckedRef.current) {
        hasCheckedRef.current = true;
        setIsChecking(true);
        try {
          const { data, status } = await $api.auth.me();
          if (status >= 200 && status < 300 && data) {
            dispatch(setUser(data));
          } else {
            dispatch(logout());
            hasCheckedRef.current = false;
          }
        } catch (error: unknown) {
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

    checkUser();
  }, [token, isAuthenticated, user, dispatch]);
  return { isChecking };
};
