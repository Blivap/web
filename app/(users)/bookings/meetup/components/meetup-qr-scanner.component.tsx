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
  /** Fill the parent square. The parent owns the open and close control. */
  regionOnly?: boolean;
  onScan: (decodedText: string) => void | Promise<void>;
  onStop?: () => void;
  className?: string;
};

function ScannerViewfinder() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden
    >
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-[14%] overflow-hidden rounded-md shadow-[0_0_0_999px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-[12%] top-[18%] h-px animate-pulse bg-primary/90 motion-reduce:animate-none" />
        <span className="absolute top-0 left-0 size-5 border-t-2 border-l-2 border-white" />
        <span className="absolute top-0 right-0 size-5 border-t-2 border-r-2 border-white" />
        <span className="absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-white" />
        <span className="absolute right-0 bottom-0 size-5 border-r-2 border-b-2 border-white" />
      </div>
      <p className="absolute inset-x-2 bottom-2 rounded-md bg-black/70 px-2 py-1 text-center text-[10px] font-medium text-white/90">
        Align the QR inside the frame
      </p>
    </div>
  );
}

async function preferContinuousFocus(
  instance: import("html5-qrcode").Html5Qrcode,
) {
  const attempts: MediaTrackConstraints[] = [
    { advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet] },
    { focusMode: "continuous" } as MediaTrackConstraints,
  ];
  for (const constraints of attempts) {
    try {
      await instance.applyVideoConstraints(constraints);
      return;
    } catch {
      /* device may not support continuous focus */
    }
  }
}

export function MeetupQrScanner({
  disabled,
  busy,
  autoStart = false,
  regionOnly = false,
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
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );
      if (scannerRef.current) {
        await stopScannerRef.current({ notifyParent: false });
      }

      const regionEl = regionRef.current ?? document.getElementById(regionId);
      if (!regionEl) {
        throw new Error("Scanner region is not mounted yet.");
      }

      const instance = new Html5Qrcode(regionId, {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      });
      scannerRef.current = instance;

      const regionWidth = regionEl.clientWidth || 176;
      const scanSide = Math.max(
        120,
        Math.min(280, Math.floor(regionWidth * 0.78)),
      );
      const scanConfig = {
        fps: 20,
        qrbox: { width: scanSide, height: scanSide },
        aspectRatio: 1,
        disableFlip: false,
        videoConstraints: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        } satisfies MediaTrackConstraints,
      };

      const cameraCandidates: Array<string | MediaTrackConstraints> = [];
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
        { facingMode: { ideal: "environment" } },
        { facingMode: "environment" },
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
      void preferContinuousFocus(instance);
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

  if (regionOnly) {
    return (
      <div className={cn("relative size-full min-h-0 min-w-0", className)}>
        <div
          ref={regionRef}
          id={regionId}
          className="absolute inset-0 overflow-hidden bg-black [&_img]:hidden! [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover!"
        />
        {(active || starting) && !error ? <ScannerViewfinder /> : null}
        {starting && !active ? (
          <p className="absolute inset-x-2 top-2 z-20 rounded-md bg-black/70 px-2 py-1 text-center text-[10px] text-white/90">
            Starting scanner…
          </p>
        ) : null}
        {error ? (
          <p
            className="absolute inset-x-2 bottom-2 z-20 rounded-md bg-black/80 px-2 py-1 text-center text-[11px] text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }

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
            {starting ? "Starting scanner…" : "Open scanner"}
          </Button>
        )}
      </div>

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg border border-border bg-black/90 dark:border-white/10",
          showRegion ? "min-h-50 min-w-37.5" : "hidden",
        )}
      >
        <div
          ref={regionRef}
          id={regionId}
          className="min-h-50 w-full overflow-hidden [&_img]:hidden! [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover!"
          aria-hidden={!showRegion}
        />
        {(active || starting) && !error ? <ScannerViewfinder /> : null}
      </div>

      {!active && !error ? (
        <p className="text-xs text-text-secondary">
          Hold steady and align the meetup QR inside the frame.
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
