/** Dial options for profile phone; codes sorted by label for the dropdown. */
export const PHONE_COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: "+234", label: "Nigeria (+234)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+1", label: "United States / Canada (+1)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+33", label: "France (+33)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+358", label: "Finland (+358)" },
  { code: "+353", label: "Ireland (+353)" },
  { code: "+351", label: "Portugal (+351)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+30", label: "Greece (+30)" },
  { code: "+48", label: "Poland (+48)" },
  { code: "+420", label: "Czechia (+420)" },
  { code: "+36", label: "Hungary (+36)" },
  { code: "+40", label: "Romania (+40)" },
  { code: "+7", label: "Russia / Kazakhstan (+7)" },
  { code: "+380", label: "Ukraine (+380)" },
  { code: "+971", label: "United Arab Emirates (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+254", label: "Kenya (+254)" },
  { code: "+233", label: "Ghana (+233)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+256", label: "Uganda (+256)" },
  { code: "+250", label: "Rwanda (+250)" },
  { code: "+91", label: "India (+91)" },
  { code: "+86", label: "China (+86)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+82", label: "South Korea (+82)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+52", label: "Mexico (+52)" },
  { code: "+54", label: "Argentina (+54)" },
].sort((a, b) => a.label.localeCompare(b.label));

const DIAL_CODES_LONGEST_FIRST = [
  ...new Set(PHONE_COUNTRY_OPTIONS.map((o) => o.code)),
].sort((a, b) => b.length - a.length);

const DEFAULT_DIAL_CODE = "+234";

/**
 * Split a stored E.164-style value into dial code (from our list) and national digits.
 */
export function splitStoredPhone(full: string | null | undefined): {
  code: string;
  national: string;
} {
  if (!full?.trim()) {
    return { code: DEFAULT_DIAL_CODE, national: "" };
  }
  const compact = full.trim().replace(/\s/g, "");
  if (!compact.startsWith("+")) {
    return {
      code: DEFAULT_DIAL_CODE,
      national: compact.replace(/\D/g, ""),
    };
  }
  for (const c of DIAL_CODES_LONGEST_FIRST) {
    if (compact.startsWith(c)) {
      return {
        code: c,
        national: compact.slice(c.length).replace(/\D/g, ""),
      };
    }
  }
  return {
    code: DEFAULT_DIAL_CODE,
    national: compact.replace(/^\+/, "").replace(/\D/g, ""),
  };
}

export function buildE164Phone(
  dialCode: string,
  nationalDigits: string,
): string {
  const digits = nationalDigits.replace(/\D/g, "");
  return `${dialCode}${digits}`;
}

/** Dropdown options; prepends an extra row if `full` uses a code outside the catalog. */
export function getDialOptionsForStored(
  full: string | null | undefined,
): { code: string; label: string }[] {
  const { code } = splitStoredPhone(full);
  if (PHONE_COUNTRY_OPTIONS.some((o) => o.code === code)) {
    return PHONE_COUNTRY_OPTIONS;
  }
  return [{ code, label: `${code} (current)` }, ...PHONE_COUNTRY_OPTIONS];
}
