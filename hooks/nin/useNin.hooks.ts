import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { $api } from "@/app/api";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const NIN_LENGTH = 11;

export const useNin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const clearError = useCallback(() => setError(null), []);

  /** Client-side NIN check; sets error message if invalid. */
  const assertNin = useCallback((nin: string): boolean => {
    const digits = nin.replace(/\D/g, "");
    if (digits.length !== NIN_LENGTH) {
      setError("Enter your 11-digit NIN");
      return false;
    }
    return true;
  }, []);

  const verifyNin = useCallback(
    async (nin: string): Promise<boolean> => {
      setError(null);
      const digits = nin.replace(/\D/g, "");
      if (!assertNin(digits)) {
        return false;
      }

      setIsLoading(true);
      try {
        const { status } = await $api.nin.verifyNin(digits);
        if (status === 200 || status === 201) {
          const me = await $api.auth.me();
          if (me.status >= 200 && me.status < 300 && me.data) {
            const userPayload = normalizeUser(me.data);
            if (userPayload) {
              dispatch(setUser(userPayload));
            }
          }
          return true;
        }
        setError(GENERIC_ERROR);
        return false;
      } catch (e) {
        if (e instanceof AxiosError) {
          const status = e.response?.status;
          if (status === 400) {
            setError("Enter a valid 11-digit NIN");
          } else if (status === 422) {
            setError("Your NIN does not match your account details");
          } else if (status !== undefined && status >= 500) {
            setError(GENERIC_ERROR);
          } else {
            const data = e.response?.data as { message?: string } | undefined;
            setError(data?.message ?? GENERIC_ERROR);
          }
        } else {
          setError(GENERIC_ERROR);
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [assertNin, dispatch],
  );

  return {
    isLoading,
    error,
    clearError,
    assertNin,
    verifyNin,
  };
};
