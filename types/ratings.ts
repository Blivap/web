export type BookingRatingPayload = {
  score: number;
  comment?: string;
};

export type DonorRatingItem = {
  id?: string;
  score: number;
  comment?: string | null;
  createdAt?: string | null;
};

export type DonorRatingsSummary = {
  averageRating: number;
  ratingCount: number;
  ratings?: DonorRatingItem[];
};
