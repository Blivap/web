import type { IUser } from "@/types";

/** True if the user has a donor role (case-insensitive; backend may use `Donor` or `donor`). */
export function userHasDonorRole(user: IUser | null | undefined): boolean {
  if (!user?.roles?.length) return false;
  return user.roles.some(
    (r) => typeof r === "string" && r.toLowerCase() === "donor",
  );
}
