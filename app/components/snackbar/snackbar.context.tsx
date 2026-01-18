"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { SnackbarSeverity } from "./snackbar.component";

interface SnackbarState {
  message: string;
  severity?: SnackbarSeverity;
  duration?: number;
}

interface SnackbarContextType {
  snackbar: SnackbarState | null;
  showSnackbar: (
    message: string,
    severity?: SnackbarSeverity,
    duration?: number
  ) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const showSnackbar = (
    message: string,
    severity: SnackbarSeverity = "info",
    duration: number = 3000
  ) => {
    setSnackbar({ message, severity, duration });
  };

  const hideSnackbar = () => {
    setSnackbar(null);
  };

  return (
    <SnackbarContext.Provider value={{ snackbar, showSnackbar, hideSnackbar }}>
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
