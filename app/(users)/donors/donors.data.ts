export type BloodType =
  | "All"
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface Donor {
  id: string;
  /** Auth user id when returned by the API (for owner vs viewer UI). */
  userId?: string;
  packs: number;
  profileImage?: string | null;
  rating: number;
  donations: number;
  location: string;
  country: string;
  bloodType: Exclude<BloodType, "All">;
  activeDonationTypes: string[];
  /** ISO timestamp when donation cooldown ends; null/omitted if eligible now. */
  cooldownEndsAt?: string | null;
}

export const BLOOD_TYPES: BloodType[] = [
  "All",
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
];
