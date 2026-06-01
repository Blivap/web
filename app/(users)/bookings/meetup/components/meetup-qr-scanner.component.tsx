"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { cn } from "@/lib/utils";

type MeetupQrScannerProps = {
  disabled?: boolean;
  busy?: boolean;
  /** Start the camera as soon as the scanner mounts. */
  autoStart?: boolean;
  onScan: (decodedText: string) => void | Promise<void>;
  className?: string;
};

export function MeetupQrScanner({
  disabled,
  busy,
  autoStart = false,
  onScan,
  className,
}: MeetupQrScannerProps) {
  const regionId = useId().replace(/:/g, "");
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const stopScanner = useCallback(async () => {
    const instance = scannerRef.current;
    scannerRef.current = null;
    handledRef.current = false;
    if (!instance) {
      setActive(false);
      return;
    }
    try {
      if (instance.isScanning) {
        await instance.stop();
      }
      instance.clear();
    } catch {
      /* ignore teardown errors */
    }
    setActive(false);
  }, []);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    if (!autoStart || disabled || busy) return;
    void startScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when opened
  }, [autoStart]);

  const startScanner = useCallback(async () => {
    if (disabled || busy || starting || active) return;
    setError(null);
    setStarting(true);
    handledRef.current = false;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      await stopScanner();
      const instance = new Html5Qrcode(regionId);
      scannerRef.current = instance;

      await instance.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (handledRef.current) return;
          handledRef.current = true;
          void (async () => {
            await stopScanner();
            await onScan(decodedText);
          })();
        },
        () => {
          /* no match this frame */
        },
      );
      setActive(true);
    } catch (e) {
      await stopScanner();
      const message =
        e instanceof Error
          ? e.message
          : "Could not open the camera. Allow camera access and try again.";
      setError(message);
    } finally {
      setStarting(false);
    }
  }, [active, busy, disabled, onScan, regionId, starting, stopScanner]);

  const controlsDisabled = disabled || busy || starting;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {active ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={controlsDisabled}
            onClick={() => void stopScanner()}
            className="gap-2"
          >
            <CameraOff className="size-4" aria-hidden />
            Stop scanner
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={controlsDisabled}
            onClick={() => void startScanner()}
            className="gap-2"
          >
            <Camera className="size-4" aria-hidden />
            {starting ? "Starting camera…" : "Open scanner"}
          </Button>
        )}
      </div>

      <div
        id={regionId}
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-black/90 dark:border-white/10",
          active ? "min-h-[260px]" : "hidden",
        )}
        aria-hidden={!active}
      />

      {!active && !error ? (
        <p className="text-xs text-text-secondary">
          Point your camera at the other person&apos;s meetup QR.
        </p>
      ) : null}

      {error ? (
        <p className="text-xs text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
