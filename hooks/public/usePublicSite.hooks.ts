import { $api } from "@/app/api";
import type {
  PublicAppStores,
  PublicLanding,
} from "@/app/api/publicRepository";
import { useEffect, useState } from "react";

type LoadStatus = "loading" | "ready" | "error";

export function usePublicLanding() {
  const [landing, setLanding] = useState<PublicLanding | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    void $api.public.getLanding().then((response) => {
      if (cancelled) return;
      if (response.data) {
        setLanding(response.data);
        setStatus("ready");
        return;
      }
      setLanding(null);
      setStatus("error");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { landing, status };
}

export function usePublicApp() {
  const [stores, setStores] = useState<PublicAppStores | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    void $api.public.getApp().then((response) => {
      if (cancelled) return;
      if (response.data) {
        setStores(response.data);
        setStatus("ready");
        return;
      }
      setStores(null);
      setStatus("error");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { stores, status };
}
