"use client";

import Cookies from "js-cookie";
import { routes } from "@/config/routes";
import { navigateOutAfterSuccess } from "@/lib/navigation/navigateOutAfterSuccess";
import { useNin } from "@/hooks/nin/useNin.hooks";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppSelector } from "@/store/hooks";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useVerifyIdPage() {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { showSnackbar } = useSnackbar();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const {
    isLoading: isNinVerifying,
    error: ninError,
    clearError: clearNinError,
    assertPdfFile,
    verifyNinDocument,
  } = useNin();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  const cookieToken =
    mounted && typeof window !== "undefined"
      ? Cookies.get("auth_token")
      : undefined;
  const hasSession = Boolean(token || cookieToken);

  const alreadyVerified = user?.nationalIdentificationNumberVerified === true;

  /**
   * Session resolving or user already has NIN verified — block the form (loader),
   * then redirect verified users to overview.
   */
  const awaitingProfile = hasSession && user === null;
  const showGateLoader = !mounted || awaitingProfile || alreadyVerified;

  useEffect(() => {
    if (!mounted || !user) return;
    if (user.nationalIdentificationNumberVerified === true) {
      router.replace(routes.overview);
    }
  }, [mounted, user, router]);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearFile = useCallback(() => {
    clearNinError();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [clearNinError]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      clearNinError();
      if (!files?.length) return;
      const file = files[0];
      if (!assertPdfFile(file)) return;
      setSelectedFile(file);
    },
    [assertPdfFile, clearNinError],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleConfirmNin = useCallback(async () => {
    if (!selectedFile) return;
    const ok = await verifyNinDocument(selectedFile);
    if (ok) {
      showSnackbar("Identity verified successfully.", "success");
      queueMicrotask(() => navigateOutAfterSuccess(router));
    }
  }, [selectedFile, verifyNinDocument, showSnackbar, router]);

  return {
    showGateLoader,
    isDragging,
    setIsDragging,
    selectedFile,
    isNinVerifying,
    ninError,
    fileInputRef,
    previewUrl,
    clearFile,
    handleFiles,
    openFilePicker,
    onDrop,
    handleConfirmNin,
  };
}
