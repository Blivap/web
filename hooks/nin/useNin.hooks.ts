import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { $api } from "@/api";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils";

const GENERIC_ERROR = "Something went wrong. Please try again.";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const useNin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const clearError = useCallback(() => setError(null), []);

  /** Client-side PDF check; sets error message if invalid. */
  const assertPdfFile = useCallback((file: File): boolean => {
    if (!isPdfFile(file)) {
      setError("Only PDF files are allowed");
      return false;
    }
    return true;
  }, []);

  const verifyNinDocument = useCallback(
    async (file: File): Promise<boolean> => {
      setError(null);
      if (!assertPdfFile(file)) {
        return false;
      }

      setIsLoading(true);
      try {
        const { status } = await $api.nin.verifyNinDocument(file);
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
            setError("Only PDF files are allowed");
          } else if (status === 422) {
            setError("Your NIN document does not match your account details");
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
    [assertPdfFile, dispatch],
  );

  return {
    isLoading,
    error,
    clearError,
    assertPdfFile,
    verifyNinDocument,
  };
};
