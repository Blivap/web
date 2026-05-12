"use client";

export type DonorRegistrationType = "blood" | "sperm" | "ovary";

export function normalizeDonorRegistrationType(
  raw: string | null,
): DonorRegistrationType {
  if (raw === "sperm" || raw === "ovary") return raw;
  return "blood";
}
