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

const LOG = "[MEETUP_QR_DEBUG][scanner]";

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
    if (!root) {
      console.info(LOG, "stopLocalTracks: no root", { regionId });
      return;
    }
    const video = root.querySelector("video");
    if (!video) {
      console.info(LOG, "stopLocalTracks: no video element", { regionId });
      return;
    }
    const stream = video.srcObject;
    if (!(stream instanceof MediaStream)) {
      console.info(LOG, "stopLocalTracks: no srcObject on video");
      return;
    }
    const tracks = stream.getTracks();
    console.info(LOG, "stopLocalTracks: stopping tracks", {
      count: tracks.length,
      states: tracks.map((t) => `${t.kind}:${t.readyState}`),
    });
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
      console.info(LOG, "stopScanner called", {
        notifyParent,
        hadInstance: Boolean(scannerRef.current),
        wasScanning: scannerRef.current?.isScanning ?? false,
      });
      const instance = scannerRef.current;
      scannerRef.current = null;
      handledRef.current = false;
      setStarting(false);

      if (instance) {
        try {
          if (instance.isScanning) {
            await instance.stop();
            console.info(LOG, "stopScanner: instance.stop() ok");
          } else {
            console.info(LOG, "stopScanner: instance not scanning");
          }
        } catch (e) {
          console.warn(LOG, "stopScanner: instance.stop() failed", e);
        }
        try {
          await instance.clear();
          console.info(LOG, "stopScanner: instance.clear() ok");
        } catch (e) {
          console.warn(LOG, "stopScanner: instance.clear() failed", e);
        }
      } else {
        console.info(LOG, "stopScanner: no instance to stop");
      }

      stopLocalTracks();
      setActive(false);
      if (notifyParent) {
        console.info(LOG, "stopScanner: calling onStop (parent -> QR view)");
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
    console.info(LOG, "mount", {
      autoStart,
      disabled,
      busy,
      regionId,
      hasRegionEl: Boolean(regionRef.current),
    });
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
    if (disabled || busy || startInFlightRef.current) {
      console.info(LOG, "startScanner skipped", {
        disabled,
        busy,
        inFlight: startInFlightRef.current,
      });
      return;
    }
    if (scannerRef.current?.isScanning) {
      console.info(LOG, "startScanner skipped: already scanning");
      return;
    }
    console.info(LOG, "startScanner begin", { regionId });
    startInFlightRef.current = true;
    setError(null);
    setStarting(true);
    handledRef.current = false;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      console.info(LOG, "html5-qrcode module loaded");
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
        console.info(LOG, "getCameras", {
          count: cameras?.length ?? 0,
          labels: cameras?.map((c) => c.label) ?? [],
        });
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
      console.info(LOG, "camera candidates", {
        count: cameraCandidates.length,
        ids: cameraCandidates.filter((c) => typeof c === "string").slice(0, 3),
      });

      for (let i = 0; i < cameraCandidates.length; i++) {
        const camera = cameraCandidates[i];
        const label =
          typeof camera === "string" ? camera : JSON.stringify(camera);
        console.info(LOG, "trying camera", { index: i, label });
        try {
          await instance.start(
            camera,
            scanConfig,
            (decodedText) => {
              if (handledRef.current) return;
              handledRef.current = true;
              console.info(LOG, "QR decoded", {
                preview: decodedText.slice(0, 80),
              });
              void (async () => {
                await stopScannerRef.current({ notifyParent: false });
                await onScanRef.current(decodedText);
              })();
            },
            () => {
              /* no match this frame */
            },
          );
          console.info(LOG, "instance.start success", { label });
          started = true;
          break;
        } catch (candidateError) {
          const errMsg =
            candidateError instanceof Error
              ? candidateError.message
              : String(candidateError);
          console.warn(LOG, "instance.start failed", {
            index: i,
            label,
            err: errMsg,
            name:
              candidateError instanceof Error ? candidateError.name : undefined,
          });
          startError = candidateError;
        }
      }

      if (!started) {
        const errMsg =
          startError instanceof Error ? startError.message : String(startError);
        console.error(LOG, "all camera candidates failed", { err: errMsg });
        throw startError ?? new Error("Could not open scanner camera.");
      }
      console.info(LOG, "startScanner success", { active: true });
      setActive(true);
    } catch (e) {
      console.error(LOG, "startScanner threw", e);
      await stopScannerRef.current({ notifyParent: false });
      const message =
        e instanceof Error
          ? e.message
          : "Could not open the camera. Allow camera access and try again.";
      setError(message);
    } finally {
      startInFlightRef.current = false;
      setStarting(false);
      console.info(LOG, "startScanner end");
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
            onClick={() => {
              console.info(LOG, "Stop button clicked");
              void stopScanner({ notifyParent: true });
            }}
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
            onClick={() => {
              console.info(LOG, "Open scanner button clicked");
              void startScanner();
            }}
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
