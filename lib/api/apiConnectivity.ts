type Listener = (unreachable: boolean) => void;

let unreachable = false;
const listeners = new Set<Listener>();

export function getApiUnreachable(): boolean {
  return unreachable;
}

export function subscribeApiConnectivity(listener: Listener): () => void {
  listeners.add(listener);
  listener(unreachable);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) {
    listener(unreachable);
  }
}

export function reportApiReachable(): void {
  if (!unreachable) return;
  unreachable = false;
  emit();
}

export function reportApiUnreachable(): void {
  if (unreachable) return;
  unreachable = true;
  emit();
}

/** Probe the API origin with a cheap request (used by Retry). */
export async function probeApiReachability(
  apiBaseUrl: string,
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      mode: "cors",
    });
    window.clearTimeout(timer);
    // Any HTTP response means the host is up (401/404 still = reachable).
    void res;
    reportApiReachable();
    return true;
  } catch {
    reportApiUnreachable();
    return false;
  }
}
