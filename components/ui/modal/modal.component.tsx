"use client";

import classNames from "classnames";
import gsap from "gsap";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
};

export function Modal({
  open,
  onClose,
  children,
  className,
  closeOnBackdropClick = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);

  useLayoutEffect(() => {
    const el = dialogRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!el || !panel || !backdrop) return;

    gsap.killTweensOf([panel, backdrop]);

    if (open) {
      if (!el.open) el.showModal();
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      );
      gsap.fromTo(
        panel,
        { opacity: 0, y: 28, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "power3.out",
          delay: 0.04,
        },
      );
    } else if (el.open) {
      const tl = gsap.timeline({
        onComplete: () => {
          el.close();
        },
      });
      tl.to(
        panel,
        {
          opacity: 0,
          y: 16,
          scale: 0.96,
          duration: 0.22,
          ease: "power2.in",
        },
        0,
      );
      tl.to(backdrop, { opacity: 0, duration: 0.22, ease: "power2.in" }, 0);
    }

    return () => {
      gsap.killTweensOf([panel, backdrop]);
    };
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    return () => {
      if (panel) gsap.killTweensOf(panel);
      if (backdrop) gsap.killTweensOf(backdrop);
      if (el?.open) el.close();
    };
  }, []);

  const handleBackdropClick = useCallback(() => {
    if (!closeOnBackdropClick) return;
    onClose();
  }, [closeOnBackdropClick, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={classNames(
        "fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0",
      )}
    >
      <div
        ref={backdropRef}
        className="fixed inset-0 z-0 bg-black/40 backdrop-blur-[1px]"
        onClick={handleBackdropClick}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center p-4 w-full ">
        <div
          ref={panelRef}
          className={classNames(
            "pointer-events-auto flex w-full flex-col items-center rounded-xl border border-border bg-white px-8 py-10 shadow-[0_24px_48px_-12px_rgba(150,0,24,0.15)] dark:border-white/10 dark:bg-[#1a1a22]",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </dialog>
  );
}
