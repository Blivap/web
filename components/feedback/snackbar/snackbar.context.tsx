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
import type { InAppNotification } from "@/types/notifications";
import { SnackbarSeverity } from "./snackbar.component";

export interface SnackbarState {
  id: number;
  message: string;
  severity?: SnackbarSeverity;
  duration?: number;
}

type ScreenNotice =
  | { kind: "snackbar"; snackbar: SnackbarState }
  | { kind: "toast"; notification: InAppNotification };

interface SnackbarContextType {
  snackbar: SnackbarState | null;
  activeToast: InAppNotification | null;
  showSnackbar: (
    message: string,
    severity?: SnackbarSeverity,
    duration?: number,
  ) => void;
  hideSnackbar: () => void;
  enqueueToast: (notification: InAppNotification) => void;
  dismissActiveToast: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [notices, setNotices] = useState<ScreenNotice[]>([]);
  const nextIdRef = useRef(1);
  const head = notices[0] ?? null;
  const snackbar = head?.kind === "snackbar" ? head.snackbar : null;
  const activeToast = head?.kind === "toast" ? head.notification : null;

  const showSnackbar = useCallback(
    (
      message: string,
      severity: SnackbarSeverity = "info",
      duration: number = 3000,
    ) => {
      const notice: ScreenNotice = {
        kind: "snackbar",
        snackbar: {
          id: nextIdRef.current++,
          message,
          severity,
          duration,
        },
      };
      setNotices((items) => [...items, notice]);
    },
    [],
  );

  const hideSnackbar = useCallback(() => {
    setNotices((items) =>
      items[0]?.kind === "snackbar" ? items.slice(1) : items,
    );
  }, []);

  const enqueueToast = useCallback((notification: InAppNotification) => {
    setNotices((items) =>
      items.some(
        (item) =>
          item.kind === "toast" && item.notification.id === notification.id,
      )
        ? items
        : [...items, { kind: "toast", notification }],
    );
  }, []);

  const dismissActiveToast = useCallback(() => {
    setNotices((items) =>
      items[0]?.kind === "toast" ? items.slice(1) : items,
    );
  }, []);

  const value = useMemo(
    () => ({
      snackbar,
      activeToast,
      showSnackbar,
      hideSnackbar,
      enqueueToast,
      dismissActiveToast,
    }),
    [
      snackbar,
      activeToast,
      showSnackbar,
      hideSnackbar,
      enqueueToast,
      dismissActiveToast,
    ],
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
