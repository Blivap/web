/**
 * Format kobo amounts for NGN display.
 * Backend stores money in kobo (1 NGN = 100 kobo).
 */
export function formatKoboAsNaira(
  kobo: number,
  options?: { currency?: string; signed?: boolean },
): string {
  const currency = options?.currency ?? "NGN";
  const naira = (Number.isFinite(kobo) ? kobo : 0) / 100;
  const abs = Math.abs(naira);
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency === "NGN" ? "NGN" : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(abs);

  if (!options?.signed) return formatted;
  if (naira > 0) return `+${formatted}`;
  if (naira < 0) return `-${formatted}`;
  return formatted;
}

export function formatWalletEntryWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
