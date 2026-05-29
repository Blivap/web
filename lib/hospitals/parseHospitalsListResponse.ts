export type HospitalListItem = {
  id: string;
  name: string;
  address: string;
  distance?: string;
};

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function coerceArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data;
  if (Array.isArray(o.hospitals)) return o.hospitals;
  if (Array.isArray(o.items)) return o.items;
  const nested = o.data;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (Array.isArray(n.items)) return n.items;
    if (Array.isArray(n.data)) return n.data;
  }
  return [];
}

function parseOne(raw: unknown): HospitalListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pickString(r.id ?? r._id);
  const name = pickString(r.name ?? r.title);
  if (!id || !name) return null;

  const composed = [
    pickString(r.street),
    pickString(r.city),
    pickString(r.state),
  ]
    .filter(Boolean)
    .join(", ");
  const address = pickString(r.address) ?? (composed || "—");

  const distance = pickString(r.distance ?? r.distanceLabel);

  return {
    id,
    name,
    address,
    ...(distance ? { distance } : {}),
  };
}

export function parseHospitalsListResponse(body: unknown): HospitalListItem[] {
  const items = coerceArray(body);
  const out: HospitalListItem[] = [];
  for (const item of items) {
    const h = parseOne(item);
    if (h) out.push(h);
  }
  return out;
}
