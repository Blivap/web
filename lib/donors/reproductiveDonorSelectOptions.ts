import { DONOR_COUNTRIES, NIGERIA_STATES } from "@/lib/donors/location-options";

/** Highest education — fixed list to reduce free-text fabrication. */
export const REPRODUCTIVE_EDUCATION_OPTIONS = [
  { value: "none", label: "No formal qualification" },
  { value: "secondary", label: "Secondary school / high school" },
  { value: "vocational", label: "Vocational / technical certificate" },
  { value: "diploma", label: "Diploma / associate" },
  { value: "bachelors", label: "Bachelor’s degree" },
  { value: "masters", label: "Master’s degree" },
  { value: "doctorate", label: "Doctorate / professional degree (MD, PhD, etc.)" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

/** Sickle cell genotype and common blood groups — single closed field. */
export const SPERM_GENOTYPE_BLOOD_OPTIONS = [
  { value: "AA", label: "AA" },
  { value: "AS", label: "AS (trait)" },
  { value: "AC", label: "AC" },
  { value: "SS", label: "SS" },
  { value: "SC", label: "SC" },
  { value: "CC", label: "CC" },
  { value: "unknown_genotype", label: "Genotype unknown / not tested" },
  { value: "A+", label: "Blood: A+" },
  { value: "A-", label: "Blood: A-" },
  { value: "B+", label: "Blood: B+" },
  { value: "B-", label: "Blood: B-" },
  { value: "AB+", label: "Blood: AB+" },
  { value: "AB-", label: "Blood: AB-" },
  { value: "O+", label: "Blood: O+" },
  { value: "O-", label: "Blood: O-" },
  { value: "blood_unknown", label: "Blood group unknown" },
] as const;

export const OVARY_CYCLE_OPTIONS = [
  { value: "regular", label: "Regular (roughly monthly)" },
  { value: "irregular", label: "Irregular" },
  { value: "none_menopause", label: "No periods (menopause / surgical)" },
  { value: "hormonal_contraception", label: "Suppressed by hormonal contraception" },
  { value: "not_sure", label: "Not sure" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

export const OVARY_PREGNANCY_HISTORY_OPTIONS = [
  { value: "none", label: "No prior pregnancy" },
  { value: "one_full_term", label: "One prior full-term pregnancy" },
  { value: "multiple_full_term", label: "Multiple prior full-term pregnancies" },
  { value: "miscarriage", label: "Prior miscarriage / loss" },
  { value: "termination", label: "Prior termination" },
  { value: "current_pregnant", label: "Currently pregnant" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

export const YES_NO_NOT_SURE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not sure", label: "Not sure" },
] as const;

export const SPERM_MOTIVATION_OPTIONS = [
  { value: "altruism", label: "Help others / altruism" },
  { value: "compensation", label: "Financial compensation" },
  { value: "family_friend", label: "Referred by family or friend" },
  { value: "research", label: "Interest in research / genetics" },
  { value: "legacy", label: "Personal legacy / meaning" },
  { value: "other_coordinator", label: "Other — I will discuss with coordinator" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

export const OVARY_MOTIVATION_OPTIONS = [
  { value: "altruism", label: "Help another family / altruism" },
  { value: "compensation", label: "Financial compensation" },
  { value: "family_friend", label: "Referred by family or friend" },
  { value: "known_recipient", label: "Known recipient (directed donation)" },
  { value: "other_coordinator", label: "Other — I will discuss with coordinator" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

/** Nigerian state → capital (administrative seat). */
const NG_STATE_CAPITAL: Record<string, string> = {
  Abia: "Umuahia",
  Adamawa: "Yola",
  "Akwa Ibom": "Uyo",
  Anambra: "Awka",
  Bauchi: "Bauchi",
  Bayelsa: "Yenagoa",
  Benue: "Makurdi",
  Borno: "Maiduguri",
  "Cross River": "Calabar",
  Delta: "Asaba",
  Ebonyi: "Abakaliki",
  Edo: "Benin City",
  Ekiti: "Ado Ekiti",
  Enugu: "Enugu",
  FCT: "Abuja",
  Gombe: "Gombe",
  Imo: "Owerri",
  Jigawa: "Dutse",
  Kaduna: "Kaduna",
  Kano: "Kano",
  Katsina: "Katsina",
  Kebbi: "Birnin Kebbi",
  Kogi: "Lokoja",
  Kwara: "Ilorin",
  Lagos: "Ikeja",
  Nasarawa: "Lafia",
  Niger: "Minna",
  Ogun: "Abeokuta",
  Ondo: "Akure",
  Osun: "Osogbo",
  Oyo: "Ibadan",
  Plateau: "Jos",
  Rivers: "Port Harcourt",
  Sokoto: "Sokoto",
  Taraba: "Jalingo",
  Yobe: "Damaturu",
  Zamfara: "Gusau",
};

const NG_EXTRA_CITIES: { state: string; city: string }[] = [
  { state: "Lagos", city: "Lagos Island" },
  { state: "Lagos", city: "Surulere" },
  { state: "Lagos", city: "Eti-Osa" },
  { state: "Lagos", city: "Alimosho" },
  { state: "Rivers", city: "Obio-Akpor" },
  { state: "Rivers", city: "Bonny" },
  { state: "Kano", city: "Nasarawa (Kano)" },
  { state: "Oyo", city: "Ogbomoso" },
  { state: "Kaduna", city: "Zaria" },
  { state: "Delta", city: "Warri" },
  { state: "Edo", city: "Ekpoma" },
  { state: "Enugu", city: "Nsukka" },
];

export type CitySelectRow = { value: string; label: string };

/** value format `State::City` for Nigeria so state and city stay consistent. */
export function nigeriaCitySelectOptions(): CitySelectRow[] {
  const seen = new Set<string>();
  const rows: CitySelectRow[] = [];
  for (const state of NIGERIA_STATES) {
    const cap = NG_STATE_CAPITAL[state] ?? state;
    const key = `${state}::${cap}`;
    if (!seen.has(key)) {
      seen.add(key);
      rows.push({ value: key, label: `${cap}, ${state}` });
    }
  }
  for (const { state, city } of NG_EXTRA_CITIES) {
    const key = `${state}::${city}`;
    if (!seen.has(key)) {
      seen.add(key);
      rows.push({ value: key, label: `${city}, ${state}` });
    }
  }
  rows.sort((a, b) => a.label.localeCompare(b.label));
  return rows;
}

export function nigeriaCityRowsForState(state: string): CitySelectRow[] {
  if (!state) return [];
  const prefix = `${state}::`;
  return nigeriaCitySelectOptions().filter((r) => r.value.startsWith(prefix));
}

export function parseNigeriaCityValue(
  combined: string,
): { state: string; city: string } | null {
  const i = combined.indexOf("::");
  if (i <= 0) return null;
  return {
    state: combined.slice(0, i),
    city: combined.slice(i + 2),
  };
}

export function getNonNgStateRows(
  country: string,
): readonly { value: string; label: string }[] {
  return NON_NG_STATE_OPTIONS[country] ?? NON_NG_STATE_OPTIONS.OTHER;
}

export function getNonNgCityRows(
  country: string,
  state: string,
): readonly { value: string; label: string }[] {
  const byCountry = NON_NG_CITY_OPTIONS[country];
  if (!byCountry) return NON_NG_CITY_OPTIONS.OTHER["Other region"];
  const row = byCountry[state];
  return row ?? NON_NG_CITY_OPTIONS.OTHER["Other region"];
}

/** Regions / areas for non-Nigeria countries (closed lists). */
export const NON_NG_STATE_OPTIONS: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  GH: [
    { value: "Greater Accra", label: "Greater Accra" },
    { value: "Ashanti", label: "Ashanti" },
    { value: "Western", label: "Western" },
    { value: "Eastern", label: "Eastern" },
    { value: "Northern", label: "Northern" },
    { value: "Other GH", label: "Other (Ghana)" },
  ],
  KE: [
    { value: "Nairobi", label: "Nairobi" },
    { value: "Mombasa", label: "Mombasa" },
    { value: "Kisumu", label: "Kisumu" },
    { value: "Nakuru", label: "Nakuru" },
    { value: "Other KE", label: "Other (Kenya)" },
  ],
  ZA: [
    { value: "Gauteng", label: "Gauteng" },
    { value: "Western Cape", label: "Western Cape" },
    { value: "KwaZulu-Natal", label: "KwaZulu-Natal" },
    { value: "Eastern Cape", label: "Eastern Cape" },
    { value: "Other ZA", label: "Other (South Africa)" },
  ],
  GB: [
    { value: "England", label: "England" },
    { value: "Scotland", label: "Scotland" },
    { value: "Wales", label: "Wales" },
    { value: "Northern Ireland", label: "Northern Ireland" },
  ],
  US: [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "DC", label: "District of Columbia" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
  ],
  OTHER: [{ value: "Other region", label: "Region to be confirmed with coordinator" }],
};

/** City / area choices keyed by country then state value (coarse lists). */
export const NON_NG_CITY_OPTIONS: Record<
  string,
  Record<string, readonly { value: string; label: string }[]>
> = {
  GH: {
    "Greater Accra": [
      { value: "Accra", label: "Accra" },
      { value: "Tema", label: "Tema" },
      { value: "Other Greater Accra", label: "Other (Greater Accra)" },
    ],
    Ashanti: [
      { value: "Kumasi", label: "Kumasi" },
      { value: "Other Ashanti", label: "Other (Ashanti)" },
    ],
    Western: [{ value: "Takoradi", label: "Sekondi-Takoradi" }, { value: "Other Western", label: "Other (Western)" }],
    Eastern: [{ value: "Koforidua", label: "Koforidua" }, { value: "Other Eastern", label: "Other (Eastern)" }],
    Northern: [{ value: "Tamale", label: "Tamale" }, { value: "Other Northern", label: "Other (Northern)" }],
    "Other GH": [{ value: "Other Ghana city", label: "Other (coordinator follow-up)" }],
  },
  KE: {
    Nairobi: [
      { value: "Nairobi CBD", label: "Nairobi CBD" },
      { value: "Westlands", label: "Westlands" },
      { value: "Other Nairobi", label: "Other (Nairobi)" },
    ],
    Mombasa: [{ value: "Mombasa Island", label: "Mombasa Island" }, { value: "Other Mombasa", label: "Other (Mombasa)" }],
    Kisumu: [{ value: "Kisumu central", label: "Kisumu central" }, { value: "Other Kisumu", label: "Other (Kisumu)" }],
    Nakuru: [{ value: "Nakuru town", label: "Nakuru town" }, { value: "Other Nakuru", label: "Other (Nakuru)" }],
    "Other KE": [{ value: "Other Kenya city", label: "Other (Kenya)" }],
  },
  ZA: {
    Gauteng: [
      { value: "Johannesburg", label: "Johannesburg" },
      { value: "Pretoria", label: "Pretoria / Tshwane" },
      { value: "Ekurhuleni", label: "Ekurhuleni" },
      { value: "Other Gauteng", label: "Other (Gauteng)" },
    ],
    "Western Cape": [
      { value: "Cape Town", label: "Cape Town" },
      { value: "Stellenbosch", label: "Stellenbosch" },
      { value: "Other WC", label: "Other (Western Cape)" },
    ],
    "KwaZulu-Natal": [
      { value: "Durban", label: "Durban / eThekwini" },
      { value: "Pietermaritzburg", label: "Pietermaritzburg" },
      { value: "Other KZN", label: "Other (KwaZulu-Natal)" },
    ],
    "Eastern Cape": [
      { value: "Gqeberha", label: "Gqeberha (Port Elizabeth)" },
      { value: "Other EC", label: "Other (Eastern Cape)" },
    ],
    "Other ZA": [{ value: "Other SA city", label: "Other (South Africa)" }],
  },
  GB: {
    England: [
      { value: "London", label: "London" },
      { value: "Manchester", label: "Manchester" },
      { value: "Birmingham", label: "Birmingham" },
      { value: "Leeds", label: "Leeds" },
      { value: "Other England", label: "Other (England)" },
    ],
    Scotland: [
      { value: "Glasgow", label: "Glasgow" },
      { value: "Edinburgh", label: "Edinburgh" },
      { value: "Other Scotland", label: "Other (Scotland)" },
    ],
    Wales: [{ value: "Cardiff", label: "Cardiff" }, { value: "Other Wales", label: "Other (Wales)" }],
    "Northern Ireland": [
      { value: "Belfast", label: "Belfast" },
      { value: "Other NI", label: "Other (Northern Ireland)" },
    ],
  },
  US: Object.fromEntries(
    NON_NG_STATE_OPTIONS.US.map(({ value }) => [
      value,
      [
        { value: `Major city (${value})`, label: `Largest metro in ${value} (coordinator may confirm)` },
        { value: `Other city (${value})`, label: `Other city in ${value}` },
      ],
    ]),
  ) as Record<string, readonly { value: string; label: string }[]>,
  OTHER: {
    "Other region": [{ value: "Coordinator follow-up", label: "To be confirmed with coordinator" }],
  },
};

export { DONOR_COUNTRIES };
