export type ImpactEvent = {
  id: string;
  kind: "need" | "match" | "donate";
  label: string;
  meta: string;
};

export type HomeStat = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
};

export type HomeTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
};

export type CoverageCity = {
  id: string;
  label: string;
  /** Constellation position in a 0–100 viewBox (not geography). */
  x: number;
  y: number;
  /** Relative readiness 0–1 for the activity meter. */
  strength: number;
  delay: number;
};

export type CoverageLink = {
  from: string;
  to: string;
};

export const HOME_IMPACT_EVENTS: ImpactEvent[] = [
  {
    id: "1",
    kind: "need",
    label: "O+ needed in Wuse",
    meta: "Abuja · 3 mins ago",
  },
  {
    id: "2",
    kind: "match",
    label: "Match found in Garki",
    meta: "12 mins ago",
  },
  {
    id: "3",
    kind: "donate",
    label: "Donor confirmed in Lekki",
    meta: "Lagos · 18 mins ago",
  },
  {
    id: "4",
    kind: "need",
    label: "B− needed in Enugu",
    meta: "Urgent · 22 mins ago",
  },
  {
    id: "5",
    kind: "match",
    label: "Match found in Kano",
    meta: "31 mins ago",
  },
  {
    id: "6",
    kind: "need",
    label: "A+ needed in Port Harcourt",
    meta: "Rivers · 40 mins ago",
  },
  {
    id: "7",
    kind: "donate",
    label: "Donation completed in Ikeja",
    meta: "1 hr ago",
  },
  {
    id: "8",
    kind: "match",
    label: "Match found in Kaduna",
    meta: "1 hr ago",
  },
];

export const HOME_STATS: HomeStat[] = [
  {
    id: "donors",
    label: "Donors registered",
    value: 12840,
  },
  {
    id: "lives",
    label: "Lives supported",
    value: 9360,
  },
  {
    id: "match",
    label: "Avg. match time",
    value: 14,
    suffix: " min",
  },
];

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    id: "t1",
    quote:
      "I got a match in under twenty minutes when my sister needed O+. Blivap made a terrifying night manageable.",
    name: "Adaeze O.",
    role: "Recipient family",
    location: "Abuja",
  },
  {
    id: "t2",
    quote:
      "Donating used to feel complicated. Now I open the app, see who needs help nearby, and show up.",
    name: "Chinedu M.",
    role: "Verified donor",
    location: "Lagos",
  },
  {
    id: "t3",
    quote:
      "The privacy controls and verified profiles gave our hospital team confidence to coordinate faster.",
    name: "Dr. Fatima B.",
    role: "Healthcare partner",
    location: "Kano",
  },
];

/** Abstract presence network — positions are compositional, not geographic. */
export const HOME_COVERAGE_CITIES: CoverageCity[] = [
  { id: "kano", label: "Kano", x: 62, y: 18, strength: 0.72, delay: 0 },
  { id: "kaduna", label: "Kaduna", x: 54, y: 32, strength: 0.58, delay: 0.35 },
  { id: "abuja", label: "Abuja", x: 48, y: 46, strength: 0.88, delay: 0.15 },
  { id: "ibadan", label: "Ibadan", x: 28, y: 56, strength: 0.64, delay: 0.55 },
  { id: "lagos", label: "Lagos", x: 18, y: 72, strength: 0.96, delay: 0.25 },
  { id: "enugu", label: "Enugu", x: 68, y: 58, strength: 0.61, delay: 0.7 },
  {
    id: "ph",
    label: "Port Harcourt",
    x: 58,
    y: 78,
    strength: 0.7,
    delay: 0.9,
  },
];

export const HOME_COVERAGE_LINKS: CoverageLink[] = [
  { from: "lagos", to: "ibadan" },
  { from: "ibadan", to: "abuja" },
  { from: "abuja", to: "kaduna" },
  { from: "kaduna", to: "kano" },
  { from: "abuja", to: "enugu" },
  { from: "enugu", to: "ph" },
  { from: "lagos", to: "ph" },
  { from: "abuja", to: "lagos" },
];

export const HOME_URGENCY_BASE = 47;
