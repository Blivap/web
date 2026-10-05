"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { $api } from "@/app/api";
import { useSnackbar } from "@/components/feedback/snackbar/snackbar.context";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "@/types/notifications";
import { getAxiosErrorMessage } from "@/lib/bookings/axiosErrorMessage";

function coalesceSettings(
  raw: Partial<NotificationSettings> | null | undefined,
): NotificationSettings {
  const next: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };
  if (!raw) return next;
  (
    Object.keys(DEFAULT_NOTIFICATION_SETTINGS) as (keyof NotificationSettings)[]
  ).forEach((key) => {
    if (typeof raw[key] === "boolean") next[key] = raw[key] as boolean;
  });
  return next;
}

export function useNotificationSettings() {
  const { showSnackbar } = useSnackbar();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const settingsRef = useRef<NotificationSettings | null>(null);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await $api.notifications.settings();
        if (cancelled) return;
        const parsed = coalesceSettings(res.data?.data);
        settingsRef.current = parsed;
        setSettings(parsed);
      } catch (error) {
        if (!cancelled) {
          showSnackbar(
            getAxiosErrorMessage(error, "Could not load notification settings"),
            "error",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showSnackbar]);

  const update = useCallback(
    (patch: Partial<NotificationSettings>) => {
      const current = settingsRef.current;
      if (!current) return;
      const next = { ...current, ...patch };
      settingsRef.current = next;
      setSettings(next);

      saveQueue.current = saveQueue.current.then(async () => {
        try {
          const res = await $api.notifications.updateSettings(patch);
          const saved = coalesceSettings(res.data?.data);
          const live = settingsRef.current;
          if (!live) return;
          const merged = { ...saved };
          (Object.keys(live) as (keyof NotificationSettings)[]).forEach(
            (key) => {
              if (live[key] !== saved[key]) merged[key] = live[key];
            },
          );
          settingsRef.current = merged;
          setSettings(merged);
        } catch (error) {
          const live = settingsRef.current;
          if (live) {
            const reverted = { ...live };
            (Object.keys(patch) as (keyof NotificationSettings)[]).forEach(
              (key) => {
                if (reverted[key] === patch[key]) reverted[key] = current[key];
              },
            );
            settingsRef.current = reverted;
            setSettings(reverted);
          }
          showSnackbar(
            getAxiosErrorMessage(error, "Could not save notification settings"),
            "error",
          );
        }
      });
    },
    [showSnackbar],
  );

  return { settings, loading, update };
}
