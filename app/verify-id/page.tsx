"use client";

import { Layout } from "@/layout/layout.component";
import { Button } from "@/components/button/button.component";
import { Modal } from "@/components/ui/modal/modal.component";
import { Radio } from "@/components/forms/Radio";
import classNames from "classnames";
import { Check, FileText, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VerifyIdPage() {
  const [email, setEmail] = useState("");
  const [residency, setResidency] = useState<"nigeria" | "abroad">("nigeria");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [verifySuccessOpen, setVerifySuccessOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const donorId = searchParams.get("donorId") ?? undefined;

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!selectedFile || selectedFile.type !== "text/plain") {
      return;
    }
    const file = selectedFile;
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (!cancelled) setTextPreview(null);
    });
    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled) return;
      const t = String(reader.result ?? "");
      setTextPreview(t.length > 4000 ? `${t.slice(0, 4000)}…` : t);
    };
    reader.readAsText(file);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      reader.onload = null;
    };
  }, [selectedFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    setSelectedFile(files[0]);
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const isPdf =
    selectedFile?.type === "application/pdf" ||
    selectedFile?.name.toLowerCase().endsWith(".pdf");

  return (
    <Layout>
      <div className="max-w-[720px] mx-auto md:mx-0 px-1 sm:px-0 pb-10">
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Verify Identity
          </h1>
          <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-text-primary font-normal max-w-[640px]">
            You meet the most important medical requirements. Fantastic! Enter
            your personal information and schedule your first appointment, you
            won&apos;t donate yet, but we test your blood. This way, we&apos;ll
            be sure it&apos;s safe to donate. We&apos;ll also ask additional
            questions. it&apos;s possible that, based on these, you may
            unfortunately not be suitable as a donor? Contact us at 234 3683 839
            2422
          </p>
        </header>

        <section className="mb-8 md:mb-10">
          <h2 className="text-base font-bold text-text-primary">
            Enter your personal details
          </h2>
          <p className="mt-2 text-sm text-text-primary">
            Enter your personal details as stated on your NIN Card
          </p>
        </section>

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
            accept=".pdf,.doc,.docx,.txt,.rtf"
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {!selectedFile ? (
            <button
              type="button"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={openFilePicker}
              className={classNames(
                "w-full cursor-pointer rounded-lg border border-transparent bg-[#FFEBEE] px-6 py-12 text-center transition-colors dark:bg-primary/15",
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
                <p className="text-xs text-[#757575]">
                  File types: pdf, doc, docx, txt, rtf
                </p>
              </div>
            </button>
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
              <div className="overflow-hidden rounded-md border border-[#E8C4C8] bg-white dark:border-white/15 dark:bg-[#1a1a22]">
                {isPdf && previewUrl ? (
                  <iframe
                    title="Document preview"
                    src={previewUrl}
                    className="max-h-[320px] min-h-[220px] w-full border-0 bg-[#fafafa] dark:bg-[#0f0f12]"
                  />
                ) : selectedFile.type === "text/plain" ? (
                  textPreview != null ? (
                    <pre className="max-h-[220px] overflow-auto p-4 text-xs text-text-primary whitespace-pre-wrap wrap-break-word font-mono">
                      {textPreview}
                    </pre>
                  ) : (
                    <p className="p-6 text-sm text-[#757575]">
                      Loading preview…
                    </p>
                  )
                ) : (
                  <div className="flex items-center gap-4 p-6">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#5C5C5C] dark:bg-white/10 dark:text-white/55">
                      <FileText className="size-8" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-[#757575] mt-0.5">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
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
        </div>

        <section className="mb-10 rounded-lg bg-[#FCE4EC] px-5 py-6 dark:bg-primary/15">
          <h2 className="text-base font-bold text-text-primary">
            Email address
          </h2>
          <p className="mt-2 text-sm text-text-primary leading-relaxed mb-4">
            A valid email address is required to arrange your donation
            arrangements. Please ensure you enter it correctly.
          </p>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address *"
            className="w-full rounded-md border border-[#C4C4C4] bg-white px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary/30 dark:border-white/15 dark:bg-[#14141a]"
            autoComplete="email"
          />
        </section>

        <section className="mb-10">
          <h2 className="text-base font-bold text-text-primary mb-5">
            Enter your personal details
          </h2>
          <div className="flex flex-col gap-4">
            <Radio
              name="residency"
              value="nigeria"
              checked={residency === "nigeria"}
              onChange={() => setResidency("nigeria")}
              labelClassName="text-sm text-text-primary font-normal"
            >
              I live in Nigeria
            </Radio>
            <Radio
              name="residency"
              value="abroad"
              checked={residency === "abroad"}
              onChange={() => setResidency("abroad")}
              labelClassName="text-sm text-text-primary font-normal"
            >
              I live abroad
            </Radio>
          </div>
        </section>

        <Button
          type="button"
          variant="primary"
          className="rounded-none! px-10 py-3.5 font-bold text-base min-w-[140px] shadow-none"
          onClick={() => setVerifySuccessOpen(true)}
        >
          Confirm
        </Button>
      </div>

      <Modal
        open={verifySuccessOpen}
        onClose={() => setVerifySuccessOpen(false)}
      >
        <h2 className="mb-3 text-center text-2xl font-bold text-primary">
          Congratulations
        </h2>
        <p className="mb-8 text-center text-sm leading-snug text-gray-500">
          You Have Successfully
          <br />
          Been Verified
        </p>
        <div
          className="mb-10 flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-green-500 text-green-500"
          aria-hidden
        >
          <Check
            className="size-12 stroke-3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          className="rounded-sm! min-w-[160px] px-10 py-3.5 font-bold text-base shadow-none"
          onClick={() => {
            setVerifySuccessOpen(false);
            router.push(
              donorId ? routes.scheduleAppointment(donorId) : routes.overview,
            );
          }}
        >
          Continue
        </Button>
      </Modal>
    </Layout>
  );
}
