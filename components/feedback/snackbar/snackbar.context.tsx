"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SnackbarSeverity } from "./snackbar.component";

export interface SnackbarState {
  id: number;
  message: string;
  severity?: SnackbarSeverity;
  duration?: number;
}

interface SnackbarContextType {
  snackbar: SnackbarState | null;
  showSnackbar: (
    message: string,
    severity?: SnackbarSeverity,
    duration?: number,
  ) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const nextIdRef = useRef(1);

  const showSnackbar = useCallback((
    message: string,
    severity: SnackbarSeverity = "info",
    duration: number = 3000,
  ) => {
    setSnackbar({
      id: nextIdRef.current++,
      message,
      severity,
      duration,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  const value = useMemo(
    () => ({ snackbar, showSnackbar, hideSnackbar }),
    [snackbar, showSnackbar, hideSnackbar],
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
