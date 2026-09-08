"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { cn } from "@/lib/utils";

type MeetupQrScannerProps = {
  disabled?: boolean;
  busy?: boolean;
  /** Start the camera as soon as the scanner mounts. */
  autoStart?: boolean;
  onScan: (decodedText: string) => void | Promise<void>;
  onStop?: () => void;
  className?: string;
};

export function MeetupQrScanner({
  disabled,
  busy,
  autoStart = false,
  onScan,
  onStop,
  className,
}: MeetupQrScannerProps) {
  const regionId = useId().replace(/:/g, "");
  const regionRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const startInFlightRef = useRef(false);
  const onStopRef = useRef(onStop);
  const onScanRef = useRef(onScan);
  onStopRef.current = onStop;
  onScanRef.current = onScan;
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const showRegion = autoStart || active || starting;

  const stopLocalTracks = useCallback(() => {
    const root = document.getElementById(regionId);
    if (!root) return;
    const video = root.querySelector("video");
    if (!video) return;
    const stream = video.srcObject;
    if (!(stream instanceof MediaStream)) return;
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        /* ignore */
      }
    });
    video.srcObject = null;
  }, [regionId]);

  const stopScanner = useCallback(
    async (opts?: { notifyParent?: boolean }) => {
      const notifyParent = opts?.notifyParent === true;
      const instance = scannerRef.current;
      scannerRef.current = null;
      handledRef.current = false;
      setStarting(false);

      if (instance) {
        try {
          if (instance.isScanning) {
            await instance.stop();
          }
        } catch {
          /* ignore stop errors */
        }
        try {
          await instance.clear();
        } catch {
          /* ignore clear errors */
        }
      }

      stopLocalTracks();
      setActive(false);
      if (notifyParent) {
        onStopRef.current?.();
      }
    },
    [stopLocalTracks],
  );

  const stopScannerRef = useRef(stopScanner);
  stopScannerRef.current = stopScanner;

  useEffect(() => {
    return () => {
      void stopScannerRef.current({ notifyParent: false });
    };
  }, []);

  useLayoutEffect(() => {
    if (!autoStart || disabled || busy) return;
    void startScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when scanner opens
  }, [autoStart]);

  useEffect(() => {
    if (!active) return;
    const root = document.getElementById(regionId);
    if (!root) return;
    const video = root.querySelector("video");
    if (!video) return;
    video.setAttribute("playsinline", "true");
    video.muted = true;
  }, [active, regionId]);

  const startScanner = useCallback(async () => {
    if (disabled || busy || startInFlightRef.current) return;
    if (scannerRef.current?.isScanning) return;

    startInFlightRef.current = true;
    setError(null);
    setStarting(true);
    handledRef.current = false;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (scannerRef.current) {
        await stopScannerRef.current({ notifyParent: false });
      }

      const regionEl = regionRef.current ?? document.getElementById(regionId);
      if (!regionEl) {
        throw new Error("Scanner region is not mounted yet.");
      }

      const instance = new Html5Qrcode(regionId);
      scannerRef.current = instance;

      const scanConfig = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1,
      };

      const cameraCandidates: Array<
        | string
        | { facingMode: "environment" | "user" | { ideal: "environment" } }
      > = [];
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (Array.isArray(cameras) && cameras.length > 0) {
          const ordered = [...cameras].sort((a, b) => {
            const al = (a.label ?? "").toLowerCase();
            const bl = (b.label ?? "").toLowerCase();
            const as = al.includes("back") || al.includes("rear") ? 0 : 1;
            const bs = bl.includes("back") || bl.includes("rear") ? 0 : 1;
            return as - bs;
          });
          for (const cam of ordered) {
            if (cam?.id) cameraCandidates.push(cam.id);
          }
        }
      } catch {
        /* camera listing can fail before permission */
      }
      cameraCandidates.push(
        { facingMode: "environment" },
        { facingMode: { ideal: "environment" } },
        { facingMode: "user" },
      );

      let startError: unknown = null;
      let started = false;

      for (let i = 0; i < cameraCandidates.length; i++) {
        const camera = cameraCandidates[i];
        try {
          await instance.start(
            camera,
            scanConfig,
            (decodedText) => {
              if (handledRef.current) return;
              handledRef.current = true;
              void (async () => {
                await stopScannerRef.current({ notifyParent: false });
                await onScanRef.current(decodedText);
              })();
            },
            () => {
              /* no match this frame */
            },
          );
          started = true;
          break;
        } catch (candidateError) {
          startError = candidateError;
        }
      }

      if (!started) {
        throw startError ?? new Error("Could not open scanner camera.");
      }
      setActive(true);
    } catch (e) {
      await stopScannerRef.current({ notifyParent: false });
      const message =
        e instanceof Error
          ? e.message
          : "Could not open the camera. Allow camera access and try again.";
      setError(message);
    } finally {
      startInFlightRef.current = false;
      setStarting(false);
    }
  }, [busy, disabled, regionId]);

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
            onClick={() => void stopScanner({ notifyParent: true })}
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
        ref={regionRef}
        id={regionId}
        className={cn(
          "w-full overflow-hidden rounded-lg border border-border bg-black/90 dark:border-white/10",
          showRegion ? "min-h-[200px] min-w-[150px]" : "hidden",
        )}
        aria-hidden={!showRegion}
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
