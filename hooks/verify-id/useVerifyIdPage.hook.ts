"use client";

import Cookies from "js-cookie";
import { navigateOutAfterSuccess } from "@/lib/navigation/navigateOutAfterSuccess";
import { useNin } from "@/hooks/nin/useNin.hooks";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import { useAppSelector } from "@/store/hooks";
import {
  startTransition,
  useCallback,
  useEffect,
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const isVerified = user?.nationalIdentificationNumberVerified === true;

  /** Session still resolving — block the form until profile is loaded. */
  const awaitingProfile = hasSession && user === null;
  const showGateLoader = !mounted || awaitingProfile;

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const pdf = await pdfjs.getDocument({
          data: await selectedFile.arrayBuffer(),
        }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) return;

        await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (cancelled) return;

        objectUrl = canvas.toDataURL("image/png");
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) setPreviewUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

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
    isVerified,
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
