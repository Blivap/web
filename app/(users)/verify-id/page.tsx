"use client";

import { AuthLoader } from "@/components/auth/auth-loader.component";
import { Layout } from "@/layout/layout.component";
import { Button } from "@/components/button/button.component";
import classNames from "classnames";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { routes } from "@/config/routes";
import {
  formatFileSize,
  useVerifyIdPage,
} from "@/hooks/verify-id/useVerifyIdPage.hook";
import { useRouter } from "next/navigation";

function IdCardGood() {
  return (
    <Image
      src="id.svg"
      alt="ID Card Good"
      className="rounded-t-[10px]"
      width={200}
      height={120}
    />
  );
}

function IdCardBad() {
  return (
    <div className=" filter blur-[1.2px] overflow-hidden ">
      <Image
        src="id.svg"
        alt="ID Card Good"
        className="rounded-t-[10px] -rotate-10"
        width={200}
        height={120}
      />
    </div>
  );
}

const doItems = [
  "Photo is clear and sharp",
  "Detail can be read clearly",
  "High or good photo quality",
  "All 4 corners of the document are visible",
];

const dontItems = [
  "Photo is blurry and not focused",
  "Detail cannot be read clearly",
  "Poor photo quality (too dark or bright)",
  "Not all corners are visible",
];

function VerifyIdVerifiedState() {
  return (
    <div className="flex flex-col items-center gap-6  bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#1a1a22] sm:px-10 sm:py-16">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCheck className="size-8" aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-text-primary">
          Identity verified
        </h2>
        <p className="text-sm text-text-secondary">Your NIN is on file.</p>
      </div>
      <Link
        href={routes.donors}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        Donors
      </Link>
    </div>
  );
}

function VerifyIdContent() {
  const {
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
  } = useVerifyIdPage();
  const router = useRouter();
  if (showGateLoader) {
    return (
      <Layout>
        <AuthLoader />
      </Layout>
    );
  }

  if (isVerified) {
    return (
      <Layout>
        <div
          onClick={() => router.back()}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="size-4 text-primary" aria-hidden />
          <p className="text-primary">Back</p>
        </div>
        <div className="flex justify-center items-center w-full h-full">
          <VerifyIdVerifiedState />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[720px] mx-auto md:mx-0 px-1 sm:px-0 pb-10">
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Verify Identity
          </h1>
        </header>

        <section className="mb-6 md:mb-8">
          <h2 className="text-base font-bold text-text-primary">
            Upload your NIN
          </h2>
          <p className="mt-2 text-sm text-text-primary">
            Uploading your NIN will help us with your verification.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 mb-10">
          <div>
            <p className="text-base font-semibold text-[#008000] mb-4">Do</p>
            <div className="flex justify-center sm:justify-start mb-5">
              <IdCardGood />
            </div>
            <ul className="space-y-2.5 text-sm text-text-primary list-disc pl-5 marker:text-text-primary">
              {doItems.map((item) => (
                <li key={item} className="leading-snug pl-0.5">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-base font-semibold text-primary mb-4">
              Don&apos;t
            </p>
            <div className="flex justify-center sm:justify-start mb-5">
              <IdCardBad />
            </div>
            <ul className="space-y-2.5 text-sm text-text-primary list-disc pl-5 marker:text-text-primary">
              {dontItems.map((item) => (
                <li key={item} className="leading-snug pl-0.5">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-10">
          <p className="text-xs text-text-primary mb-2 font-medium">
            Upload Your Receipt
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {!selectedFile ? (
            <Button
              type="button"
              variant="outline"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={openFilePicker}
              className={classNames(
                "h-auto w-full cursor-pointer rounded-lg border-transparent bg-[#FFEBEE] px-6 py-12 text-center transition-colors hover:bg-[#FFEBEE] dark:bg-primary/15 dark:hover:bg-primary/15",
                isDragging &&
                  "bg-[#FFE0E5] ring-2 ring-primary/40 dark:bg-primary/25",
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="text-[#5C5C5C]"
                  aria-hidden
                >
                  <path
                    d="M14 8h14l8 8v22a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    fill="none"
                  />
                  <path
                    d="M28 8v8h8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    fill="none"
                  />
                  <path
                    d="M24 28v8M20 32l4-4 4 4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm text-text-primary">
                  Drag & Drop or{" "}
                  <span className="text-primary font-semibold underline underline-offset-2">
                    Upload
                  </span>{" "}
                  your NIN
                </p>
                <p className="text-xs text-[#757575]">PDF only</p>
              </div>
            </Button>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={classNames(
                "w-full rounded-lg border border-transparent bg-[#FFEBEE] px-5 py-5 transition-colors dark:bg-primary/15",
                isDragging &&
                  "bg-[#FFE0E5] ring-2 ring-primary/40 dark:bg-primary/25",
              )}
            >
              <p className="text-xs text-[#757575] mb-3">
                Drop another file here to replace, or use the actions below.
              </p>
              <p className="text-xs text-text-primary mb-2 truncate font-medium">
                {selectedFile.name}{" "}
                <span className="font-normal text-[#757575]">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </p>
              <div className="overflow-hidden relative max-h-[400px] min-h-[220px] rounded-md border border-[#E8C4C8] bg-white dark:border-white/15 dark:bg-[#1a1a22]">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Document preview"
                    fill
                    unoptimized
                    className="object-fill"
                  />
                ) : (
                  <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-[#fafafa] text-xs text-[#757575] dark:bg-[#0f0f12]">
                    Generating preview…
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="py-2.5 px-5 text-sm font-medium"
                  onClick={openFilePicker}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="py-2.5 px-5 text-sm font-medium gap-2 border-red-200 text-red-700 enabled:hover:bg-red-50 enabled:hover:border-red-300"
                  onClick={clearFile}
                >
                  <Trash2 className="size-4 shrink-0" aria-hidden />
                  Remove
                </Button>
              </div>
            </div>
          )}
          {ninError ? (
            <p
              className="mt-3 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {ninError}
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="primary"
          className="rounded-none! px-10 py-3.5 font-bold text-base min-w-[140px] shadow-none"
          disabled={!selectedFile}
          loading={isNinVerifying}
          onClick={() => void handleConfirmNin()}
        >
          {isNinVerifying ? "Verifying…" : "Confirm"}
        </Button>
      </div>
    </Layout>
  );
}

export default function VerifyIdPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="max-w-[720px] mx-auto md:mx-0 px-1 sm:px-0 pb-10 animate-pulse">
            <div className="h-8 w-48 rounded bg-[#E5E7EB] dark:bg-white/10 mb-4" />
            <div className="h-20 max-w-[640px] rounded bg-[#E5E7EB] dark:bg-white/10 mb-8" />
            <div className="h-64 rounded-lg bg-[#E5E7EB] dark:bg-white/10" />
          </div>
        </Layout>
      }
    >
      <VerifyIdContent />
    </Suspense>
  );
}
