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
  packs: number;
  rating: number;
  donations: number;
  location: string;
  country: string;
  bloodType: Exclude<BloodType, "All">;
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

const BASE_DONORS: Donor[] = [
  {
    id: "012834",
    packs: 2,
    rating: 4.8,
    donations: 4,
    location: "Abuja",
    country: "Nigeria",
    bloodType: "O+",
  },
  {
    id: "013245",
    packs: 3,
    rating: 4.9,
    donations: 7,
    location: "Lagos",
    country: "Nigeria",
    bloodType: "A+",
  },
  {
    id: "010932",
    packs: 1,
    rating: 4.6,
    donations: 3,
    location: "Port Harcourt",
    country: "Nigeria",
    bloodType: "B+",
  },
  {
    id: "015678",
    packs: 2,
    rating: 4.7,
    donations: 5,
    location: "Ibadan",
    country: "Nigeria",
    bloodType: "O-",
  },
  {
    id: "017890",
    packs: 2,
    rating: 4.9,
    donations: 6,
    location: "Kano",
    country: "Nigeria",
    bloodType: "AB+",
  },
  {
    id: "019876",
    packs: 1,
    rating: 4.5,
    donations: 2,
    location: "Enugu",
    country: "Nigeria",
    bloodType: "A-",
  },
];

function generateMockDonors(count: number): Donor[] {
  const donors: Donor[] = [];
  for (let i = 0; i < count; i++) {
    const base = BASE_DONORS[i % BASE_DONORS.length];
    donors.push({
      ...base,
      id: `${base.id}-${Math.floor(i / BASE_DONORS.length) + 1}`,
    });
  }
  return donors;
}

export const ALL_DONORS: Donor[] = generateMockDonors(60);

