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
  /** Anonymous 8-character handle. */
  publicId?: string | null;
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
  /** Primary donation type cannot be booked yet, including a block with no end date. */
  isInDonationCooldown?: boolean;
  isPermanentDonationBlock?: boolean;
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
